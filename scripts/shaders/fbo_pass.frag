#version 330
in vec2 vTexCoord;

uniform sampler2D inputTex;

layout(location = 0) out vec4 fragColor;

void main() {
	vec3 color = texture(inputTex, vTexCoord).rgb;
	float factor = length(color);
	color = mix(vec3(0), color, clamp(factor / 2 - 1.5, 0, 1));
    fragColor = vec4(color,1);
}
