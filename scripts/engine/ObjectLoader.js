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
        JsonLoader.loadJSON(filename, ObjectLoader._finishLoadScene.bind(this, loadId, filename));
    }

    static _finishLoadScene(loadId, filename, scene) {

        if (scene === null) {
            return;
        }

        ObjectLoader._parseNode(scene, scene.rootnode, filename);

        if ("animations" in scene) {
            //TODO make this better
            let filenameList = filename.split('/');
            let animationName = (filenameList[filenameList.length-1]).substring(0,filenameList[filenameList.length-1].indexOf('.json'));

            //TODO make this better too
            let rootName = "No Root Name";
            for (let child of scene.rootnode.children) {
                if (child.children && child.children !== null && child.children.length > 0) {
                  rootName = child.name;
                }
            }

            Animation.loadAnimationData(animationName, scene, rootName);
        }

        GameEngine.completeLoading(loadId);
    }

    static _getPath ( name ) {

    }

    static _parseNode(scene, currentNode, filename) {


      let name = currentNode.name;
      Debug.assert(name !== "defaultobject");

        if (!IS_SERVER) {
            /*if (name in lights) {
                nodeObject.addComponent(lights[name]);
            }*/

            if ("meshes" in currentNode) {
              Debug.assert(currentNode.meshes.length <= 1);
              if (!(name in Mesh.prototype.meshMap)) {
                let meshIndex = currentNode.meshes[0];
                Mesh.loadMesh(name, scene.meshes[meshIndex]);
              }
            }
        }

        if ("children" in currentNode) {
            for (let child of currentNode.children) {
                ObjectLoader._parseNode(scene, child, filename);
            }
        }
    }


    static loadCollision(gameObject, filename) {
        let loadId = GameEngine.registerLoading();
        JsonLoader.loadJSON(filename, ObjectLoader._finishLoadCollision.bind(this, loadId, gameObject));
    }

    static _finishLoadCollision(loadId, gameObject, data) {
        let collider = new CompoundCollider();
        gameObject.addComponent(collider);
        for (let colShape of data) {
          collider.addShape(colShape.type, colShape.size, colShape.pos);
        }

        GameEngine.completeLoading(loadId);
    }

}


ObjectLoader.prototype.componentMap = {};
ObjectLoader.prototype.counter = 0;