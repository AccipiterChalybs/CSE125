/**
 * Created by Accipiter Chalybs on 4/5/2017.
 */


class Skybox
{

    constructor(imgFileName, mipmaps)
    {
        const hdr = true; //TODO readd support for non-hdr images if needed
        const powersOfTwo = [1, 2, 4, 8, 16, 32, 64, 128, 256, 512];
        const ending = ["_posx", "_negx", "_posy", "_negy", "_posz", "_negz"];
        const extension = ".hdr";

        this.loadId = GameEngine.registerLoading();

        this.hdr=hdr;
        this._skyboxTex = null;
        this._irradianceMatrix = [];
        this._material = new Material(Renderer.getShader(Renderer.SKYBOX_SHADER));
        this._mipmapLevels = mipmaps;
        this._imagesLoaded = 0;

        this._imageArray = [];

        for (let mip = 0; mip < this._mipmapLevels; ++mip) {
            for (let f = 0; f < CUBE_FACES; ++f) {
                let filename = imgFileName + powersOfTwo[(this._mipmapLevels-1)-mip] + ending[f] + extension;
                let callback = this._imageReady.bind(this);

                if (this.hdr) {
                    this._imageArray[mip*CUBE_FACES + f] = {};
                    RGBE_LOADER.loadHDR(filename, this._imageArray[mip*CUBE_FACES + f], callback);
                } else {
                    console.error("Skybox must be HDR");
                   /* this._imageArray[f] = new Image();
                    this._imageArray[f].onload = function () {
                        callback();
                    };
                    this._imageArray[f].src = filename;*/
                }
            }
        }
    }

    _imageReady() {
        this._imagesLoaded++;
        if (this._imagesLoaded === CUBE_FACES * this._mipmapLevels) {
            this._finishLoad();
        }
    }

    _finishLoad() {
        this._skyboxTex = Skybox._loadGLCube(this.hdr, this._imageArray, this._mipmapLevels);
        this.loadIrradiance(this._imageArray, this._irradianceMatrix);

        this._imageArray = [];
        GameEngine.completeLoading(this.loadId);
    }

    draw(){

        if (!Skybox.prototype._loaded) {
            Skybox._load();
        }

        this._material.bind();
        GL.activeTexture(GL.TEXTURE0 + 5);
        GL.bindTexture(GL.TEXTURE_CUBE_MAP, this.getTexture());
        Renderer.getShader(Renderer.SKYBOX_SHADER).setUniform("environment", 5, UniformTypes.u1i);


        if (Renderer.gpuData.vaoHandle !== Skybox.prototype._meshData.vaoHandle) {
            GL.bindVertexArray(Skybox.prototype._meshData.vaoHandle);
            Renderer.gpuData.vaoHandle = Skybox.prototype._meshData.vaoHandle;
        }

        GL.drawElements(GL.TRIANGLES, Skybox.prototype._meshData.indexSize, GL.UNSIGNED_SHORT, 0);

    }

    getTexture(){
        return this._skyboxTex;
    }

    applyIrradiance(){
        Renderer._setIrradiance(this._irradianceMatrix);
    }

    applyTexture(slot){
        GL.activeTexture(GL.TEXTURE0 + slot);
        GL.bindTexture(GL.TEXTURE_CUBE_MAP, this.getTexture());
        Renderer.setEnvironment(slot, this._mipmapLevels - 1);
    }

