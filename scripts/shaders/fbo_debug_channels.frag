#version 300 es
precision mediump float;
in vec2 vTexCoord;

uniform sampler2D inputTex;

uniform int rgbOutput;

layout(location = 0) out vec4 fragColor;

void main() {
    vec4 color = texture(inputTex, vTexCoord);
    if (rgbOutput == 1) {
        fragColor = vec4(color.rgb, 1.0);
    } else {
        fragColor = vec4(color.aaa, 1.0);
    }
}
