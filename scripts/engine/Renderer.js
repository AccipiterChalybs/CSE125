/**
 * Created by Accipiter Chalybs on 4/5/2017.
 */
class Renderer //static class
{
    constructor() {
        this.renderBuffer = { forward: [], deferred: [], particle: [], light: [] };

        this.currentShader=null;
        this.camera=null;
        this.gpuData=null;
        this.passes=[];
        this.perspective=null;
        this.view=null;

        this.width = 0;
        this.height = 0;
        this.prevFOV = 0;
    }


    //public
    init(width, height) {

    }

    loop () {

    }

    //private
    _extractObjects() {

    }

    _applyPerFrameData() {

    }

    _updatePerspective(perspectiveMatrix) {

    }

    _setIrradiance(irradianceMatrix) {

    }

    _setEnvironment(slot, mipmapLevels) {

    }

    set currentShader(shader) {

    }

    get currentShader () {

    }

    _getShader(shaderId) {

    }

    switchShader(shaderId) {

    }

    setModelMatrix(transform) {

    }

    get windowWidth() {

    }

    get widthHeight() {

    }

    resize(width, height) {

    }

}