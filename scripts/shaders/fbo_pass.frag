#version 300 es
precision mediump float;
in vec2 vTexCoord;

uniform sampler2D inputTex;

layout(location = 0) out vec4 fragColor;

void main() {
	vec3 color = texture(inputTex, vTexCoord).rgb;
	float factor = length(color);
	color = mix(vec3(0), clamp(color, 0.0, 10.0), clamp(factor / 2.0 - 1.5, 0.0, 1.0));
    fragColor = vec4(color,1);
}
