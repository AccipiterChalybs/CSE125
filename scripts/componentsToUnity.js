const fs = require('fs');
const path = require('path');
const oc = require('./objectifyComponents.js');

const componentsClasses = oc.componentsClasses;
const typeConv = oc.typeConv;
const o = oc.o;

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
