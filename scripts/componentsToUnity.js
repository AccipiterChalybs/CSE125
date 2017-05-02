const fs = require('fs');
const path = require('path');

const componentsClasses = [
  'Animation', 'AudioListener', 'AudioSource',
  'Camera', 'Light', 'PointLight', 'DirectionalLight',
  'SpotLight', 'Transform',
];

const typeConv = {
  number: 'float',
  boolean: 'bool',
  object: '',
};

// load dependency
const Componentjs = fs.readFileSync(path.join('engine', 'Component.js')).toString();

// load components
const componentsDir = path.join('engine', 'components');
const componentsStrs = [];
fs.readdirSync(componentsDir).forEach((file) => {
  componentsStrs.push(fs.readFileSync(path.join(componentsDir, file)).toString());
});
// make components look like objects
function objectify(s) {
  return `'${s}': ${s}`;
}
const evalPostlude = `const o={${componentsClasses.map(objectify)}}; o`;

// eval every class and return an object with every class definition
const o = eval(Componentjs + componentsStrs.join('\n') + evalPostlude);

// unity class file template
const unityPrelude = 'using System.Collections;\n' /
                     'using System.Collections.Generic;\n' /
                     'using UnityEngine;\n';
function createUnityClass(obj) {
  const lines = [unityPrelude];
  lines.push(`public class ${obj.constructor.name} : MonoBehavior {`);
  for (const prop in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, prop)) {
      let type = typeConv[typeof prop];
      if (type === '') {
        type = 'something';
        // type = something??
      }
      lines.push(`\tpublic ${type} ${prop} = ${obj[prop]};`);
    }
  }
  lines.push('}');

  return lines.join('\n');
}

// create unity class files
componentsClasses.forEach((c) => {
  if (c === 'Animation') { // blacklist, because no default constructor
    return;
  }

  // use default constructor to create instantiation with member props
  const unityClassStr = createUnityClass(new o[c]());
  // create file from unity class str
});
