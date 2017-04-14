/**
 * Created by Accipiter Chalybs on 4/5/2017.
 */
class Texture
{
    constructor(filename, srgb, wrap) {
        if (Texture.prototype.textures.count(filename)) {
            this.textureHandle = Texture.prototype.textures[filename];
            return;
        }
        this.textureHandle = GL.createTexture();

        GL.bindTexture(GL.TEXTURE_2D, this.textureHandle);

        //TODO use placeholder while its loading (e.g. single pixel texture with uint16() as data)
        //re to do: Although, if we pause loding, we might not need to do this
        let image = new Image();
        image.onload = function () {
            this.finishLoad(image, filename, srgb, wrap);
        }.bind(this);
        image.src = filename;
    }

    finishLoad(image, filename, srgb, wrap) {
        let width = image.width;
        let height = image.height;

        //TODO needed?
        //flip image upside down
        let buffer = [];
        for (let y = 0; y < height; y++)
        {
            for (let x = 0; x < width; x++)
            {
                for (let i = 0; i < 4; i++)
                {
                    buffer[(x + y * width) * 4 + i] = image[(x + (height - y - 1) * width) * 4 + i];
                }
            }
        }


        GL.texImage2D(GL.TEXTURE_2D, 0, srgb ? GL.SRGB8_ALPHA8 : GL.RGBA, width, height, 0, GL.RGBA,
            GL.UNSIGNED_BYTE, buffer);

        GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_WRAP_S, wrap);
        GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_WRAP_T, wrap);
        GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MAG_FILTER, GL.LINEAR);
        GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MIN_FILTER, GL.LINEAR_MIPMAP_LINEAR);

        GL.generateMipmap(GL.TEXTURE_2D);

        if (GLExtensions.anisotropic) {
            let anisoAmt = GL.getParameter(GLExtensions.anisotropic.MAX_TEXTURE_MAX_ANISOTROPY_EXT);
            GL.texParameterf(GL.TEXTURE_2D, GLExtensions.anisotropic.TEXTURE_MAX_ANISOTROPY_EXT, anisoAmt);
        }

        GL.bindTexture(GL.TEXTURE_2D, 0);

        Texture.prototype.textures[filename] = this.textureHandle;
    }

    static makeColorTex(color) {
        let name = "Tex" + color[0] + color[1] + color[2] + color[3];
        if (Texture.prototype.textures.count(name) > 0)
        {
            this.textureHandle = Texture.prototype.textures[name];
            return;
        }
        this.textureHandle = GL.createTexture();

        for (let i = 0; i < 4; ++i) {
            color[i] *= 255;
        }

        let buffer = color;

        GL.bindTexture(GL.TEXTURE_2D, this.textureHandle);
        GL.texImage2D(GL.TEXTURE_2D, 0, GL.RGBA, 1, 1, 0, GL.RGBA,
            GL.UNSIGNED_BYTE, buffer);

        GL.bindTexture(GL.TEXTURE_2D, 0);

        Texture.prototype.textures[name] = this.textureHandle;
    }

    bindTexture(slot){
        let textureSlot = GL.TEXTURE0 + slot;
        GL.activeTexture(textureSlot);
        GL.bindTexture(GL.TEXTURE_2D, this.textureHandle);
    }
}

Texture.prototype.textures = {};