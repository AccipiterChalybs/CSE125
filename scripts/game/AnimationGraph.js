class AnimationGraph {
  constructor() {
    this.name = '';
    this.animStates = {};
    /* animStates
      {
        animationState name: animationState,
        ...
      }
    */
    this.componentType = 'AnimationGraph';
  }

  // override state with new state
  setState(objState, nextStateName) {
    const nextState = this.animStates[nextStateName];
    if(!nextState) {
      console.log(`Illegal setState(${nextStateName}): doesnt exist`);
      return false;
    }

    nextState.setState(objState, nextStateName); // modifies state and animation
  }

  // creates the animation graph global var
  static loadAnimationGraph(graphName, states, animGraph = null) {
    const g = animGraph || new AnimationGraph();
    g.name = graphName;
    g.animStates = states; // TODO?

    AnimationGraph.prototype.graphs[graphName] = g;
  }

  // pre defined player animation graph, call to load player animation
  static loadPlayerAnimationGraph() {
    /*
    Animation indices:
      1 - idle
      2 - walking

    Logic vars required:
      moveSpeed
    */
    const name = 'player';
    const g = new AnimationGraph();

    const idle = new AnimationState();
    const walking = new AnimationState();

    // nodes in graph
    const idleNode = {
      state: idle,
      transition: null,
    }
    const walkingNode = {
      state: walking,
      transition: null,
    }

    // idle state
    const idleData =
      AnimationState.idleDataConstruct(g, { walking: walkingNode });
    idle.loadAnimationState(idleData);
    // walking state
    const walkingData =
      AnimationState.walkingDataConstruct(g, { idle: idleNode });
    walking.loadAnimationState(walkingData);

    AnimationGraph.loadAnimationGraph(name, { idle, walking }, g);
  }
}

AnimationGraph.prototype.graphs = {};