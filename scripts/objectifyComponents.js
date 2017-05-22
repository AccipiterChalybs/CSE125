const fs = require('fs');
const path = require('path');
const glm = require('./glMatrix-2.3.2.min.js');

const vec3 = glm.vec3;
const mat4 = glm.mat4;
const quat = glm.quat;

const componentsClasses = [
  'AudioListener', 'AudioSource',
  'Camera', 'Light', 'PointLight', 'DirectionalLight',
  'SpotLight', 'Transform',
];

const dependencyPaths = [
  path.join('engine', 'Component.js'),
  path.join('engine', 'Renderer.js'),
  path.join('engine', 'components', 'Collider.js'),
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
// make components look like objects
function objectify(s) {
  return `'${s}': ${s}`;
}
const evalPostlude = `const o={${componentsClasses.map(objectify)}}; o`;

// eval every class and return an object with every class definition
const mergedStrs = dependencyStrs.join('\n') + componentsStrs.join('\n');
const o = eval(mergedStrs + evalPostlude);


module.exports = {
  componentsClasses,
  typeConv,
  o,
};
