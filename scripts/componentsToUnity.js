const fs = require('fs');
const path = require('path');
const oc = require('./objectifyComponents.js');

const allClasses = oc.allClasses;
const typeConv = oc.typeConv;
const o = oc.o;

function isArray(a) {
  const type = Object.getPrototypeOf(a).constructor.name;
  if (type.search('Array') >= 0) {
    return true;
  }
  return false;
}

function specialFormating(type, prop, data) {
  if (prop === 'color') {
    type = 'Color';
    data = `new Color(${data[0]}f, ${data[1]}f, ${data[2]}f)`;
  } else {
    return false;
  }

  return {type, prop, out: data};
}

function formatVar(type, prop, data) {
  let out = '';
  if (data === null || data === undefined) {
    out = 'null';
  } else {
    const sf = specialFormating(type, prop, data);
    if (sf) {
      ({ type, prop, out } = sf);
    } else if (type === 'string') {
      out = `"${data}"`;
    } else if (isArray(data)) {
      type = `${type}[]`
      out = `{${data}}`;
    } else {
      out = `${data}`;
    }
  }
  // return `${out};`;
  return `\tpublic ${type} ${prop} = ${out};`;
}

// unity class file template
const unityPrelude = 'using System.Collections;\n' +
                     'using System.Collections.Generic;\n' +
                     'using UnityEngine;\n';
function createUnityClass(obj) {
  const lines = [unityPrelude];
  lines.push(`public class ${obj.constructor.name} : MonoBehaviour {`);
  for (const prop in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, prop)) {
      let type = typeConv[typeof obj[prop]];
      if (type === undefined) {
        console.log(`Warning, ${prop} from ${obj.constructor.name} of type ${typeof obj[prop]} is undef`);
        type = 'object';
      }
      // obj prop undef???
      lines.push(formatVar(type, prop, obj[prop]));
    }
  }
  lines.push('}');

  return lines.join('\n');
}

try {
  fs.mkdirSync('generated');
} catch(err) {
  // fail silently
}
// create unity class files
allClasses.forEach((c) => {
  // use default constructor to create instantiation with member props
  const unityClassStr = createUnityClass(new o[c]());
  // create file from unity class str
  fs.writeFile(path.join('generated', `${c}.cs`), unityClassStr, (err) => {
    if (err) {
      console.log(`Error saving file: ${c}.cs`);
    }
  });
});
