#version 300 es
precision mediump float;
in vec2 vTexCoord;

uniform sampler2D inputTex;

uniform int rgbOutput;

layout(location = 0) out vec4 fragColor;

void main() {
    vec4 color = texture(inputTex, vTexCoord);
    if (rgbOutput == 0) {
        fragColor = vec4(color.aaa, 1.0);
    } else if (rgbOutput == 1) {
        fragColor = vec4(color.rgb, 1.0);
    } else if (rgbOutput == 2) {
         fragColor = vec4(vec3(color.r), 1.0);
     }
}
