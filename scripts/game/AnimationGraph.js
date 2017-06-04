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

  // return list of neighbors from adjacency matrix
  static getNeighbors(animIdx, anim, mtx) {
    const neighbors =
      mtx[anim]
      .map((val, i) => { return val ? animIdx[i] : val; })
      .filter((val) => { return val; });

    return neighbors;
  }

  // pre defined player animation graph, call to load player animation
  static loadPlayerAnimationGraph() {
    /*
    Animation indices: */
    const animIdx = [
      'bind',       // 0 - not used in graph
      'idle',       // 1
      'walk',       // 2
      'run',        // 3
      'turn180',    // 4
      'turn90L',    // 5
      'turn90R',    // 6
      'slide',      // 7
      'lookBack',   // 8
      'sneakL',     // 9
      'sneakR'      // 10
    ];

    const name = 'player'; // name of graph
    const g = new AnimationGraph();

    // construct empty states to fill
    const states = {};
    animIdx.map((v) => {
      states[v] = new AnimationState();
    });
    // neighbor representation
    const neighbors = {};
    animIdx.map((v) => {
      neighbors[v] = { state: states[v], transition: null };
    });
    // adjacency matrix
    const adjMtx = [
    // b  i  w  r  t  t  t  s  l  s  s    // < to, from v
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],  // bind
      [0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0],  // idle
      [0, 1, 0, 1, 1, 1, 1, 1, 0, 1, 1],  // walk
      [0, 1, 1, 0, 1, 1, 1, 1, 0, 1, 1],  // run
      [0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0],  // turn180
      [0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0],  // turn90L
      [0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0],  // turn90R
      [0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0],  // slide
      [0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0],  // lookBack
      [0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 1],  // sneakL
      [0, 1, 1, 1, 0, 0, 0, 0, 0, 1, 0],  // sneakR
    ];

    // state data construct
    const dataConstruct = {};
    animIdx.map((name, i) => {
      // replaces 1s with the names of the neighbor
      const nbrList = adjMtx[i]
        .map((edge, j) => { return edge ? animIdx[j] : 0; })
        .filter((edge) => { return edge; })
      ;
      // put all neighbor represenations for a list of neighbors into object
      const nbrObj = {};
      nbrList.map((nbr) => { nbrObj[nbr] = neighbors[nbr]; });

      dataConstruct[name] = AnimationState.playerDataConstruct[name](g, nbrObj);
    });

    for (let name in states) {
      states[name].loadAnimationState(dataConstruct[name]);
    }

    console.log(states);

    AnimationGraph.loadAnimationGraph(name, states, g);
  }
}

AnimationGraph.prototype.graphs = {};