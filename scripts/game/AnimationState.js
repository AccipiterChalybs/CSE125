class AnimationState {
  constructor() {
    this.parentGraph = null;     // set it!
    this.name = '';             // set it!
    this.animationIndex = -1;   // set it!
    this.neighbors = {          // set it!
      // state name: { state, transition(this is an anim index) || null }
    };

    this.loops = false;         // set optionally
    this.minTime = 0;           // set optionally
    // returns true if objState props satisfies condition
    this.isSatisfied = function (objState) { // set optionally
      return false;
    };

    this.componentType = 'AnimationState';
  }

  loadAnimationState(animStateData) {
    // not the greatest setter, requires all the work done in caller
    if ((true
      && animStateData.parentGraph
      && animStateData.name
      && animStateData.animationIndex
      && animStateData.neighbors) === undefined) {
      console.log(`Warning, animation ${animStateData.name} is missing required params`);
    }

    this.parentGraph = animStateData.parentGraph;
    this.name = animStateData.name;
    this.animationIndex = animStateData.animationIndex;
    this.neighbors = animStateData.neighbors;

    this.isSatisfied = animStateData.isSatisfied || this.isSatisfied;
    this.loops = animStateData.loops || this.loops;
    this.minTime = animStateData.minTime || this.minTime;
  }

  // returns: true if trigger happened
  // TODO truncate triggers once in a while
  // TODO discard repeat triggers (?)
  resolveTrigger(objState) {
    if (objState.triggers.length > 0) {
      const nextStateName = objState.triggers[0];
      const nextState = this.neighbors[nextStateName].state;
      if (!nextState) {
        // trigger didnt resolve
        return false;
      }
      this.playState(objState, nextState);
      return true;
    }
    return false;
  }

  // returns: true if a state passively changes
  // finds first state to change to
  passiveStateChange(objState) {
    for (let k in objState.state.neighbors) {
      if (k === undefined) {
        continue;
      }
      // careful, possible thrashing between states
      const neighbor = objState.state.neighbors[k];
      if (neighbor.state.isSatisfied(objState)) {
        if (neighbor.transition != null) {
          objState.nextState = neighbor.state;
          objState.animation.play(neighbor.transition, false);
        } else {
          this.playState(objState, neighbor.state);
        }
        return true;
      }
    }
    return false;
  }

  // object needs to call this to update its animations!!
  updateState(objState) {
    /* min times and transitions:
    required to finish before doing something else
    */
    if (objState.nextState) {
      // obj in transition
      if (objState.animation._playing === false) { // transition finished
        this.playState(objState.state, nextState);
        objState.nextState = null;
      }
      return;
    }
    if (objState.animation._currentTime < this.minTime) {
      // mintime not satisfied
      return;
    }

    /* triggers:
    are 1st to resolve
    dont have state requirements
    */
    if(this.resolveTrigger(objState)) {
      return;
    }

    /* passive state:
    changes are 2nd to resolve
    uses obj state to determine possible next state
    */
    if(this.passiveStateChange(objState)) {
      return;
    }
  }

  // use this to set next state, does the boilerplate stuff
  playState(objState, nextState) {
    // console.log(objState);
    // console.log(nextState);
    objState.state = nextState;
    objState.nextState = null;
    objState.animation.play(nextState.animationIndex, nextState.loops);
  }

  // override state with new state
  setState(objState, nextStateName) {
    /* objState
      {
        state related vars...
        state:
        triggers:
      }
    */
    const nextState = this.parentGraph.animStates[nextStateName];
    if(!nextState) {
      console.log(`Illegal setState from ${objState.name}): doesnt exist`);
      return false;
    }

    this.playState(objState, nextState);
  }

  resetObjectState(objState) {
    objState.nextState = null;
    objState.triggers = [];
  }

  // returns pre defined construct for an idle state
  static idleDataConstruct(parent, neighbors) {
    const idleAnimIndex = 1; // assumes idle animation at index 1

    const idleData = {
      parentGraph: parent,
      name: 'idle',
      animationIndex: idleAnimIndex,
      neighbors,
      isSatisfied: (objState) => {
        if (objState.moveAmt < 0.005)
          return true;
        return false;
      },
      loops: true,
    };

    return idleData;
  }

  // returns pre defined construct for walking state
  static walkingDataConstruct(parent, neighbors) {
    const walkingAnimIndex = 2; // assumes walking animation at index 1

    const walkingData = {
      parentGraph: parent,
      name: 'walking',
      animationIndex: walkingAnimIndex,
      neighbors,
      isSatisfied: (objState) => {
        if (objState.moveAmt > 0.010)
          return true;
        return false;
      },
      loops: true,
    };

    return walkingData;
  }
}
