

function quit() {
  window.open('', '_self', ''); window.close();
}

function startGame() {
  document.getElementById("progress").style.visibility="visible";
  document.getElementById("mainMenu").style.visibility="hidden";
  initialize();
  loadOptionsGraphics();
}

function nameEq(check, axis) {
  return axis.name == check;
}

const controlsToInputType = {
  forward: { axis: 'vertical', btn: 'positiveButton' },
  backward: { axis: 'vertical', btn: 'negativeButton' },
  right: { axis: 'horizontal', btn: 'positiveButton' },
  left: { axis: 'horizontal', btn: 'negativeButton' },
  walk: { axis: 'walk', btn: 'positiveButton' },
  action: { axis: 'action', btn: 'positiveButton' },
};

function inputKeyMap({ axis, btn }) {
  return keyMap[Input._options.axes.find(nameEq.bind(null, axis))[btn]];
}

function controlsToInput(control) {
  return inputKeyMap(controlsToInputType[control]);
}

function bindKeyHandler({ btnEle, controlsId }, event) {
  // reset context
  this.onkeydown = this.oldokd;
  this.onclick = this.oldoc;
  this.oldokd = null;
  this.oldoc = null;
  this.changeControlsBtn = false;
  $(btnEle).removeClass('focus');

  if (event.type === 'keydown' && event.keyCode != 27) { // 27: escape
    // do the keychange
    btnEle.innerHTML = keyMap[event.keyCode];
    Input.setButton(controlsToInputType[controlsId], event.keyCode);
  }
}

function changeControls(event) {
  event.stopPropagation();
  const controlsId = this.id;
  let btnEle = null;
  for (let i = 0; i < this.children.length;i++) {
    if (this.children[i].getAttribute('class').indexOf('btn') >= 0) {
      btnEle = this.children[i];
      break;
    }
  }

  if (!window.changeControlsBtn) {
    window.oldokd = window.onkeydown;
    window.oldoc = window.onclick;
  } else {
    $(window.changeControlsBtn).removeClass('focus');
  }

  $(btnEle).addClass('focus');
  window.changeControlsBtn = btnEle;
  window.onkeydown = bindKeyHandler.bind(window, { btnEle, controlsId });
  window.onclick = bindKeyHandler.bind(window, { btnEle, controlsId });
}

function loadOptionsControls() {
  const controlRows = $('#controls .modal-row');
  const controlRowsText = controlRows.find('.text');
  const controlRowsBtn = controlRows.find('.btn');
  for (let i = 0; i < controlRows.length; i++) {
    controlRowsText[i].innerHTML = controlRows[i].id;
    controlRowsBtn[i].innerHTML = controlsToInput(controlRows[i].id);
    controlRowsBtn[i].onclick = changeControls.bind(controlRows[i]);
  }
}

function togglePointShadows(e) {
  e.stopPropagation();
  if (this.innerHTML === 'Off') {
    this.innerHTML = 'On';
  } else {
    this.innerHTML = 'Off';
    const lightList = []
    GameObject.prototype.SceneRoot.findComponents('Light', lightList);
    for (let light of lightList) {
      if (light instanceof PointLight) {
        light.isShadowCaster = false;
      }
    }
  }
}

function loadOptionsGraphics() {
  const graphics = $('#graphics');
  graphics.css('opacity', '1');
  const toggleBtn = graphics.find('.toggle');
  toggleBtn[0].onclick = togglePointShadows;
}

function openOptionsModal() {
  $('#options').modal('show');
}

function closeOptionsModal() {
  $('#options').modal('hide');
}

function menuStart() {
  if(Debug.autoStart){
      startGame();
  }
  loadOptionsControls();
}
