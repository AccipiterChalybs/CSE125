class TutorialSingEvent extends RaycastEvent {
  constructor() {
    super();
    this.triggerBool = false;
    this.name = 'sing'
  }

  updateComponentClient() {
    if (this.triggerBool) {
      window.setTimeout(displayTutorialBanner.bind(null, this.name), 2000)
      window.setTimeout(
        displayTutorialBanner.bind(null, this.name, false),
        7000
      );
    }

    this.updateComponentClient = () => {};
  }

  triggered() {
    this.triggerBool = true;
  }
}
