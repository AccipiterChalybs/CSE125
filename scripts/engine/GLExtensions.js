/**
 * Created by Accipiter Chalybs on 4/7/2017.
 */


class GLExtensions {
    static init () {
        //For
        GLExtensions.texture_float = GL.getExtension('OES_texture_float');
        GLExtensions.texture_float_linear = GL.getExtension('OES_texture_float_linear');

        GLExtensions.draw_buffers = GL.getExtension('WEBGL_draw_buffers');
        if (!GLExtensions.draw_buffers) {
            alert("No draw buffer support - this will not go well...");
        }
    }
}