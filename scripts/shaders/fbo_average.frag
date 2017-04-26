#version 300 es
precision mediump float;
in vec2 vTexCoord;

uniform sampler2D inputTex;

layout(location = 0) out vec4 fragColor;

void main() {
    fragColor = clamp(textureLod(inputTex, vTexCoord, 6.0), 0.0, 100.0);
}
