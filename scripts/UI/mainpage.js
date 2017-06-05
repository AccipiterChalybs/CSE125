

function quit() {
  window.open('', '_self', ''); window.close();
}

function startGame() {
  document.getElementById("progress").style.visibility="visible";
  document.getElementById("mainMenu").style.visibility="hidden";
  initialize();
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

function toggleShadows(lightList, update, e) {
  e.stopPropagation();
  if (this.innerHTML === 'Off') {
    this.innerHTML = 'On';
    update(lightList.length);
  } else {
    this.innerHTML = 'Off';
    update(0);
  }
}

function loadOptionsGraphics() {
  const graphics = $('#graphics');
  graphics.css('opacity', '1');
  $('#graphics .slider').slider('enable');

  const lightList = [];
  GameObject.prototype.SceneRoot.findComponents('Light', lightList);
  const pointLightList =
    lightList.filter((l) => { return l instanceof PointLight; });
  const onPointLightList =
    pointLightList.filter((l) => { return l.isShadowCaster; });


  const countTxt = graphics.find('#count');
  const toggleBtn = graphics.find('.toggle');
  const slider = graphics.find('.slider');

  countTxt[0].innerHTML = `${onPointLightList.length}/${lightList.length}`;
  toggleBtn[0].onclick =
    toggleShadows.bind(
      toggleBtn[0],
      pointLightList,
      slider.slider.bind(slider, 'option', 'value') // current update function
    );
  slider.slider('option', 'max', lightList.length);
  slider.slider('option', 'value', onPointLightList.length);
  slider.on('slidechange',
    handleSliderChange.bind(null, countTxt[0], pointLightList)
  );
}

function handleSliderChange(helpEle, lightList, e, ui) {
  const s = helpEle.innerHTML;
  const max = s.slice(s.search('/') + 1);
  helpEle.innerHTML = `${ui.value}/${max}`;

  let c = 0;
  for (let light of lightList) {
    if (light) {
      light.isShadowCaster = c < ui.value;
      c += 1;
    }
  }
}

function startOptionsGraphics() {
  $('#graphics .slider').slider();
  $('#graphics .slider').slider('disable');
  const countEle = $('#graphics .help#count')[0];
  countEle.innerHTML = '0/0';
}

function openOptionsModal() {
  $('#options').modal('show');
  loadOptionsGraphics();
}

function closeOptionsModal() {
  $('#options').modal('hide');
}

function menuStart() {
  if(Debug.autoStart){
      startGame();
  }
  loadOptionsControls();
  startOptionsGraphics();
}
