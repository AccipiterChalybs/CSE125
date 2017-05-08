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

function isArray(a) {
  const type = Object.getPrototypeOf(a).constructor.name;
  if (type.search('Array') >= 0) {
    return true;
  }
  return false;
}

function formatVar(type, prop, data) {
  let out = `\tpublic ${type} ${prop} = `;
  if (data === null) {
    out += `${data};`;
  } else if (type === 'string') {
    out += `"${data}"`;
  } else if (isArray(data)) {
    out += `[${data}];`;
  } else {
    out += `${data};`;
  }
  return out;
}

// unity class file template
const unityPrelude = 'using System.Collections;\n' +
                     'using System.Collections.Generic;\n' +
                     'using UnityEngine;\n';
function createUnityClass(obj) {
  const lines = [unityPrelude];
  lines.push(`public class ${obj.constructor.name} : MonoBehavior {`);
  for (const prop in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, prop)) {
      const type = typeConv[typeof obj[prop]];
      if (type === undefined) {
        console.log(`${prop} of type ${typeof obj[prop]} is undef`);
      }
      lines.push(formatVar(type, prop, obj[prop]));
    }
  }
  lines.push('}');

  return lines.join('\n');
}

// create unity class files
componentsClasses.forEach((c) => {
  // use default constructor to create instantiation with member props
  const unityClassStr = createUnityClass(new o[c]());
  // create file from unity class str
  fs.writeFile(path.join('generated', `${c}.cs`), unityClassStr, (err) => {
    if (err) {
      console.log(`Error saving file: ${c}.cs`);
    }
  });
});
