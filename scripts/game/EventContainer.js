class EventContainer extends Component{
  constructor({ events }){
    super();
    this.componentType = "EventContainer";
    this.events = events;
  }

  start(){
    let go = this.transform.gameObject;
    for(let event of this.events){
      event._setGameObject(go)
    }
  }

  updateComponent(){
    for(let event of this.events){
      event.updateComponent();
    }
  }
}