

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

  // =========== point shadows ===============
  const pointShadows = graphics.find('#point-shadows');

  const lightList = [];
  GameObject.prototype.SceneRoot.findComponents('Light', lightList);
  const pointLightList =
    lightList.filter((l) => { return l instanceof PointLight; });
  const onPointLightList =
    pointLightList.filter((l) => { return l.isShadowCaster; });

  const countTxt = pointShadows.find('#count');
  const toggleBtn = pointShadows.find('.toggle');
  const sliderDiv = pointShadows.find('.slider');
  sliderDiv.slider('enable');

  countTxt[0].innerHTML = `${onPointLightList.length}/${lightList.length}`;
  toggleBtn[0].onclick =
    toggleShadows.bind(
      toggleBtn[0],
      pointLightList,
      sliderDiv.slider.bind(sliderDiv, 'option', 'value') // current update function
    );
  sliderDiv.slider('option', 'max', lightList.length);
  sliderDiv.slider('option', 'value', onPointLightList.length);
  sliderDiv.on('slidechange',
    handleSliderChange.bind(null, countTxt[0], pointLightList)
  );

  // =========== gamma/exposure ===============
  const gammaInp = graphics.find('#gamma input');
  const exposureInp = graphics.find('#exposure input');
  gammaInp[0].disabled = false;
  exposureInp[0].disabled = false;
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

function handleOninputSetter(setter, e) {
  if (this.value.length > 3) {
    this.value = this.value.slice(0, 3);
  }

  const valid = ['1','2','3','4','5','6','7','8','9','0','.','-'];
  if (valid.indexOf(this.value[this.value.length - 1]) < 0) {
    this.value = this.value.slice(0, this.value.length - 1);
  }

  // const intInput = parseInt(this.value);
  // if (intInput < 0) {
  //   this.value = '0';
  // } else if (intInput > 100) {
  //   this.value = '100';
  // }

  if (parseFloat(this.value)) {
    setter(this.value);
  }
}

function startPickplayer() {
  for (row of $('#pickplayer .modal-row')) {
    const id = row.getAttribute('id');
    row.children[0].onclick = (e) => {
      $('#pickplayer .modal-title')[0].innerHTML = `Player ${id}`;
      // TODO: Set something somewhere for the server
      window.setTimeout(() => { $('#pickplayer').modal('hide'); }, 500);
    };
  }
}

function startOptionsGraphics() {
  $('#graphics .slider').slider();
  $('#graphics .slider').slider('disable');
  const countEle = $('#graphics .help#count')[0];
  countEle.innerHTML = '0/0';

  const gammaInp = $('#graphics #gamma input');
  gammaInp[0].oninput =
    handleOninputSetter.bind(gammaInp[0], Renderer.setGamma);
  gammaInp[0].onclick = (e) => { e.stopPropagation(); };

  const exposureInp = $('#graphics #exposure input');
  exposureInp[0].oninput =
    handleOninputSetter.bind(exposureInp[0], Renderer.setExposure);
  exposureInp[0].onclick = (e) => { e.stopPropagation(); };

  gammaInp[0].disabled = true;
  exposureInp[0].disabled = true;
}

function startOptionsControls() {
  loadOptionsControls();
}

function openOptionsModal() {
  $('#options').modal('show');
  Debug.clientUpdate ?
    $('#options #cu-msg').show() : $('#options #cu-msg').hide();
  loadOptionsControls();
  loadOptionsGraphics();
}

function closeOptionsModal() {
  $('#options').modal('hide');
}

function menuStart() {
  if(Debug.autoStart){
      startGame();
  }
  Debug.clientUpdate ?
    $('#options #cu-msg').show() : $('#options #cu-msg').hide();
  startOptionsControls();
  startOptionsGraphics();
  startPickplayer();
}
