

function quit() {
  window.open('', '_self', ''); window.close();
}

function startGame() {
  document.getElementById("progress").style.visibility="visible";
  document.getElementById("mainMenu").style.visibility="hidden";
  initialize();
}

const inpAx = Input._options.axes;

const nameEq = (check, axis) => {
  return axis.name == check;
};

const controlToInput = {
  foward: keyMap[inpAx.find(nameEq.bind(null, 'vertical')).positiveButton],
  backward: keyMap[inpAx.find(nameEq.bind(null, 'vertical')).negativeButton],
  right: keyMap[inpAx.find(nameEq.bind(null, 'horizontal')).positiveButton],
  left: keyMap[inpAx.find(nameEq.bind(null, 'horizontal')).negativeButton],
};

function changeControls() {
  console.log(this);
}

function loadOptionsControls() {
  const controlRows = $('#controls .modal-row');
  const controlRowsText = controlRows.find('.text');
  const controlRowsBtn = controlRows.find('.btn');
  for(let i = 0; i < controlRows.length; i++) {
    controlRowsText[i].innerHTML = controlRows[i].id;
    controlRowsBtn[i].innerHTML = controlToInput[controlRows[i].id];
    controlRowsBtn[i].onclick = changeControls.bind(controlRows[i]);
  }
}

function menuStart() {
  if(Debug.autoStart){
      startGame();
  }
  loadOptionsControls();
}
