/**
 * Created by Accipiter Chalybs on 4/6/2017.
 */

class ObjectLoader {

  static loadMeshes(filename) {
    let loadId = GameEngine.registerLoading();
    JsonLoader.loadJSON(filename, ObjectLoader._finishLoadScene.bind(this, loadId, filename));
  }

  static loadAnimation(animationName, filename, indexList) {
    let loadId = GameEngine.registerLoading();
    JsonLoader.loadJSON(filename, ObjectLoader._finishLoadAnim.bind(this, loadId, animationName, filename, indexList));
  }

  static _finishLoadScene(loadId, filename, scene) {
    if (scene === null) {
      return;
    }
    ObjectLoader._parseNode(scene, scene.rootnode, filename);
    GameEngine.completeLoading(loadId);
  }


  static _finishLoadAnim(loadId, animationName, filename, indexMap, scene) {
    if (scene === null) {
      return;
    }

    if ("animations" in scene) {
      let rootName = "No Root Name";
      for (let child of scene.rootnode.children) {
        if (child.children && child.children !== null && child.children.length > 0) {
          rootName = child.name;
        }
      }
      Animation.loadAnimationData(animationName, scene, rootName, indexMap);
    }
    GameEngine.completeLoading(loadId);
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
}
ObjectLoader.prototype.counter = 0;