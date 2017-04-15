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

const Input = {
  _options: {
    axes: [
      {
        name: 'mouseHorizontal',
        type: InputType.mouse,
        direction: InputDirection.x,
      },
      {
        name: 'mouseVertical',
        type: InputType.mouse,
        direction: InputDirection.y,
      },
	  {
		  name: 'horizontal',
		  type: InputType.keyboard,
		  positiveButton: 39,
		  negativeButton: 37,
		  value: 0
	  },
	  {
		  name: 'vertical',
		  type: InputType.keyboard,
		  positiveButton: 38,
		  negativeButton: 40,
		  value: 0
	  }
    ],
  },
  getAxis: function (name) {
    var axis = Input._options.axes.filter((axis)=>axis.name === name)[0];
    return (axis) ? axis.value : null;
  },

  getMouse: function () {
    var x = Input._options.axes.filter((axis)=>axis.name === 'mouseHorizontal')[0];
    var y = Input._options.axes.filter((axis)=>axis.name === 'mouseVertical')[0];
    return {
      x: x.value,
      y: y.value,
    };
  },

  init: function (options) {
      Input._options = options || Input._options;

      function updateAxisInt(axis, button, up) {
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
        axis.value = axis.value || 0;
        if (axis.direction === InputDirection.x) {
          axis.value = (e.clientX + 0.0) / (window.innerWidth + 0.0);
        } else if (axis.direction === InputDirection.y) {
          axis.value = (e.clientY + 0.0) / (window.innerHeight + 0.0);
        }
      }

      // Mouse buttons
      document.body.onmouseup = (e)=> Input._options.axes.filter(
          (axis)=>axis.type === InputType.mouseButton)
          .forEach((axis)=>updateAxisInt(axis, e.button, true));
      document.body.onmousedown = (e)=> Input._options.axes.filter(
          (axis)=>axis.type === InputType.mouseButton)
          .forEach((axis)=>updateAxisInt(axis, e.button));

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
      document.body.onmousemove = (e)=> Input._options.axes.filter(
          (axis)=>axis.type === InputType.mouse)
          .forEach((axis)=>updateAxisFloat(axis, e));
    },
};
