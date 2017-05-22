class AnimationState extends Component {
  constructor() {
    super();

    this.ownerGraph = null;     // set it!
    this.name = '';             // set it!
    this.animationIndex = -1;   // set it!
    this.neighbors = {          // set it!
      // state name: { state, transition(this is an anim index) || null }
    };

    this.minTime = 0; // set optionally

    this.componentType = 'AnimationState';
  }

  loadAnimationState(animStateData) {
    this.name = animStateData.name;
    this.isSatisfied = animStateData.isSatisfied || this.isSatisfied;
    this.neighbors = animStateData.neighbors;
    this.minTime = animStateData.minTime || this.minTime;
  }

  // returns true if objState props satisfies condition
  isSatisfied(objState) {
    return false;
  }


  // returns: true if trigger is true
  resolveTrigger(objState) {
    if (objState.trigger.length > 0) {
      const nextStateName = objState.trigger[0];
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
    for (let k in objState.neighbors) {
      if (!k) {
        continue;
      }
      // careful, possible thrashing between states
      const neighbor = objState.neighbors[k];
      if (neighbor.state.isSatisfied(objState)) {
        if (neighbor.transition != null) {
          objState.nextState = neighbor.state;
          // TODO set objState.animation with
          // global animations array[this.neighbor.transtion]
          this.animation.play('todo some transition animation here', false);
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
      if (objState.animation._playing === false) {
        this.playState(objState.state, nextState);
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
    objState.state = nextState;
    // TODO set objState.animation with
    // global animations array[this.animationindex]
    objState.animation.play('todo some animation here', 'if looping');
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

    const nextState = this.parentGraph.animGraph[nextStateName];
    if(!nextState) {
      console.log('Illegal setState from...[tbi]');
      return false;
    }

    this.playState(objState.state, nextState);
    objState.triggers = [];
    // set stuff related to the state
  }
}
