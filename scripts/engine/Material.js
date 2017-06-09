/**
 * Created by Accipiter Chalybs on 4/5/2017.
 */

MaterialTexture = {};
MaterialTexture.COLOR = "colorTex";
MaterialTexture.NORMAL = "normalTex";
MaterialTexture.MAT = "matTex";

class Material{
    constructor(shader, transparent) {
        this.shader = shader;
        this.transparent = transparent;
        this.uniforms = {};
        this.textures = {};
    }

    bind() {
        if (this.shader !== Renderer.currentShader) {
            this.shader.use();
        }

        for (let uniformName of Object.keys(this.uniforms)) {
            this.uniforms[uniformName].set(this.shader[uniformName]);
        }

        let i=0;
        for (let textureName of [MaterialTexture.COLOR, MaterialTexture.NORMAL, MaterialTexture.MAT]) {
            this._useTexture(textureName, i++);
        }
    }

    setTexture(name, value) {
        this.textures[name] = value;
    }

    //TODO do we also need to store value's type?
    setUniform(name, value) {
        this.uniforms[name] = value;
    }

    _useTexture(textureName, slot) {
        if (this.textures[textureName]) this.textures[textureName].bindTexture(slot);
    }
}