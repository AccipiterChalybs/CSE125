/**
 * Created by Accipiter Chalybs on 4/5/2017.
 */

class GameObject {
  static get SceneRoot() {
    return null;
  }
  static findByName(name) {
    return null;
  }
  static findAllByName(name) {}
  static updateScene() {}
  constructor() {
    this.transform = null;
    this.components = [];
    this.name = '';
  }
  addComponent(component) {}
  removeComponent(component) {}
  getComponent(name) {}
  addChild(gameObject) {}
  isChildOf(gameObject) {}
  update() {}
  set name(name) {
    this.name = name;
  }
  get name() {
    return this.name;
  }
}
