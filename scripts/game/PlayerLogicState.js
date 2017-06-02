class PlayerLogicState extends ObjectLogicState {
  constructor() {
    super();

    // ========= state vars start ==========
    this.status = '';
    this.moveSpeed = 0;
    this.moveDot = 0;
    this.moveCrossY = 0;
    // this.slide = false;
    this.sneak = false;
    this.wallNDot = 0;
    this.wallNCrossY = 0;
    // ========== state vars end ===========

    this.animationGraph = null;

    this.componentType = 'PlayerLogicState';
  }

  start(go) {
    this.animation = go.getComponent('Animation');

    // build animation graph
    if (this.animation) {
      // only give it a graph if it has animations
      this.animationGraph = AnimationGraph.prototype.graphs['player'];
      this.animationGraph.setState(this, 'idle');
    } else {
      this.update = () => {}; // no animation, no update
    }
  }

  update() {
    this.state.updateState(this);
  }
}
