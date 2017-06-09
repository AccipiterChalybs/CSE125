class ObjectLogicState {
  constructor() {
    this.animation = null;  // set it!

    this.state = null;      // animationState
    this.nextState = null;  // next animationState
    // if nextState exists, after animation finishes, go to next state

    this.triggers = [];     // [{ name, timeoutID }, ...]

    this.componentType = 'ObjectLogicState';
  }

  setTrigger(animState) {
    // skips immediate duplicates
    if(this.triggers[this.triggers.length - 1].name === animState) {
      return;
    }
    const toid = window.setTimeout(this.triggers.shift, .5);
    this.triggers.push({ name: animState, timeoutID: toid });
  }

  firstTriggerName() {
    return this.triggers[0].name;
  }
}
