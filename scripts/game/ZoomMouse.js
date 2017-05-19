/**
 * Created by Stephen on 5/1/2017.
 */

const MAX_ZOOM = 7.5;
const MIN_ZOOM = 1;
const ZOOM_SCALE = 0.05;

class ZoomMouse extends Component{
  constructor(){
    super();
    this.componentType = "ZoomMouse";

    this.currentZoom = MAX_ZOOM;
  }

  updateClient(){
    let zoomAxis = Input.getAxis('zoom') * ZOOM_SCALE * -1;
    if(zoomAxis !== 0){
      this.currentZoom += zoomAxis;
      this.currentZoom = (this.currentZoom < MAX_ZOOM) ? this.currentZoom : MAX_ZOOM;
      this.currentZoom = (this.currentZoom > MIN_ZOOM) ? this.currentZoom : MIN_ZOOM;
    }
  }
}