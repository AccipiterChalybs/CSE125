class ObjectLogicState {
  constructor() {
    this.animation = null;  // set it!

    this.state = null;      // animationState
    this.nextState = null;  // next animationState
    // if nextState exists, after animation finishes, go to next state

    this.triggers = [];

    this.componentType = 'ObjectLogicState';
  }
}