    static _load(){

        let vertices=[ -1, -1, 0,
            1, -1, 0,
            1,  1, 0,
            -1,  1, 0 ];

        let indices = [ 0, 1, 2, 0, 2, 3 ];

        let vao = GL.createVertexArray();
        GL.bindVertexArray(vao);

        GL.enableVertexAttribArray(Renderer.VERTEX_ATTRIB_LOCATION);
        
        let meshBuffer = GL.createBuffer();
        let indexBuffer = GL.createBuffer();
        GL.bindBuffer(GL.ARRAY_BUFFER, meshBuffer);
        GL.bufferData(GL.ARRAY_BUFFER, new Float32Array(vertices), GL.STATIC_DRAW);


        GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, indexBuffer);
        GL.bufferData(GL.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), GL.STATIC_DRAW);


        let POSITION_COUNT = 3;
        let stride = 4 * (POSITION_COUNT);
        GL.vertexAttribPointer(Renderer.VERTEX_ATTRIB_LOCATION, 3, GL.FLOAT, false, stride, 0);

        Skybox.prototype._meshData.vaoHandle = vao;
        Skybox.prototype._meshData.indexSize = indices.length;

        Skybox.prototype._loaded = true;
    }

    _loadGLCube(data){}

    static _loadIrradiance(irradianceMatrix, data) {}

    static _sampleTexture(environment, sampleDirection) {}

    static _specularEnvMap(normal, a, environment) {}



    loadIrradiance(data, irradianceMatrix) {
        //for each cube map
        const coeff = 1;
        let irradiance = [];
        for (let shIndex = 0; shIndex < Skybox.prototype.SH_COUNT; ++shIndex) {
            irradiance[shIndex] = new Float32Array(3);
        }
        const shConst = [ 0.282095, 0.488603, 0.488603, 0.488603, 1.092548, 1.092548, 1.092548, 0.315392, 0.546274 ];

        let xVal=0;
        let yVal=0;
        let zVal=0;

        for (let m = 0; m < CUBE_FACES; ++m) {
            let currentImage = (this.hdr) ? data[m].data : data[m];
            let currentWidth = data[m].width;
            let currentHeight = data[m].height;
            let channels = 3;

            for (let y = 0; y < currentHeight; ++y) {
                let yPercent = y / currentHeight;

                for (let x = 0; x < currentWidth; ++x) {
                    let xPercent = x / currentWidth;

                    switch (m) {
                        case 0: //rt
                            xVal = 1;
                            yVal = 2 * yPercent - 1;
                            zVal = -(2 * xPercent - 1);
                            break;
                        case 1: //lf
                            xVal = -1;
                            yVal = 2 * yPercent - 1;
                            zVal = 2 * xPercent - 1;
                            break;
                        case 2: //up
                            xVal = 2 * xPercent - 1;
                            yVal = 1;
                            zVal = -(2 * yPercent - 1);
                            break;
                        case 3: //dn
                            xVal = 2 * xPercent - 1;
                            yVal = -1;
                            zVal = 2 * yPercent - 1;
                            break;
                        case 4: //bk
                            xVal = -(2 * xPercent - 1);
                            yVal = 2 * yPercent - 1;
                            zVal = 1;
                            break;
                        case 5: //ft
                            xVal = (2 * xPercent - 1);
                            yVal = 2 * yPercent - 1;
                            zVal = -1;
                            break;
                    }

                    let mag = Math.sqrt(xVal*xVal + yVal*yVal + zVal * zVal);
                    xVal /= mag;
                    yVal /= mag;
                    zVal /= mag;

                    let theta = Math.acos(zVal / Math.sqrt(xVal*xVal + yVal*yVal + zVal*zVal));

                    let currentSH=0;
                    for (let shIndex = 0; shIndex < Skybox.prototype.SH_COUNT; ++shIndex) {
                        switch (shIndex) {
                            case 0: //0,0
                                currentSH = shConst[shIndex];
                                break;
                            case 1: //1,-1
                                currentSH = shConst[shIndex] * yVal;
                                break;
                            case 2: //1,0
                                currentSH = shConst[shIndex] * zVal;
                                break;
                            case 3: //1,1
                                currentSH = shConst[shIndex] * xVal;
                                break;
                            case 4: //2, -2
                                currentSH = shConst[shIndex] * xVal * yVal;
                                break;
                            case 5: //2, -1
                                currentSH = shConst[shIndex] * yVal * zVal;
                                break;
                            case 6: //2, 0
                                currentSH = shConst[shIndex] * (3 * zVal*zVal - 1);
                                break;
                            case 7: //2, 1
                                currentSH = shConst[shIndex] * xVal * zVal;
                                break;
                            case 8: //2, 2
                                currentSH = shConst[shIndex] * (xVal*xVal - yVal*yVal);
                                break;
                        }
                        for (let c = 0; c < 3; ++c) {
                            irradiance[shIndex][c] += coeff*(currentSH * Math.sin(theta) / (CUBE_FACES*currentWidth*currentHeight)) * (currentImage[(x + y*currentWidth)*channels + c]);
                        }
                    }
                }
            }
        }

        let c1 = 0.429043;
        let c2 = 0.511664;
        let c3 = 0.743125;
        let c4 = 0.886227;
        let c5 = 0.247708;

        for (let c = 0; c < 3; ++c) {
            irradianceMatrix[c] = mat4.create();
            mat4.set(irradianceMatrix[c], c1*irradiance[8][c], c1*irradiance[4][c], c1*irradiance[7][c], c2*irradiance[3][c],
                c1*irradiance[4][c], -c1*irradiance[8][c], c1*irradiance[5][c], c2*irradiance[1][c],
                c1*irradiance[7][c], c1*irradiance[5][c], c3*irradiance[6][c], c2*irradiance[2][c],
                c2*irradiance[3][c], c2*irradiance[1][c], c2*irradiance[2][c], c4*irradiance[0][c] - c5*irradiance[6][c]);
        }
    }


    //TODO original code had different mipmap levels for roughness - don't know if we can do this in webgl - investigate later
    static _loadGLCube(hdr, data, mipmapLevels) {
        let cubeTextureHandle = GL.createTexture();

        let filterMode1 = (!hdr || GLExtensions.texture_float_linear) ? GL.LINEAR : GL.NEAREST;
        let filterMode2 = (!hdr || GLExtensions.texture_float_linear) ? GL.LINEAR_MIPMAP_LINEAR : GL.NEAREST;
    
        GL.bindTexture(GL.TEXTURE_CUBE_MAP, cubeTextureHandle);
        GL.texParameteri(GL.TEXTURE_CUBE_MAP, GL.TEXTURE_MAG_FILTER, filterMode1);
        GL.texParameteri(GL.TEXTURE_CUBE_MAP, GL.TEXTURE_MIN_FILTER, filterMode2);

        let mip = 0;
        for (let mip=0; mip < mipmapLevels; ++mip) {
            for (let f = 0; f < CUBE_FACES; ++f) {
                let m = mip*CUBE_FACES + f;
                if (hdr) {
                    GL.texImage2D(GL.TEXTURE_CUBE_MAP_POSITIVE_X + f, mip, GL.RGB16F, data[m].width, data[m].height, 0, GL.RGB, GL.FLOAT, data[m].data);
                } else {
                    GL.texImage2D(GL.TEXTURE_CUBE_MAP_POSITIVE_X + f, mip, GL.RGB, data[m].width, data[m].height, 0, GL.RGB, GL.UNSIGNED_BYTE, data[m]);
                }
            }
        }

        GL.bindTexture(GL.TEXTURE_CUBE_MAP, null);
        
        
        return cubeTextureHandle;
    }
}

Skybox.prototype._loaded = false;
Skybox.prototype._meshData = {};
const CUBE_FACES = 6;
Skybox.prototype.SH_COUNT = 9;