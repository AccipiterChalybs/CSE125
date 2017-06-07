class TutorialSingEvent extends RaycastEvent {
  constructor() {
    super();
    this.triggerBool = false;
    this.name = 'sing'
  }

  updateComponentClient() {
    if (this.triggerBool) {
      window.setTimeout(displayTutorialBanner.bind(null, this.name), 2)
      window.setTimeout(displayTutorialBanner.bind(null, this.name, false), 7);
    }

    this.updateComponentClient = () => {};
  }

  triggered() {
    this.triggerBool = true;
  }
}
