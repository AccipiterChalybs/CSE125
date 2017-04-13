/**
 * Created by Accipiter Chalybs on 4/7/2017.
 */

const GLExtensions = {
    init: function () {
        /* Extensions we're using that are already included in WebGL 2.0:
         > OES_texture_float
         > WEBGL_draw_buffers
         > OES_vertex_array_object
         */

        GLExtensions.texture_float_linear = GL.getExtension('OES_texture_float_linear');

        //For Anisotropic Texture Filtering (Texture.js)
        GLExtensions.anisotropic = (
            GL.getExtension('EXT_texture_filter_anisotropic') ||
            GL.getExtension('MOZ_EXT_texture_filter_anisotropic') ||
            GL.getExtension('WEBKIT_EXT_texture_filter_anisotropic')
        );

        //For Rendering to FrameBuffers in HDR
        GLExtensions.colorBuffer = GL.getExtension('EXT_color_buffer_float');
    },
};
