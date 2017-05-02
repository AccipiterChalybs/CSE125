/**
 * Created by Stephen on 5/2/2017.
 */

let Utility = {};

Utility.lerp = function(a, b, t){
  t = t > 1 ? 1 : t < 0 ? 0 : t;
  return (1 - t) * a + t * b;
};

Utility.lerpUnclamped = function(a, b, t){
  return (1 - t) * a + t * b;
};

Utility.moveTowards = function(a, b, delta){
  if(a === b) return a;

  let val = a + delta;
  if(delta > 0){
    if(val > b) return b;
  }else if(delta < 0){
    if(val < b) return b;
  }

  return val;
};