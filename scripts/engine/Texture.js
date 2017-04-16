/**
 * Created by Accipiter Chalybs on 4/5/2017.
 */
class Texture
{
    constructor(filename, srgb=true, wrap=GL.REPEAT) {
        if (filename===undefined) { return; }

        if (Texture.prototype.textures.hasOwnProperty(filename)) {
            this.textureHandle = Texture.prototype.textures[filename];
            return;
        }

        let loadId = GameEngine.registerLoading();

        this.textureHandle = GL.createTexture();


        //TODO If needed, use placeholder while its loading (e.g. single pixel texture with uint16() as data)
        let image = new Image();
        image.onload = function () {
            this.finishLoad(image, filename, srgb, wrap, loadId);
        }.bind(this);
        image.src = filename;
    }

    finishLoad(image, filename, srgb, wrap, loadId) {
        let width = image.width;
        let height = image.height;

        //TODO needed? if so, find a way to get byte data of image
        //flip image upside down
       /* let buffer = new Uint8Array(width * height * 4);
        for (let y = 0; y < height; y++)
        {
            for (let x = 0; x < width; x++)
            {
                for (let i = 0; i < 4; i++)
                {
                    buffer[(x + y * width) * 4 + i] = image[(x + (height - y - 1) * width) * 4 + i];
                }
            }
        } */


        GL.bindTexture(GL.TEXTURE_2D, this.textureHandle);
        GL.texImage2D(GL.TEXTURE_2D, 0, srgb ? GL.SRGB8_ALPHA8 : GL.RGBA, width, height, 0, GL.RGBA,
            GL.UNSIGNED_BYTE, image);

        GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_WRAP_S, wrap);
        GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_WRAP_T, wrap);
        GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MAG_FILTER, GL.LINEAR);
        GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MIN_FILTER, GL.LINEAR_MIPMAP_LINEAR);

        GL.generateMipmap(GL.TEXTURE_2D);

        if (GLExtensions.anisotropic) {
            let anisoAmt = GL.getParameter(GLExtensions.anisotropic.MAX_TEXTURE_MAX_ANISOTROPY_EXT);
            GL.texParameterf(GL.TEXTURE_2D, GLExtensions.anisotropic.TEXTURE_MAX_ANISOTROPY_EXT, anisoAmt);
        }

        GL.bindTexture(GL.TEXTURE_2D, null);

        Texture.prototype.textures[filename] = this.textureHandle;

        GameEngine.completeLoading(loadId);
    }

    /**
     * Creates a 1 pixel texture of the specified colour - good for testing
     * @param color : a vec4 holding the r,g,b,a values of the 1 pixel texture.
     */
    static makeColorTex(color) {
        let tex = new Texture();
        let name = "Tex" + color[0] + color[1] + color[2] + color[3];
        if (Texture.prototype.textures.hasOwnProperty(name))
        {
            tex.textureHandle = Texture.prototype.textures[name];
            return tex;
        }
        tex.textureHandle = GL.createTexture();

        let buffer = new Uint8Array(4);
        for (let i = 0; i < 4; ++i) {
            buffer[i] = color[i] * 255;
        }



        GL.bindTexture(GL.TEXTURE_2D, tex.textureHandle);
        GL.texImage2D(GL.TEXTURE_2D, 0, GL.RGBA, 1, 1, 0, GL.RGBA,
            GL.UNSIGNED_BYTE, buffer);

        GL.bindTexture(GL.TEXTURE_2D, null);

        Texture.prototype.textures[name] = tex.textureHandle;
        return tex;
    }

    bindTexture(slot){
        let textureSlot = GL.TEXTURE0 + slot;
        GL.activeTexture(textureSlot);
        GL.bindTexture(GL.TEXTURE_2D, this.textureHandle);
    }
}

Texture.prototype.textures = {};