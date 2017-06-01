class ClientStickTo extends Component{
  constructor(params = { target:null, offset:0 }){
    super();
    this.componentType = "ClientStickTo";
    this.setFollowObject(params.target);
    this.offset = params.offset;
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