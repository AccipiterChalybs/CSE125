/**
 * Created by Accipiter Chalybs on 4/7/2017.
 */

const GLExtensions = {
  init: function () {
    //For floating point 16 bit textures

    // In WebGL2 //GLExtensions.texture_float = GL.getExtension('OES_texture_float');
    GLExtensions.texture_float_linear = GL.getExtension('OES_texture_float_linear');

    /* In WebGL 2
       GLExtensions.draw_buffers = GL.getExtension('WEBGL_draw_buffers');
       if (!GLExtensions.draw_buffers) {
       alert("No draw buffer support - this will not go well...");
       }
       */

    //For Anisotropic Texture Filtering (Texture.js)
    GLExtensions.anisotropic = (
    GL.getExtension('EXT_texture_filter_anisotropic') ||
    GL.getExtension('MOZ_EXT_texture_filter_anisotropic') ||
    GL.getExtension('WEBKIT_EXT_texture_filter_anisotropic')
    );
  },
};
