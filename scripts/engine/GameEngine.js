/**
 * Created by Accipiter Chalybs on 4/13/2017.
 */

let GameEngine = {};

GameEngine.loadingTextId = "loadProgress";
GameEngine._ready = false;      //if true, all requests have been made, and can start when they finish
GameEngine._numLoads=0;         //total number of loads (for UI)
GameEngine._loadHandles = [];   //handles of currently loading objects
GameEngine._nextLoadHandle = 0; //next load handle to return
GameEngine.currentScene = null;


/** Init: starts loading objects */
GameEngine.init = function() {
    GameEngine.currentScene = new GameScene(['assets/scenes/teapots.json']);
};


/** Start: setup everything after loading is complete, then start loop */
GameEngine.start = function() {
    GameEngine.currentScene.start();
    Renderer.start();
    window.requestAnimationFrame(GameEngine.loop.bind(GameEngine));
};

/** Loop: called every frame */
GameEngine.loop = function() {
    Time.tick();

    GameEngine.currentScene.update();
    GameObject.prototype.SceneRoot.update();
    Renderer.loop();

    window.requestAnimationFrame(GameEngine.loop.bind(GameEngine));
};






/** Signal that no more requests are likely to be made (and so can start after all current tasks are loaded */
GameEngine.finishLoadRequests = function() {
    GameEngine._ready = true;
    if (GameEngine._loadHandles.length === 0) {
        GameEngine.start();
    }
};

/** Register that we are loading an object & should not start until it's completed
 * @returns {number} A handle that should be passed to completeLoading() to indicate this specific load has finished
 */
GameEngine.registerLoading = function() {
    let loadHandle = GameEngine._nextLoadHandle;
    GameEngine._nextLoadHandle++;
    GameEngine._numLoads++;

    GameEngine._loadHandles.push(loadHandle);

    GameEngine.updateLoadingBar();
    return loadHandle;
};

/** Signal that a load was complete */
GameEngine.completeLoading = function(loadHandle) {
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

/** Updates the UI with current loading status */
GameEngine.updateLoadingBar = function() {
    let loadText = document.getElementById(GameEngine.loadingTextId);
    loadText.innerText = "Loading Progress: (" +
        (GameEngine._numLoads-GameEngine._loadHandles.length) + " / " + GameEngine._numLoads + ")";
};