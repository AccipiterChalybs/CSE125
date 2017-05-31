class PlayerLogicState extends ObjectLogicState {
  constructor() {
    super();

    // state vars start
    this.status = '';
    this.moveSpeed = 0;
    this.moveAmt = 0;
    // state vars end

    this.animationGraph = null;

    this.componentType = 'PlayerLogicState';
  }

  start(go) {
    // console.log('set animation');
    // console.log(go);
    this.animation = go.getComponent('Animation');
    if (this.animation) {
      // only give it a graph if it has animations
      // because apparently it sometimes doesnt
      this.animationGraph = AnimationGraph.prototype.graphs['player'];
      this.animationGraph.setState(this, 'idle'); //???
    } else {
      this.update = () => {};
    }
  }

  update() {
    this.state.updateState(this);
  }
}
