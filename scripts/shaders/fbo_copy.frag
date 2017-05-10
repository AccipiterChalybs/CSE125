#version 300 es
precision mediump float;
in vec2 vTexCoord;

uniform sampler2D inputTex1;
uniform sampler2D inputTex2;
uniform sampler2D inputTex3;

layout(location = 0) out vec4 fragColor1;
layout(location = 1) out vec4 fragColor2;
layout(location = 2) out vec4 fragColor3;

void main() {
    fragColor1 = texture(inputTex1, vTexCoord).rgba;
    fragColor2 = texture(inputTex2, vTexCoord).rgba;
    fragColor3 = texture(inputTex3, vTexCoord).rgba;
}
