/**
 * Created by Accipiter Chalybs on 4/6/2017.
 */

class ObjectLoader {

    componentMap = {};
    counter = 0;


    static addComponentMap(name, func) {
        if (this.componentMap[name]) {
            this.componentMap[name].push(func);
        } else {
            this.componentMap[name] = [func];
        }
    }

    static loadScene(filename) {
        _loadJSON(filename, _finishLoadScene);
    }

    static _finishLoadScene(scene) {

        if (scene === null) {
            return;
        }

        let lights = {};
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
        }

        let loadingAcceleration = {};

        let retScene = _parseNode(scene, scene.mRootNode, filename, loadingAcceleration, lights);

        //TODO this looks incorrect - might need to put inside the recursive parseNode?
        if (scene.HasAnimations()) {
            retScene.addComponent(new Animation(scene, loadingAcceleration));
            linkRoot(retScene.getComponent("Animation"), retScene.transform);
        }
    }

    static _loadJSON(url, func) {
        //from http://stackoverflow.com/questions/12460378/how-to-get-json-from-url-in-javascript
        var getJSON = function(url, callback) {
            var xhr = new XMLHttpRequest();
            xhr.open('GET', url, true);
            xhr.responseType = 'json';
            xhr.onload = function() {
                var status = xhr.status;
                if (status == 200) {
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
    }

    static _getPath ( name ) {

    }

    static _parseNode(scene, currentNode, filename, loadingAcceleration, lights) {
        let nodeObject = new GameObject();

        let pos = null;
        let scale = null;
        let rotate = null;

        //TODO do we need to overwrite this function?
        currentNode.mTransform.Decompose(scale, rotate, pos);

        nodeObject.transform.scale(scale.x);
        nodeObject.transform.translate(pos.x, pos.y, pos.z);
        nodeObject.transform.rotate(quat(rotate.w, rotate.x, rotate.y, rotate.z));

        let name = currentNode.mName;
        if (name === "defaultobject") name = filename + this.counter;
        nodeObject.setName(name);

        if (lights.count(name)) {
            nodeObject.addComponent(lights[name]);
        }

        if (currentNode.mNumMeshes > 0) {
            if (!Mesh.meshMap.count(name)) {
                let meshIndex = currentNode.mMeshes;
                Mesh.loadMesh(name, scene.mMeshes[meshIndex]);
            }

            var mesh = new Mesh(name);

            var aMat = scene.mMaterials[scene.mMeshes[currentNode.mMeshes].mMaterialIndex];
            var foundForward = name.search("Forward") !== -1;
            var foundEmit = name.search("Emit") !== -1;
            let mat = null;

            if (foundForward) {
                mat = new Material(Renderer.getShader(scene.mMeshes[currentNode.mMeshes].HasBones() ? FORWARD_PBR_SHADER_ANIM : FORWARD_UNLIT));
                mat.transparent = true;
            }
            else if (foundEmit) {
                mat = new Material(Renderer.getShader(FORWARD_EMISSIVE));
                mat.transparent = true;
            } else {
                mat = new Material(Renderer.getShader(scene.mMeshes[currentNode.mMeshes].HasBones() ? DEFERRED_PBR_SHADER_ANIM, DEFERRED_PBR_SHADER));
                mat.transparent = false;
            }

            if (aMat->GetTextureCount(aiTextureType_DIFFUSE) > 0) {
                let path = null;
                aMath.GetTexture(aiTextureType_DIFFUSE, 0, path);
                let tex = new Texture(getPath(filename) + path, true);
                mat["colorTex"] = tex;
            }
            else {
                let color = vec4(1,1,1,1);
                mat["colorTex"] = Texture.makeColorTex(color);
            }

            if (aMat.GetTextureCount(aiTextureType_NORMALS) > 0) {
                let path = null;
                aMath.GetTexture(aiTextureType_NORMALS, 0, path);
                let tex = new Texture(getPath(filename) + path, false);
                mat["normalTex"] = tex;
            }
            else {
                let color = vec4(0.5,0.5,1,1);
                mat["normalTex"] = Texture.makeColorTex(color);
            }

            if (aMat.GetTextureCount(aiTextureType_SPECULAR) > 0) {
                let path = null;
                aMath.GetTexture(aiTextureType_DIFFUSE, 0, path);
                let tex = new Texture(getPath(filename) + path, true);
                mat["colorTex"] = tex;
            }
            else {
                let color = vec4(0,0.45,0.7,1);
                mat["colorTex"] = Texture.makeColorTex(color);
            }
            mat["userTextures"] = true;
            mesh.setMaterial(mat);

            nodeObject.addComponent(mesh);

        }

        loadingAcceleration[current.mName] = nodeObject.transform;

        for (let c = 0; c < currentNode.mNumChildren; ++c) {
            nodeObject.addChild(parseNode(scene, currentNode.mChildren[c], filename, loadingAcceleration, lights));
        }

        let compTypeName;
        let dividerPos = name.search('.');
        if (dividerPos !== -1) {
            compTypeName = name.substring(0, dividerPos);
        } else {
            compTypeName = name;
        }


        let components = this.componentMap[compTypeName];
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
        if (currentMesh !== null) {
            currentMesh.animationRoot = anim;
        }
        for (let child of currentTransform.children) {
            linkRoot(anim, child);
        }
    }

}