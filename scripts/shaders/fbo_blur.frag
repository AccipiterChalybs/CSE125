#version 330
in vec2 vTexCoord;

uniform sampler2D inputTex;

uniform float width;
uniform float height;
uniform vec2 direction;
uniform float level;
layout(location = 0) out vec4 fragColor;

uniform float offset[3] = float[](0.0, 1.3846153846, 3.2307692308);
uniform float weight[3] = float[](0.2270270270, 0.3162162162, 0.0702702703);

void main()
{
    fragColor = textureLod(inputTex, vTexCoord, level) * weight[0];
    for(int i=1; i<3; i++) {
        fragColor += textureLod(inputTex, vTexCoord + offset[i] * direction / vec2(width, height), level) * weight[i];
        fragColor += textureLod(inputTex, vTexCoord - offset[i] * direction / vec2(width, height), level) * weight[i];
    }
}