class TutorialSingEvent extends RaycastEvent {
  constructor() {
    super();
    this.triggerBool = false;
    this.alreadyTriggered = false;

    this.name = 'sing'
  }

  updateComponentClient() {
    if (this.triggerBool&& !this.alreadyTriggered) {
      this.alreadyTriggered = true;

      window.setTimeout(displayTutorialBanner.bind(null, this.name), 2000)
      window.setTimeout(
        displayTutorialBanner.bind(null, this.name, false),
        7000
      );
    }

  }

  triggered() {
    this.triggerBool = true;
  }
}
