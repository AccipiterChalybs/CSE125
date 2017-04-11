/**
 * Created by Accipiter Chalybs on 4/5/2017.
 */

let GL;

function initialize() {
  let glCanvas = document.getElementsByTagName('canvas')[0];
  GL = glCanvas.getContext('webgl2');

  //glCanvas.getContext("webgl") || glCanvas.getContext("experimental-webgl");

  //Renderer init
  initRenderer(glCanvas);

  //Sound init
  //Input init
  Input.init();

  //Network init
}
