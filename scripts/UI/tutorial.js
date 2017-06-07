function updateActionTutorial() {
  $('.tutorial-banner#action-tutorial .key-img')[0].innerHTML =
    controlsToInput('action').toLowerCase().slice(0, 5);
}

function updateMovementTutorial() {
  const keyImgs = $('.tutorial-banner#movement-tutorial .key-img');
  keyImgs[0].innerHTML = controlsToInput('forward').toLowerCase().slice(0, 5);
  keyImgs[1].innerHTML = controlsToInput('left').toLowerCase().slice(0, 5);
  keyImgs[2].innerHTML = controlsToInput('backward').toLowerCase().slice(0, 5);
  keyImgs[3].innerHTML = controlsToInput('right').toLowerCase().slice(0, 5);
}

function updateWalkTutorial() {
  $('.tutorial-banner#walk-tutorial .key-img')[0].innerHTML =
    controlsToInput('walk').toLowerCase().slice(0, 5);
}

function updateLookTutorial() {
  const imgDivs = $('.tutorial-banner#look-tutorial .img');
  console.log(imgDivs);
  for (ele of imgDivs) {
    for (cls of ele.className.split(/\s+/)) {
      const fileExt = cls.slice(cls.lastIndexOf('.') + 1);
      if (imgFormats.indexOf(fileExt.toLowerCase()) >= 0) {
        ele.style.content = `url(assets/images/${cls})`;
        break;
      }
    }
  }

  updateTutorialBanner.look = () => {};
}

const updateTutorialBanner = {
  movement: updateMovementTutorial,
  action: updateActionTutorial,
  sing: () => {},
  walk: updateWalkTutorial,
  dontsing: () => {},
  look: updateLookTutorial,
};

/* displayTutorialBanner
  name - name of the banner (eg, action, sing, movement)
  bool - true -> to show, false -> to hide
*/
function displayTutorialBanner(name, bool=true) {
  const banner = $(`.tutorial-banner#${name}-tutorial`);
  if (!banner) {
    console.log(`Warning: tutorial banner '${name}' doesnt exist`);
    return;
  }

  if (bool) {
    banner.show('fast');
    updateTutorialBanner[name]();
  } else {
    banner.hide('slow');
  }
}
