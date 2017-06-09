/**
 * Created by ajermaky on 6/6/17.
 */
class SimonSays extends Event{

  constructor(params = { unparsedStatues:null, order: null, singDuration: 5, cycleDuration: 5 }) {
    super();
    this.componentType = 'SimonSays';

    this._statues = [];
    this._unparsedStatues = params.unparsedStatues;
    this._order = params.order;
    this._currentIndex = 0;
    this._currentTime = 0;
    this._singDuration = params.singDuration;
    this._cycleDuration = params.cycleDuration;
    this._cycle = false;

    this._simonLock = false;
    this._listenedOrder = [];
  }

  start() {
    for (let i = 0; i < this._unparsedStatues.length; ++i) {
      this._statues.push(GameObject.prototype.SerializeMap[this._unparsedStatues[i]]);
    }

  }

  updateComponent() {
    // Debug.log(this._listenedOrder);
    if(this._simonLock && this._currentTime +this._cycleDuration <Time.time){
      this._simonLock = false;
    }
    if(!this._simonLock && this._listenedOrder.length>0){
      this._currentTime = Time.time;
      let currentStatue = this._statues[this._order[this._currentIndex]];
      if (currentStatue && currentStatue !== null) {
        let sing = currentStatue.getComponent('Sing');
        if (sing && sing !== null) {
          sing.quiet();
        }
      }

      if(this._listenedOrder.length === this._order.length){
        if(JSON.stringify(this._listenedOrder) === JSON.stringify(this._order)){
          Debug.log("BIG WINNER");
          this._listenedOrder = [];
          this._simonLock=true;
        }
        else
        {
          Debug.log("SO SORRY");
          this._listenedOrder = [];
          this._currentTime = Time.time;
          this._simonLock = true;
        }
      }

      for(let statueOrder in this._statues){
        if(this._listenedOrder.indexOf(Number(statueOrder)) !== -1){
          this._statues[statueOrder].getComponent("Light").setRange(5);
        }
        else{
          this._statues[statueOrder].getComponent("Light").setRange(0);
        }
      }
    }else{
      this.simonIsSaying();

    }


  }

  simonHeard(statue_id){
    if(!this._simonLock) {
      let id = this._unparsedStatues.indexOf(statue_id);
      if (!this.simonHasHeard(id)) {
        this._listenedOrder.push(id);
      }
    }
  }

  simonHasHeard(order_id){
    let id = this._listenedOrder.indexOf(order_id);
    return id !== -1;

  }

  simonIsSaying() {
    if (this._cycle) {
      if (this._currentTime + this._singDuration < Time.time) {
        this._currentTime = Time.time;
        let currentStatue = this._statues[this._order[this._currentIndex]];
        if (currentStatue && currentStatue !== null) {
          let sing = currentStatue.getComponent('Sing');
          if (sing && sing !== null) {
            sing.quiet();
          }
        }

        this._currentIndex += 1;
        if (this._currentIndex === this._order.length) {
          this._cycle = false;
        } else {
          currentStatue = this._statues[this._order[this._currentIndex]];
          if (currentStatue && currentStatue !== null) {
            let sing = currentStatue.getComponent('Sing');
            if (sing && sing !== null) {
              sing.sing();
            }
          }
        }
      }
    } else if (this._currentTime + this._cycleDuration < Time.time) {
      // Debug.log("are we ever here");
      this._cycle = true;
      this._currentTime = Time.time;
      this._currentIndex = 0;
      let currentStatue = this._statues[this._order[this._currentIndex]];
      if (currentStatue && currentStatue !== null) {
        let sing = currentStatue.getComponent('Sing');
        if (sing && sing !== null) {
          sing.sing();
        }
      }
    } else {
      // Debug.log("Waiting");
    }
  }
}
