class TutorialActionEvent extends TriggerEvent {
  constructor() {
    super();
    this.triggerBool = false;
    this.name = 'action';
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
