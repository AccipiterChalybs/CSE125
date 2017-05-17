/**
 * Created by Stephen on 4/25/2017.
 */


/* Use this to define behavior
 *
 * ai should be of type 'AIController'
 */
class BehaviorTreeLeaf extends BehaviorTreeNode{
  constructor(nodeType = "LEAF", name = "UNNAMED", ai = null){
    super(nodeType, name);
    this.ai = ai;
  }
}