/**
 * Created by Accipiter Chalybs on 4/6/2017.
 */

class ObjectLoader {

    static addComponentMap(name, func) {
        if (ObjectLoader.prototype.componentMap[name]) {
            ObjectLoader.prototype.componentMap[name].push(func);
        } else {
            ObjectLoader.prototype.componentMap[name] = [func];
        }
    }

    static loadScene(filename) {
        let loadId = GameEngine.registerLoading();
        ObjectLoader._loadJSON(filename, ObjectLoader._finishLoadScene.bind(this, loadId, filename));
    }

    static _finishLoadScene(loadId, filename, scene) {

        if (scene === null) {
            return;
        }

        let lights = {};
     /*TODO re-add
        for (let i=0; i<scene.mNumLights; ++i) {
            let l = scene.mLight[i];

            let light = null;

            if (l.mType === "aiLightSource_POINT") {
                light = new PointLight();
            } else if (l.mType === "aiLightSource_DIRECTIONAL") {
                light = new DirectionalLight();
            } else {
                light = new SpotLight();
            }
            light.color = vec3(l.mColorDiffuse.r, l.mColorDiffuse.g, l.mColorDiffuse.b);
            //light.constantFalloff = l.mAttenuationConstant;
            lights[l.mName]=light;
        }*/

        let loadingAcceleration = {};

        let retScene = ObjectLoader._parseNode(scene, scene.rootnode, filename, loadingAcceleration, lights);

        //TODO bad hack - REMOVE THIS!!!
        GameObject.prototype.SceneRoot = retScene;


        //TODO this looks incorrect - might need to put inside the recursive parseNode?
        if ("animations" in scene) {
            retScene.addComponent(new Animation(scene, loadingAcceleration));
            ObjectLoader.linkRoot(retScene.getComponent("Animation"), retScene.transform);
        }

        GameEngine.completeLoading(loadId);
        return retScene;
    }

    static _loadJSON(url, func) {
        //from http://stackoverflow.com/questions/12460378/how-to-get-json-from-url-in-javascript
        let getJSON = function(url, callback) {
            let xhr = new XMLHttpRequest();
            xhr.open('GET', url, true);
            xhr.responseType = 'json';
            xhr.onload = function() {
                let status = xhr.status;
                if (status === 200) {
                    callback(null, xhr.response);
                } else {
                    callback(status);
                }
            };
            xhr.send();
        };

        getJSON(url,
            function(err, data) {
                if (err !== null) alert("ERROR loading level: " + err);
                else func(data);
            });
    }

    /*
    static _getMapping(mode) {
        switch (mode) {
            case ("aiTextureMapMode_Wrap") :
                return GL_REPEAT;
            case("aiTextureMapMode_Clamp") :
                return GL_CLAMP_TO_EDGE;
            case("aiTextureMapMode_Mirror") :
                return GL_MIRRORED_REPEAT;
            case("aiTextureMapMode_Decal") :
                return GL_CLAMP_TO_BORDER;
            default:
                return GL_REPEAT;
        }
    }*/

    static _getPath ( name ) {

    }

