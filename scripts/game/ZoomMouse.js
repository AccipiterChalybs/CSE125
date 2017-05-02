/**
 * Created by Stephen on 5/1/2017.
 */

const MAX_ZOOM = 5;
const MIN_ZOOM = 1;
const ZOOM_SCALE = .05;

class ZoomMouse extends Component{
  constructor(){
    super();
    this.componentType = "ZoomMouse";

    this._currentZoom = MAX_ZOOM;
  }

  updateClient(){
    let zoomAxis = Input.getAxis('zoom') * ZOOM_SCALE * -1;
    if(zoomAxis !== 0){
      this._currentZoom += zoomAxis;
      this._currentZoom = (this._currentZoom < MAX_ZOOM) ? this._currentZoom : MAX_ZOOM;
      this._currentZoom = (this._currentZoom > MIN_ZOOM) ? this._currentZoom : MIN_ZOOM;
      this.transform.setPosition(vec3.fromValues(0, 0, this._currentZoom));
    }
  }
}