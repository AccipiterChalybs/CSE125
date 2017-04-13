/**
 * Created by Accipiter Chalybs on 4/13/2017.
 */

let Debug = {};

Debug._timer = 0;
Debug.startTimer = function () {
    Debug._timer = new Date().getTime();
};

Debug.getTimerDuration = function(name) {
    let duration = new Date().getTime() - Debug._timer;
    console.log(name + " " + duration);
    return duration;
};