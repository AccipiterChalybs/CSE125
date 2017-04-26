/**
 * Created by Accipiter Chalybs on 4/13/2017.
 */

let Debug = {};

Debug.clientUpdate = false;
Debug.bufferDebugMode = false;

Debug.assert = function(shouldBeTrue) {
  if (shouldBeTrue === false) {
    throw new Error("Assertion Failed");
  }
};

Debug._timer = 0;
Debug.startTimer = function () {
  Debug._timer = new Date().getTime();
};

Debug.getTimerDuration = function(name) {
  let duration = new Date().getTime() - Debug._timer;
  console.log(name + " " + duration);
  return duration;
};

// Debugging bools for collision
Debug.collision = {};
Debug.collision.printInfo = false;
Debug.collision._infoTypes = {all: "all", triggerOnly: "triggerOnly", nonTriggerOnly: "nonTriggerOnly"}; // 'all' is default
Debug.collision._currInfoType = Debug.collision._infoTypes.all;

Debug.printCollisionInfo = function(collisionEvent, gameObject, isTrigger){
  switch(Debug.collision._currInfoType){
    case Debug.collision._infoTypes.triggerOnly:
      if(isTrigger){
        console.log("TRIGGER event. (" + gameObject.name + ")");
        console.log("\tCollided with body:", collisionEvent.body);
        console.log("\tContact between bodies:", collisionEvent.contact);
      }
      break;
    case Debug.collision._infoTypes.nonTriggerOnly:
      if(!isTrigger){
        console.log("COLLISION event. (" + gameObject.name + ")");
        console.log("\tCollided with body:", collisionEvent.body);
        console.log("\tContact between bodies:", collisionEvent.contact);
      }
      break;
    default:
      if(isTrigger)
        console.log("TRIGGER event. (" + gameObject.name + ")");
      else
        console.log("COLLISION event. (" + gameObject.name + ")");

      console.log("\tCollided with body:", collisionEvent.body);
      console.log("\tContact between bodies:", collisionEvent.contact);
      break;
  }
};
