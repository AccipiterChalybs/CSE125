class TutorialDontsingEvent extends TriggerEvent {
  constructor() {
    super();
    this.triggerBool = false;
    this.name = 'dontsing';
  }

  updateComponentClient() {
    if (this.triggerBool) {
      displayTutorialBanner(this.name);
      window.setTimeout(displayTutorialBanner.bind(null, this.name, false), 5);
    }

    this.updateComponentClient = () => {};
  }

  triggered() {
    this.triggerBool = true;
  }
}
