class AnimationState {
  constructor() {
    this.parentGraph = null;     // set it!
    this.name = '';             // set it!
    this.animationIndex = -1;   // set it!
    this.neighbors = {          // set it!
      // state name: { state, transition(this is an anim index) || null }
    };

    this.loops = true;         // set optionally
    this.minTime = 0;          // set optionally, [0..1]
    // returns true if objState props satisfies condition
    this.isSatisfied = (objState) => { // set optionally
      return false;
    };
    this.isPersist = () => {  // set optionally
      return false;
    };
    this.turnAmt = 0;
    this.priority = 1;        // set optionally

    this.componentType = 'AnimationState';
  }

  loadAnimationState(stateData) {
    // not the greatest setter, requires all the work done in caller
    if ((true
      && stateData.parentGraph
      && stateData.name
      && stateData.animationIndex
      && stateData.neighbors) === undefined) {
      console.log(`Warning, animation ${stateData.name} is missing required params`);
    }

    this.parentGraph = stateData.parentGraph;
    this.name = stateData.name;
    this.animationIndex = stateData.animationIndex;
    this.neighbors = stateData.neighbors;

    this.isSatisfied = stateData.isSatisfied || this.isSatisfied;
    this.isPersist = stateData.isPersist || this.isPersist;
    this.loops = stateData.loops != undefined ? stateData.loops : this.loops;
    this.minTime = stateData.minTime != undefined ? stateData.minTime : this.minTime;
    this.priority = stateData.priority != undefined ? stateData.priority : this.priority;
    this.turnAmt = stateData.turnAmt != undefined ? stateData.turnAmt : this.turnAmt;
  }

  // returns: true if trigger happened
  resolveTrigger(objState) {
    if (objState.triggers.length > 0) {
      const nextStateName = objState.triggers[0].name;
      const nextState = this.neighbors[nextStateName].state;
      if (!nextState) {
        // trigger didnt resolve
        return false;
      }
      window.clearTimeout(objState.triggers[0].timeoutID);
      objState.triggers.shift();
      this.playState(objState, nextState);
      return true;
    }
    return false;
  }

  // returns: true if a state passively changes
  // finds first state to change to
  passiveStateChange(objState) {
    const satisfied = [];
    for (let k in objState.state.neighbors) {
      if (k === undefined) {
        continue;
      }
      // careful, possible thrashing between states
      const neighbor = objState.state.neighbors[k];
      if (neighbor.state.isSatisfied(objState)) {
        satisfied.push(neighbor);
      }
    }

    if (satisfied.length === 0) { // no nodes satisfied
      return false;
    }

    satisfied.sort((a, b) => { return b.state.priority - a.state.priority; });
    // descending
    const neighbor = satisfied[0]; // take highest priority node
    if (neighbor.transition != null) {
      objState.nextState = neighbor.state;
      objState.animation.play(neighbor.transition, false);
    } else {
      this.playState(objState, neighbor.state);
    }

    return true;
  }

  // object needs to call this to update its animations!!
  updateState(objState) {
    /* min times and transitions:
    required to finish before doing something else
    */
    if (objState.nextState) {
      // obj in transition
      if (objState.animation._playing === false) { // transition finished
        this.playState(objState, objState.nextState);
        objState.nextState = null;
      }
      return;
    }
    if (objState.animation.getAnimationProgress() < this.minTime) {
      // mintime not satisfied
      return;
    }

    /* triggers:
    are 1st to resolve
    dont have state requirements
    */
    if (this.resolveTrigger(objState)) {
      return;
    }

    /* persistancy:
    conditions for holding the state instead of changing
    */
    // if (this.isPersist(objState)) {
    //   return;
    // }

    /* passive state:
    changes are 2nd to resolve
    uses obj state to determine possible next state
    */
    if (this.passiveStateChange(objState)) {
      return;
    }
  }

  // use this to set next state, does the boilerplate stuff
  playState(objState, nextState) {
    // if (objState.state)
    //   console.log(`${objState.state.name} => ${nextState.name}:${nextState.loops}`);

    objState.state = nextState;
    objState.nextState = null;

    if (this.turnAmt != 0) { // a turn finished
      // objState.controller.transform.setRotation(quat.create());
      objState.controller.transform.rotateY(-this.turnAmt * Math.PI / 180);
      objState.animation.hardUpdate(nextState.animationIndex, nextState.loops);
    } else {
      objState.animation.play(nextState.animationIndex, nextState.loops);
    }
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
    if (!nextState) {
      console.log(`Illegal setState from ${objState.name}): doesnt exist`);
      return false;
    }

    this.playState(objState, nextState);
  }

  resetObjectState(objState) {
    objState.nextState = null;
    objState.triggers = [];
  }

  // =============== player animation graph statics ==============

  // returns wrapper for pre defined construct of an idle state
  static idleDataConstruct(parentGraph, neighbors) {
    const animationIndex = 1; // assumes idle animation at index 1
    const name = 'idle';
    const isSatisfied = (objState) => {
      return objState.moveSpeed < 0.005;
    };

    const data = {
      parentGraph,
      name,
      animationIndex,
      neighbors,
      isSatisfied,
    };
    return data;
  }

