/**
 * Created by ajermaky on 6/7/17.
 */
class WinEvent extends TriggerEvent{
  constructor(){
    super();
    this.componentType = 'TriggerEvent';
  }

  triggered(){
    Networking.socket.emit('win',{sceneName: GameEngine.sceneFile});
  }
}