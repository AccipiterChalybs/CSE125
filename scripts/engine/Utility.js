/**
 * Created by Stephen on 5/2/2017.
 */

let Utility = {};

Utility.sqr = function(x){
  return x * x;
};

Utility.distanceSqrd2D = function(a, b){
  return Utility.sqr(a[0] - b[0]) + Utility.sqr(a[2] - b[2]);
};

Utility.lerp = function(a, b, t){
  t = t > 1 ? 1 : t < 0 ? 0 : t;
  return (1 - t) * a + t * b;
};

Utility.lerpUnclamped = function(a, b, t){
  return (1 - t) * a + t * b;
};

Utility.moveTowards = function(a, b, delta){
  if(a === b) return a;

  let val = 0;

  if(a < b){
    val = a + delta;
    if(val > b) return b;
  }else{
    val = a - delta;
    if(val < b) return b;
  }

  return val;
};

Utility.randomIntFromInterval = function(min,max)
{
  // Code from http://stackoverflow.com/questions/4959975/generate-random-number-between-two-numbers-in-javascript
  return Math.floor(Math.random()*(max-min+1)+min);
};

Utility.vec3 = {};

Utility.vec3.moveTowards = function(a, b, delta){
  if(vec3.distance(a, b) < delta){
    return b;
  }

  let dir = vec3.create(); vec3.subtract(dir, b, a);
  vec3.normalize(dir, dir);
  vec3.scale(dir, dir, delta);

  return vec3.add(dir, a, dir);
};