  // returns wrapper for pre defined construct of a walk state
  static walkDataConstruct(parentGraph, neighbors) {
    const animationIndex = 2; // assumes walk animation at index 2
    const name = 'walk';
    const isSatisfied = (objState) => {
      return objState.moveSpeed > 0.010 && objState.moveSpeed < 1.8;
    };

    const data = {
      parentGraph,
      name,
      animationIndex,
      neighbors,
      isSatisfied,
    };
    return data;
  }

  static runDataConstruct(parentGraph, neighbors) {
    const animationIndex = 3;
    const name = 'run';
    const isSatisfied = (objState) => {
      return objState.moveSpeed > 2.2;
    };

    const data = {
      parentGraph,
      name,
      animationIndex,
      neighbors,
      isSatisfied,
      minTime: 0,
    };
    return data;
  }

  static turn180DataConstruct(parentGraph, neighbors) {
    const animationIndex = 4;
    const name = 'turn180';
    const isSatisfied = (objState) => {
      return objState.moveDot < -.2;
    };
    const isPersist = (objState) => {
      // return objState.animation._playing[animationIndex] && objState.moveDot < .95;
      return objState.moveDot < .95;
    };
    const turnAmt = 180;

    const data = {
      parentGraph,
      name,
      animationIndex,
      neighbors,
      isSatisfied,
      isPersist,
      turnAmt,
      loops: false,
      priority: 5,
      minTime: .9,
    };
    return data;
  }

  static turn90LDataConstruct(parentGraph, neighbors) {
    const animationIndex = 5;
    const name = 'turn90L';
    const isSatisfied = (objState) => {
      return objState.moveCrossY < 0 &&
             objState.moveDot > -.2  &&
             objState.moveDot < .5;
    };
    const isPersist = (objState) => {
      return objState.animation._playing[animationIndex] && objState.moveDot < .95;
    };
    const turnAmt = -90;

    const data = {
      parentGraph,
      name,
      animationIndex,
      neighbors,
      isSatisfied,
      isPersist,
      turnAmt,
      loops: false,
      priority: 5,
      minTime: .9,
    };
    return data;
  }

    static turn90RDataConstruct(parentGraph, neighbors) {
    const animationIndex = 6;
    const name = 'turn90R';
    const isSatisfied = (objState) => {
      return objState.moveCrossY > 0 &&
             objState.moveDot > -.2  &&
             objState.moveDot < .3;
    };
    const isPersist = (objState) => {
      return objState.animation._playing[animationIndex] && objState.moveDot < .95;
    };
    const turnAmt = 90;

    const data = {
      parentGraph,
      name,
      animationIndex,
      neighbors,
      isSatisfied,
      isPersist,
      turnAmt,
      loops: false,
      priority: 5,
      minTime: .9,
    };
    return data;
  }

    static slideDataConstruct(parentGraph, neighbors) {
    const animationIndex = 7;
    const mame = 'slide';
    const isSatisfied = (objState) => {
      // expects on trigger
    };

    const data = {
      parentGraph,
      name,
      animationIndex,
      neighbors,
      isSatisfied,
      loops: false,
      minTime: .8,
      priority: 3,
    };
    return data;
  }

    static lookBackDataConstruct(parentGraph, neighbors) {
    const animationIndex = 8;
    const name = 'lookBack';
    const isSatisfied = (objState) => {
      return; // nothing for now TODO
    };

    const data = {
      parentGraph,
      name,
      animationIndex,
      neighbors,
      isSatisfied,
      loops: false,
      minTime: .99,
      priority: 100,
    };
    return data;
  }

    static sneakLDataConstruct(parentGraph, neighbors) {
    const animationIndex = 9;
    const name = 'sneakL';
    const isSatisfied = (objState) => {
      return objState.sneak           &&
             objState.wallNCrossY < 0 &&
             objState.wallNDot > -.2  &&
             objState.wallNDot < .5;
    };

    const data = {
      parentGraph,
      name,
      animationIndex,
      neighbors,
      isSatisfied,
      priority: 10,
    };
    return data;
  }

    static sneakRDataConstruct(parentGraph, neighbors) {
    const animationIndex = 10;
    const stateName = 'sneakR';
    const isSatisfied = (objState) => {
      return objState.sneak           &&
             objState.wallNCrossY > 0 &&
             objState.wallNDot > -.2  &&
             objState.wallNDot < .5;
    };

    const data = {
      parentGraph,
      name,
      animationIndex,
      neighbors,
      isSatisfied,
      priority: 10,
    };
    return data;
  }
}

AnimationState.playerDataConstruct = {
  bind: AnimationState.idleDataConstruct, // not really used
  idle: AnimationState.idleDataConstruct,
  walk: AnimationState.walkDataConstruct,
  run: AnimationState.runDataConstruct,
  turn180: AnimationState.turn180DataConstruct,
  turn90L: AnimationState.turn90LDataConstruct,
  turn90R: AnimationState.turn90RDataConstruct,
  slide: AnimationState.slideDataConstruct,
  lookBack: AnimationState.lookBackDataConstruct,
  sneakL: AnimationState.sneakLDataConstruct,
  sneakR: AnimationState.sneakRDataConstruct,
};
