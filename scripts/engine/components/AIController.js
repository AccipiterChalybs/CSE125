/**
 * Created by Stephen on 4/25/2017.
 */

class AIController extends Component{
  constructor(){
    super();
    this.componentType = "AIController";
  }

  start(){
    this.rootBehavior = this._buildBehaviorTree();
  }

  updateComponent(){
    this.rootBehavior.updateNode();
  }

  _buildBehaviorTree(){
  }
}