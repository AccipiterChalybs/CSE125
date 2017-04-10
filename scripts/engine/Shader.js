/**
 * Created by Accipiter Chalybs on 4/9/2017.
 */

let UniformTypes = {};
UniformTypes.u1i = 0;
UniformTypes.u1f = 0;

class Shader {

    constructor(vertex, fragment) {
        this.id = -1;
        this.vertexSource = vertex;
        this.fragmentSource = fragment;
        this.reload();
    }

    //Set uniforms:

    setUniform(name, value, type) {
        let location = GL.getUniformLocation(this.id, name);
        if (Renderer.getCurrentShader() !== this) this.use();
        switch (type) {
            case UniformTypes.u1i:
                GL.uniform1i(location, value);
                break;
            case UniformTypes.u1f:
                GL.uniform1f(location, value);
                break;
        }
    }


    use() {
        GL.useProgram(this.id);
        Renderer._setCurrentShader(this);
    }

    reload() {
        this._getVertexCode();
    }

    _getVertexCode() {
        let shader = this;
        let nextFunction = shader._getFragmentCode;

        let vCodeRequest = new XMLHttpRequest();
        vCodeRequest.addEventListener("load", new function () {
            shader.vertexCode = this.responseText;
            nextFunction();
        } );
        vCodeRequest.open("GET", this.vertexSource);
        vCodeRequest.send();
    }

    _getFragmentCode() {
        let shader = this;
        let nextFunction = shader._compileShader;

        let fCodeRequest = new XMLHttpRequest();
        fCodeRequest.addEventListener("load", new function () {
            shader.fragmentCode = this.responseText;
            nextFunction();
        } );
        fCodeRequest.open("GET", this.fragmentSource);
        fCodeRequest.send();
    }


    _compileShader() {
        if (this.id !== -1) GL.deleteProgram(this.id);

        this.id = GL.createProgram();
        let vertexShader = GL.createShader(GL.VERTEX_SHADER);
        let fragmentShader = GL.createShader(GL.FRAGMENT_SHADER);

        if (Shader._compile(this.vertexCode, vertexShader) === -1) throw new Error();
        GL.attachShader(this.id, vertexShader);
        if (Shader._compile(this.fragmentCode, fragmentShader) === -1) throw new Error();
        GL.attachShader(this.id, fragmentShader);

        GL.linkProgram(this.id);
        GL.deleteShader(vertexShader);
        GL.deleteShader(fragmentShader);

        let status = GL.getProgramParameter(this.id, GL.LINK_STATUS);
        if (status === false) {
            console.error(GL.getProgramInfoLog(this.id));
            throw new Error();
        }
    }

    static _compile(shaderCode, shader) {
        //read file

        GL.shaderSource(shader, shaderCode);
        GL.compileShader(shader);
        let status = GL.getShaderParameter(shader, GL.COMPILE_STATUS);
        if (status !== true) {
            console.error(GL.getShaderInfoLog(shader));
            return -1;
        }

        return 0;
    }
}
