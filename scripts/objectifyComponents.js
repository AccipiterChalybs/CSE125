const fs = require('fs');
const path = require('path');
const glm = require('./glMatrix-2.3.2.min.js');

const vec3 = glm.vec3;
const mat4 = glm.mat4;
const quat = glm.quat;
const IS_SERVER = true;
const FILTER_DEFAULT = false;

const componentsClasses = [
  'AIController', 'Animation',
  'AudioListener', 'AudioSource', 'BoxCollider',
  'Camera', 'ClientStickTo', 'CompoundCollider',
  'Decal', 'Light', 'PointLight', 'DirectionalLight', 'SpotLight',
  'SphereCollider', 'Transform',
];

const gameClasses = [
  'DoorEvent', 'Event', 'EvilController', 'HealEvent', 'KeyEvent',
  'Listenable', 'Look', 'PlayerController', 'RaycastSwitch',
  'RotateArrowKey', 'RotateMouse', 'RotateOverTime', 'Sing',
  'SingingSwitch', 'TriggerTest', 'Viewable', 'ZoomMouse',
];

const allClasses = componentsClasses.concat(gameClasses);

const dependencyPaths = [
  path.join('engine', 'Component.js'),
  path.join('engine', 'Renderer.js'),
  path.join('engine', 'components', 'Collider.js'),
  path.join('game', 'Event.js'),
  path.join('game', 'Viewable.js'),
  path.join('engine', 'components', 'AIController.js'),
  // 'glMatrix-2.3.2.min.js',
  'cannon.min.js',
  'howler.core.min.js',
  'howler.spatial.min.js',
];

const typeConv = {
  number: 'float',
  boolean: 'bool',
  object: 'object',
  string: 'string',
};

// load dependency
const dependencyStrs = dependencyPaths.map((p) => {
  return fs.readFileSync(p).toString();
});

// load components
const componentsDir = path.join('engine', 'components');
const componentsStrs = [];
fs.readdirSync(componentsDir).forEach((file) => {
  const p = path.join(componentsDir, file);
  if (dependencyPaths.indexOf(p) > 0) {
    return;
  }
  componentsStrs.push(fs.readFileSync(p).toString());
});

// load game components
const gameDir = path.join('game');
const gameStrs = [];
fs.readdirSync(gameDir).forEach((file) => {
  const p = path.join(gameDir, file);
  if (dependencyPaths.indexOf(p) > 0) {
    return;
  }
  gameStrs.push(fs.readFileSync(p).toString());
});

const evalPostlude = `const o = {${allClasses}}; o`;

// eval every class and return an object with every class definition
const mergedStrs =
  dependencyStrs.join('\n') + componentsStrs.join('\n') + gameStrs.join('\n');
const o = eval(mergedStrs + evalPostlude);


module.exports = {
  componentsClasses,
  gameClasses,
  allClasses,
  typeConv,
  o,
};
