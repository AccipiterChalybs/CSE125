/**
 * Created by Accipiter Chalybs on 4/5/2017.
 */

const CUBE_FACES = 6;

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

        let data = {imageArray: []};
        for (let f = 0; f < CUBE_FACES; ++f) {
            //TODO load image;
            //stbi_loadf(imageFiles[f].c_str(), &data.width[f], &data.height[f], &data.channels[f], 0);
            data.imageArray[f] = null;
        }

        this._skyboxTex = this.loadGLCube(data);
        //this.loadIrradiance(this._irradianceMatrix, data);

        data.imageArray = null;

        this._material = new Material(Renderer::getShader(Renderer.SKYBOX_SHADER));
    }

    draw(){

        if (!Skybox.loaded) {
            Skybox.load();
        }

        this._material.bind();
        GL.activeTexture(GL.TEXTURE0 + 5);
        GL.bindTexture(GL.TEXTURE_CUBE_MAP, this.getTexture());
        Renderer.getShader(Renderer.SKYBOX_SHADER)["environment"] = 5;


        if (Renderer.gpuData.vaoHandle !== meshData.vaoHandle) {
            GL.bindVertexArray(meshData.vaoHandle);
            Renderer.gpuData.vaoHandle = meshData.vaoHandle;
        }

        GL.drawElements(GL.TRIANGLES, meshData.indexSize, GL.UNSIGNED_INT, 0);

    }

    getTexture(){
        return this._skyboxTex;
    }

    applyIrradiance(){
        Renderer.setIrradiance(this._irradianceMatrix);
    }

    applyTexture(slot){
        GL.activeTexture(GL.TEXTURE0 + slot);
        GL.bindTexture(GL.TEXTURE_CUBE_MAP, this.getTexture());
        Renderer.setEnvironment(slot, this._mipmapLevels);
    }

    static _load(){
        //TODO        let vao = GL.createVertexArray();
        glGenVertexArrays(1, &vao);
        GL.bindVertexArray(vao);

        GL.enableVertexAttribArray(Renderer.VERTEX_ATTRIB_LOCATION);

        
        let meshBuffer = GL.createBuffer();
        let indexBuffer = GL.createBuffer();
        GL.bindBuffer(GL.ARRAY_BUFFER, meshBuffer);
        GL.bufferData(GL.ARRAY_BUFFER, VERTEX_COUNT * sizeof(float), vertices, GL.STATIC_DRAW);


        GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, indexBuffer);
        GL.bufferData(GL.ELEMENT_ARRAY_BUFFER, INDEX_COUNT * sizeof(GLuint), indices, GL.STATIC_DRAW);


        let stride = FLOAT_SIZE * (POSITION_COUNT);
        GL.vertexAttribPointer(Renderer.VERTEX_ATTRIB_LOCATION, 3, GL.FLOAT, false, stride, 0);

        meshData.vaoHandle = vao;
        meshData.indexSize = INDEX_COUNT;
    }

    _loadGLCube(data){}

    static _loadIrradiance(irradianceMatrix, data);

    static _sampleTexture(environment, sampleDirection);

    static _specularEnvMap(normal, a, environment);


/*
    loadIrradiance() {
        //for each cube map
        glm::vec3 irradiance[9];
        const float* currentImage;
        int currentWidth;
        int currentHeight;
        int channels;
        static float shConst[9] = { 0.282095, 0.488603, 0.488603, 0.488603, 1.092548, 1.092548, 1.092548, 0.315392, 0.546274 };

        float xVal, yVal, zVal;

        for (int m = 0; m < CUBE_FACES; ++m) {
            //load image
            //currentImage = SOIL_load_image(imageFiles[m].c_str(), &currentWidth, &currentHeight, &channels, SOIL_LOAD_AUTO);
            currentImage = data.imageArray[m];
            currentWidth = data.width[m];
            currentHeight = data.height[m];
            channels = data.channels[m];

            for (int y = 0; y < currentHeight; ++y) {
                float yPercent = y / (float)currentHeight;

                for (int x = 0; x < currentWidth; ++x) {
                    float xPercent = x / (float)currentWidth;

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

                    float mag = sqrt(xVal*xVal + yVal*yVal + zVal * zVal);
                    xVal /= mag;
                    yVal /= mag;
                    zVal /= mag;

                    float theta = acos(zVal / sqrt(xVal*xVal + yVal*yVal + zVal*zVal));

                    float currentSH;
                    for (int shIndex = 0; shIndex < SH_COUNT; ++shIndex) {
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
                        for (int c = 0; c < 3; ++c) {
                            irradiance[shIndex][c] += (currentSH * sin(theta) / (CUBE_FACES*currentWidth*currentHeight)) * (currentImage[(x + y*currentWidth)*channels + c]);
                        }
                    }
                }
            }
        }

        float c1 = 0.429043;
        float c2 = 0.511664;
        float c3 = 0.743125;
        float c4 = 0.886227;
        float c5 = 0.247708;

        for (int c = 0; c < 3; ++c) {
            irradianceMatrix[c] = glm::mat4(c1*irradiance[8][c], c1*irradiance[4][c], c1*irradiance[7][c], c2*irradiance[3][c],
                c1*irradiance[4][c], -c1*irradiance[8][c], c1*irradiance[5][c], c2*irradiance[1][c],
                c1*irradiance[7][c], c1*irradiance[5][c], c3*irradiance[6][c], c2*irradiance[2][c],
                c2*irradiance[3][c], c2*irradiance[1][c], c2*irradiance[2][c], c4*irradiance[0][c] - c5*irradiance[6][c]);
        }
    }







            float PI = atanf(1) * 4;

        //prev algorithm from http://holger.dammertz.org/stuff/notes_HammersleyOnHemisphere.html
        //new algorithm from http://cg.informatik.uni-freiburg.de/course_notes/graphics2_04_sampling.pdf slide 22 - old one had incorrect normalization constant
            glm::vec2 Hammersley(unsigned int i, unsigned int N) {
            float px = 2;
            int k = i;
            float theta = 0;
            while (k > 0) {
            int a = k % 2;
            theta = theta + (a / px);
            k = int(k / 2);
            px = px * 2;
        }
        return glm::vec2(float(i) / float(N), theta);
    }
    */

    //TODO original code had different mipmap levels for roughness - don't know if we can do this in webgl - investigate later
    loadGLCube(data) {
        let cubeTextureHandle = GL.createTexture();
    
        GL.bindTexture(GL.TEXTURE_CUBE_MAP, cubeTextureHandle);
        GL.texParameteri(GL.TEXTURE_CUBE_MAP, GL.TEXTURE_MAG_FILTER, GL.LINEAR);
        GL.texParameteri(GL.TEXTURE_CUBE_MAP, GL.TEXTURE_MIN_FILTER, GL.LINEAR);
        
        for (let m = 0; m < CUBE_FACES; ++m) {
            GL.texImage2D(GL.TEXTURE_CUBE_MAP_POSITIVE_X + m, 0, GL.RGB, data.width[m], data.height[m], 0, GL.RGB, GL.FLOAT, data.imageArray[m]);
        }

        glBindTexture(GL.TEXTURE_CUBE_MAP, 0);
        
        
        return cubeTextureHandle;
    }
}