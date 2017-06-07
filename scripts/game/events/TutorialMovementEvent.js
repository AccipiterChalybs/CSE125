class TutorialMovementEvent extends TriggerEvent {
  constructor() {
    super();
    this.triggerBool = false;
    this.name = 'movement';
  }

  updateComponentClient() {
    if (this.triggerBool) {
      displayTutorialBanner(this.name);
      window.setTimeout(
        displayTutorialBanner.bind(null, this.name, false),
        5000
      );
    }

    this.updateComponentClient = () => {};
  }

  triggered() {
    this.triggerBool = true;
  }
}
