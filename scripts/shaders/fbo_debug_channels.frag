#version 300 es
precision mediump float;
in vec2 vTexCoord;

uniform sampler2D inputTex;
uniform samplerCube cubeTex;

uniform int rgbOutput;
uniform int face;

layout(location = 0) out vec4 fragColor;

void main() {
    if (rgbOutput != 3) {
        vec4 color = texture(inputTex, vTexCoord);
        if (rgbOutput == 0) {
            fragColor = vec4(color.aaa, 1.0);
        } else if (rgbOutput == 1) {
            fragColor = vec4(color.rgb, 1.0);
        } else if (rgbOutput == 2) {
            fragColor = vec4(vec3(color.r), 1.0);
        }
    } else {
        vec4 color;
        if (face==0)
            color = texture(cubeTex, vec3(1,(vTexCoord*2.0 - 1.0).yx));
        if (face==1)
            color = texture(cubeTex, vec3(-1,(vTexCoord*2.0 - 1.0).y, -(vTexCoord*2.0 - 1.0).x));
        if (face==2)
            color = texture(cubeTex, vec3((vTexCoord*2.0 - 1.0).x, 1, (vTexCoord*2.0 - 1.0).y));
        if (face==3)
            color = texture(cubeTex, vec3((vTexCoord*2.0 - 1.0).x, -1, -(vTexCoord*2.0 - 1.0).y));
        if (face==4)
            color = texture(cubeTex, vec3(-(vTexCoord*2.0 - 1.0).x,(vTexCoord*2.0 - 1.0).y, 1));
        if (face==5)
            color = texture(cubeTex, vec3((vTexCoord*2.0 - 1.0), -1));
        fragColor = vec4(vec3(color.r), 1.0);
    }
}
