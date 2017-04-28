class AudioListener extends Component{
  constructor() {
    super();
    this.componentType = 'AudioListener';
  }

  updateClient() {
    let cameraAPos = this.transform.getWorldPosition();
    let cameraOrientation = this.transform.getForward();
    Howler.pos(cameraAPos[0], cameraAPos[1], cameraAPos[2]);
    Howler.orientation(cameraOrientation[0], cameraOrientation[1], cameraOrientation[2]);
  }
}
