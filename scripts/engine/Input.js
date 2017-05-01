/**
 * Created by Accipiter Chalybs on 4/5/2017.
 */

const InputType = {
  mouse: 'mouse',
  keyboard: 'keyboard',
  mouseButton: 'mouseButton',
};

const InputDirection = {
  x: 'x',
  y: 'y',
};

let currentMouseX = 0;
let currentMouseY = 0;
let lastMouseX = 0;
let lastMouseY = 0;

const Input = {
  enabled: false,
  _options: {
    axes: [
      {
        name: 'mouseHorizontal',
        type: InputType.mouse,
        direction: InputDirection.x,
        sensitivity: 50,
        value: 0
      },
      {
        name: 'mouseVertical',
        type: InputType.mouse,
        direction: InputDirection.y,
        sensitivity: 50,
        value: 0
      },
      {
        name: 'mouseDown',
        type: InputType.mouseButton,
        value: 0
      },
      {
        name: 'horizontal',
        type: InputType.keyboard,
        positiveButton: 68,
        negativeButton: 65,
        value: 0
      },
      {
        name: 'vertical',
        type: InputType.keyboard,
        positiveButton: 87,
        negativeButton: 83,
        value: 0
      }
    ],
  },
  getAxis: function (name) {
    var axis = Input._options.axes.filter((axis)=>axis.name === name)[0];
    return (axis) ? axis.value : null;
  },

  setAxis: function (name,val) {
    let axis = Input._options.axes.filter((axis)=>axis.name === name)[0];
    axis.value=val;
  },

  getMouse: function () {
    var x = Input._options.axes.filter((axis)=>axis.name === 'mouseHorizontal')[0];
    var y = Input._options.axes.filter((axis)=>axis.name === 'mouseVertical')[0];
    return {
      x: x.value,
      y: y.value,
    };
  },

  update: function(){
    Input._options.axes.filter((axis) => axis.name === 'mouseHorizontal')[0].value =
          currentMouseX - lastMouseX;
    Input._options.axes.filter((axis) => axis.name === 'mouseVertical')[0].value =
          currentMouseY - lastMouseY;

    currentMouseX = lastMouseX;
    currentMouseY = lastMouseY;
  },

  init: function (options) {
    Input._options = options || Input._options;

    function updateAxisInt(axis, button, up) {
      if(Input.enabled === false)
        return;

      axis.value = (axis.value === undefined) ? 0 : axis.value;
      if (axis.positiveButton === button) {
        if (up) {
          axis.value -= 1;
        } else {
          axis.value += 1;
        }
      } else if (axis.negativeButton === button) {
        if (up) {
          axis.value += 1;
        } else {
          axis.value -= 1;
        }
      }

      // Clamp
      axis.value = Math.min(Math.max(axis.value, -1), 1);
    }

    function updateAxisFloat(axis, e) {
      if(Input.enabled === false)
        return;

      axis.value = axis.value || 0;
      if (axis.direction === InputDirection.x) {
        axis.value = (e.clientX + 0.0) / (window.innerWidth + 0.0);
      } else if (axis.direction === InputDirection.y) {
        axis.value = (e.clientY + 0.0) / (window.innerHeight + 0.0);
      }
    }

    // Pointer lock
    document.body.requestPointerLock = document.body.requestPointerLock ||
                                        document.body.mozRequestPointerLock;

    document.exitPointerLock = document.exitPointerLock || document.mozExitPointerLock;

    document.body.onclick =  function() {
      document.body.requestPointerLock();
    };

    // Hook pointer lock state change events for different browsers
    document.addEventListener('pointerlockchange', lockChangeAlert, false);
    document.addEventListener('mozpointerlockchange', lockChangeAlert, false);

    function lockChangeAlert() {
      if (document.pointerLockElement === document.body ||
        document.mozPointerLockElement === document.body) {
        //console.log('The pointer lock status is now locked');
        document.addEventListener("mousemove", updatePosition, false);
        document.addEventListener("mousedown", clickedMouse, false);
        document.addEventListener("mouseup", releasedMouse, false);
        Input.enabled = true;
      } else {
        //console.log('The pointer lock status is now unlocked');
        document.removeEventListener("mousemove", updatePosition, false);
        document.removeEventListener("mousedown", clickedMouse, false);
        document.removeEventListener("mouseup", releasedMouse, false);
        Input._options.axes.filter((axis)=>axis.name === 'mouseHorizontal')[0].value = 0;
        Input._options.axes.filter((axis)=>axis.name === 'mouseVertical')[0].value = 0;
        Input.enabled = false;
      }
    }

    function updatePosition(e) {
      currentMouseX += e.movementX;
      currentMouseY += e.movementY;
    }

    function clickedMouse(e){
      // console.log("clickedMouse!", e);
      Input._options.axes.filter((axis) => axis.name === 'mouseDown')[0].value = 1;
    }

    function releasedMouse(e){
      // console.log("releasedMouse!", e);
      Input._options.axes.filter((axis) => axis.name === 'mouseDown')[0].value = 0;
    }
    // End pointer lock

      // Mouse buttons
      // document.body.onmouseup = (e)=> Input._options.axes.filter(
      //     (axis)=>axis.type === InputType.mouseButton)
      //     .forEach((axis)=>updateAxisInt(axis, e.button, true));
      // document.body.onmousedown = (e)=> Input._options.axes.filter(
      //     (axis)=>axis.type === InputType.mouseButton)
      //     .forEach((axis)=>updateAxisInt(axis, e.button));

      // Prevent default Right-click menu
      document.body.oncontextmenu = ()=>false;

      // Keyboard buttons
      document.body.onkeyup = (e)=> Input._options.axes.filter(
          (axis)=>axis.type === InputType.keyboard)
          .forEach((axis)=>updateAxisInt(axis, e.which, true));
      document.body.onkeydown = (e)=> Input._options.axes.filter(
          (axis)=>axis.type === InputType.keyboard)
          .forEach((axis)=>updateAxisInt(axis, e.which));

      // Mouse Movement
      //document.body.onmousemove = (e)=> Input._options.axes.filter(
      //    (axis)=>axis.type === InputType.mouse)
      //    .forEach((axis)=>updateAxisFloat(axis, e));
    },
};
