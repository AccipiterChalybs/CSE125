/**
 * Created by Accipiter Chalybs on 4/5/2017.
 */

var GL;
var IS_SERVER = false;

function initialize() {
  let glCanvas = document.getElementsByTagName('canvas')[0];
  if (Debug.bufferDebugMode) {
      GL = glCanvas.getContext('webgl2', {antialias: false});
  } else {
      GL = glCanvas.getContext('webgl2');
  }

  //glCanvas.getContext("webgl") || glCanvas.getContext("experimental-webgl");

  Input.init();

  SoundEngine.init();
  GameEngine.init();
  if (!Debug.clientUpdate)
  {
    Networking.init();
  }
  initRenderer(glCanvas);
}
