/**
 * Created by Accipiter Chalybs on 4/9/2017.
 */

let UniformTypes = {};
UniformTypes.u1i = 0;
UniformTypes.u1f = 1;
UniformTypes.vec2 = 2;
UniformTypes.vec3 = 3;
UniformTypes.vec4 = 4;
UniformTypes.mat4 = 44;

class Shader {

    constructor(vertex, fragment) {
        this.id = -1;
        this.vertexSource = vertex;
        this.fragmentSource = fragment;
        this.loadId = GameEngine.registerLoading();
        this.reload();
    }

    //Set uniforms:
    //TODO look at UBO (uniform buffer objects) - could perhaps do global sets (e.g. projection matrix, view matrix, etc.)
    setUniform(name, value, type) {
        if (this.id === -1) return;

        let location = GL.getUniformLocation(this.id, name);
        if (Renderer.getCurrentShader() !== this) this.use();
        switch (type) {
            case UniformTypes.u1i:
                GL.uniform1i(location, value);
                break;
            case UniformTypes.u1f:
                GL.uniform1f(location, value);
                break;
            case UniformTypes.vec2:
                GL.uniform2fv(location, value);
                break;
            case UniformTypes.vec3:
                GL.uniform3fv(location, value);
                break;
            case UniformTypes.vec4:
                GL.uniform4fv(location, value);
                break;
            case UniformTypes.mat4:
                GL.uniformMatrix4fv(location, false, value);
                break;
            default:
                alert("SHADER TYPE NOT AVAILABLE for: " + name);
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
        let nextFunction = shader._getFragmentCode.bind(shader);

        let vCodeRequest = new XMLHttpRequest();
        vCodeRequest.onload = function () {
            shader.vertexCode = vCodeRequest.responseText;
            console.log(shader.vertexSource);
            nextFunction();
        };
        vCodeRequest.open("GET", this.vertexSource);
        vCodeRequest.send();
    }

    _getFragmentCode() {
        let shader = this;
        let nextFunction = shader._compileShader.bind(shader);

        let fCodeRequest = new XMLHttpRequest();
        fCodeRequest.onload = function () {
            shader.fragmentCode = fCodeRequest.responseText;
            nextFunction();
        };
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

        this.use();

        let status = GL.getProgramParameter(this.id, GL.LINK_STATUS);
        if (status === false) {
            console.error(GL.getProgramInfoLog(this.id));
            throw new Error();
        }

        if (this.loadId !== -1) {
            GameEngine.completeLoading(this.loadId);
            this.loadId = -1;
        }
    }

    static _compile(shaderCode, shader) {
        //read file

        GL.shaderSource(shader, shaderCode);
        GL.compileShader(shader);
        let status = GL.getShaderParameter(shader, GL.COMPILE_STATUS);
        if (status !== true) {
            console.error("Issue with shader code: " +shaderCode);
            console.error(" ");
            console.error(GL.getShaderInfoLog(shader));
            return -1;
        }

        return 0;
    }
}
