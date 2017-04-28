class ClientStickTo extends Component{
  constructor(target=null){
    super();
    this.componentType = "ClientStickTo";
    this.setFollowObject(target);
  }

  setFollowObject(target) {
    this.target = target;
  }

  updateClient(){
    if (this.target !== null) {
      this.transform.setPosition(this.target.transform.getWorldPosition());
    }
  }
}