/**
 * Created by Accipiter Chalybs on 4/13/2017.
 */

let GameEngine = {};

GameEngine.loadingTextId = "loadProgress";
GameEngine._ready = false;
GameEngine._numLoads=0;
GameEngine._loadHandles = [];
GameEngine._nextLoadHandle = 0;

GameEngine.init = function() {
    ObjectLoader.loadScene('assets/scenes/teapots.json');
};


GameEngine.start = function() {
    Renderer.start();
    window.requestAnimationFrame(GameEngine.loop.bind(GameEngine));
};

GameEngine.loop = function() {
    if (GameObject.prototype.SceneRoot !== null) GameObject.prototype.SceneRoot.update();

    Renderer.loop();

    console.log("LOOP");
    window.requestAnimationFrame(GameEngine.loop.bind(GameEngine));
};




GameEngine.finishLoadRequests = function() {
    GameEngine._ready = true;
    if (GameEngine._loadHandles.length === 0) {
        GameEngine.start();
    }
};

GameEngine.registerLoading = function() {
    let loadHandle = GameEngine._nextLoadHandle;
    GameEngine._nextLoadHandle++;
    GameEngine._numLoads++;

    console.log(loadHandle);
    GameEngine._loadHandles.push(loadHandle);

    GameEngine.updateLoadingBar();
    return loadHandle;
};


GameEngine.completeLoading = function(loadHandle) {
    console.log(loadHandle);
    let index = GameEngine._loadHandles.indexOf(loadHandle);
    if (index > -1) {
        GameEngine._loadHandles.splice(index, 1);
        GameEngine.updateLoadingBar();
        if (GameEngine._loadHandles.length === 0 && GameEngine._ready) {
            GameEngine.start();
        }
    } else {
        console.error("Trying to complete load on already loaded object: " + loadHandle);
    }
};

GameEngine.updateLoadingBar = function() {
    let loadText = document.getElementById(GameEngine.loadingTextId);
    loadText.innerText = "Loading Progress: (" +
        (GameEngine._numLoads-GameEngine._loadHandles.length) + " / " + GameEngine._numLoads + ")";
};