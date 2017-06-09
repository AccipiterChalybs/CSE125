class TutorialWalkEvent extends TriggerEvent {
  constructor() {
    super();
    this.triggerBool = false;
    this.alreadyTriggered = false;

    this.name = 'walk';
  }

  updateComponentClient() {
    if (this.triggerBool&& !this.alreadyTriggered) {
      this.alreadyTriggered = true;

      displayTutorialBanner(this.name);
      window.setTimeout(
        displayTutorialBanner.bind(null, this.name, false),
        5000
      );
    }

  }

  triggered() {
    this.triggerBool = true;
  }
}