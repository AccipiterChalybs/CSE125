/**
 * Created by Stephen on 5/2/2017.
 */

class Look extends Component{
  constructor(params = {range: 5}) {
    super();
    this.componentType = "Look";

    this.range = params.range;
  }

  start() {
    //console.log(PhysicsEngine.sphereChecks);
  }

  updateComponent() {

  }

  look() {
    //HACK need more robust but is dank
    let hit = {};
    if (PhysicsEngine.raycastClosest(Renderer.camera.transform.getWorldPosition(), Renderer.camera.transform.getForward(), this.range, 63 - FILTER_PLAYER, hit))
    {
      // Debug.log("hello ", hit.collider.gameObject.id, hit.position);
      // Debug.drawTeapot(hit.position);
      let seen = hit.collider.gameObject.getComponent('Viewable');
      // Debug.log(hit);
      if (seen && seen !== null)
      {
        Debug.log("I SAW HERE THERE SHE GOES");
        seen.view(this.transform.gameObject);
      }
    }
  }
}