    static _parseNode(scene, currentNode, filename, loadingAcceleration, lights) {
        let nodeObject = new GameObject();

        let pos = vec3.create();
        let scale = 1;
        let rotate = quat.create();

        //TODO do we need to flip this matrix?
        let transformMat = mat4.create();
        mat4.set.apply(mat4, [transformMat].concat(currentNode.transformation));


        mat4.getTranslation(pos, transformMat);
        mat4.getRotation(rotate, transformMat);

        //TODO also might need to flip this
        let row = vec3.create(); vec3.set(row, transformMat[0], transformMat[1], transformMat[2]);
        scale = vec3.length(row);

        nodeObject.transform.scale(scale); //TODO multiple scales?
        nodeObject.transform.translate(pos);
        nodeObject.transform.rotate(rotate);

        let name = currentNode.name;
        if (name === "defaultobject") name = filename + ObjectLoader.prototype.counter;
        nodeObject.setName(name);

        if (name in lights) {
            nodeObject.addComponent(lights[name]);
        }

        if ("meshes" in currentNode) {
            if (currentNode.meshes.length > 1) { throw new Error(); } //ASSERTION
            if (!(name in Mesh.prototype.meshMap)) {
                let meshIndex = currentNode.meshes[0];
                Mesh.loadMesh(name, scene.meshes[meshIndex]);
            }

            let mesh = new Mesh(name);

            let aMat = scene.materials[scene.meshes[currentNode.meshes[0]].materialindex];
            let foundForward = name.search("Forward") !== -1;
            let foundEmit = name.search("Emit") !== -1;
            let mat = null;


            //TODO remove me after deferred shading is ready
            foundForward = true;

            //TODO either change material to accept an index, or pass in the shader object from Renderer
            let hasBones = ("bones" in scene.meshes[currentNode.meshes[0]]);
            if (foundForward) {
                mat = new Material(Renderer.getShader(hasBones ? Renderer.FORWARD_PBR_SHADER_ANIM :  Renderer.FORWARD_UNLIT));
                mat.transparent = true;
            }
            else if (foundEmit) {
                mat = new Material(Renderer.getShader(Renderer.FORWARD_EMISSIVE));
                mat.transparent = true;
            } else {
                mat = new Material(Renderer.getShader(hasBones ? Renderer.DEFERRED_PBR_SHADER_ANIM : Renderer.DEFERRED_PBR_SHADER));
                mat.transparent = false;
            }

            //TODO remove me after deferred shading is ready
            if (!hasBones) mat = new Material(Renderer.getShader(Renderer.FORWARD_PBR_SHADER));


            //TODO make it load textures!
            if (false && aMat.GetTextureCount("aiTextureType_DIFFUSE") > 0) {
                let path = null;
                aMath.GetTexture(aiTextureType_DIFFUSE, 0, path);
                mat.setTexture(MaterialTexture.COLOR, new Texture(getPath(filename) + path, true))
            }
            else {
                let color = vec4.create(); vec4.set(color,1,1,1,1);
                mat.setTexture(MaterialTexture.COLOR, Texture.makeColorTex(color))
            }

            if (false && aMat.GetTextureCount("aiTextureType_NORMALS") > 0) {
                let path = null;
                aMath.GetTexture(aiTextureType_NORMALS, 0, path);
                mat.setTexture(MaterialTexture.NORMAL, new Texture(getPath(filename) + path, false))
            }
            else {
                let color = vec4.create(); vec4.set(color,0.5,0.5,1,1);
                mat.setTexture(MaterialTexture.NORMAL, Texture.makeColorTex(color))
            }

            if (false && aMat.GetTextureCount("aiTextureType_SPECULAR") > 0) {
                let path = null;
                aMath.GetTexture(aiTextureType_DIFFUSE, 0, path);
                mat.setTexture(MaterialTexture.MAT, new Texture(getPath(filename) + path, true));
            }
            else {
                let color = vec4.create(); vec4.set(color,0,0,0.1,1); //metalness, blank, roughness
                mat.setTexture(MaterialTexture.MAT, Texture.makeColorTex(color))
            }
            mesh.setMaterial(mat);

            nodeObject.addComponent(mesh);

        }

        loadingAcceleration[currentNode.name] = nodeObject.transform;

        if ("children" in currentNode) {
            for (let child of currentNode.children) {
                nodeObject.addChild(ObjectLoader._parseNode(scene, child, filename, loadingAcceleration, lights));
            }
        }

        let compTypeName;
        let dividerPos = name.search('.');
        if (dividerPos !== -1) {
            compTypeName = name.substring(0, dividerPos);
        } else {
            compTypeName = name;
        }


        let components = ObjectLoader.prototype.componentMap[compTypeName];
        if (components) {
            for (let func of components){
                func(nodeObject);
            }
        }

        return nodeObject;
    }

    static linkRoot(anim, currentTransform) {
        if (!currentTransform) return;

        let currentMesh = currentTransform.gameObject.getComponent("Mesh");
        if (currentMesh && currentMesh !== null) {
            currentMesh.animationRoot = anim;
        }
        for (let child of currentTransform.children) {
            ObjectLoader.linkRoot(anim, child);
        }
    }

}


ObjectLoader.prototype.componentMap = {};
ObjectLoader.prototype.counter = 0;