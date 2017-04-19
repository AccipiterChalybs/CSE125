/**
 * Created by Accipiter Chalybs on 4/5/2017.
 */

var GL;

function initialize() {
  let glCanvas = document.getElementsByTagName('canvas')[0];
  GL = glCanvas.getContext('webgl2');

  //glCanvas.getContext("webgl") || glCanvas.getContext("experimental-webgl");

  Input.init();
  SoundEngine.init();
  GameEngine.init();
  initRenderer(glCanvas);
}
