class ClientStickTo extends Component{
  constructor({target=null, offset}){
    super();
    this.componentType = "ClientStickTo";
    this.setFollowObject(target);
    this.offset = offset;
  }

  setFollowObject(target) {
    this.target = target;
  }

  updateClient(){
    if (this.target !== null) {
      this.transform.setPosition(vec3.add(vec3.create(), this.target.transform.getWorldPosition(), this.offset));
    }
  }
}