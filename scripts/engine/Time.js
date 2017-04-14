/**
 * Created by Accipiter Chalybs on 4/5/2017.
 */

const Time = {
  _previousTime: new Date(),
  tick: function () {
    //TODO add threshold
    Time.deltaTime = ((new Date()).getTime() - Time._previousTime.getTime()) / 1000;
    Time._previousTime = new Date();
  },

  deltaTime: 0,
};
