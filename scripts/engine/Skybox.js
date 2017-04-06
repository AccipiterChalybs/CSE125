/**
 * Created by Accipiter Chalybs on 4/5/2017.
 */
class Skybox
{
    constructor(imgFileNames)
    {
        this._skyboxTex = null;
        this._irradianceMatrix = [];
        this._material = null;
        this._mipmapLevels = null;
        this._loaded = null;
        this._meshData = null;
    }

    draw(){}

    getTexture(){}

    applyIrradiance(){}

    applyTexture(slot){}

    static _load(){}

    _loadGLCube(data){}

    static _loadIrradiance(irradianceMatrix, data);

    static _sampleTexture(environment, sampleDirection);

    static _specularEnvMap(normal, a, environment);
}