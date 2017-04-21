#version 300 es
precision mediump float;
in vec2 vTexCoord;

uniform sampler2D inputTex;
uniform sampler2D addTex1;
uniform sampler2D addTex2;
uniform sampler2D addTex3;
uniform sampler2D addTex4;
uniform sampler2D addTex5;

uniform float exposure;

layout(location = 0) out vec4 fragColor;

void main() {
	vec3 bloom = texture(addTex1, vTexCoord).rgb/5.0 + texture(addTex2, vTexCoord).rgb/10.0 + texture(addTex3, vTexCoord).rgb/20.0 + texture(addTex4, vTexCoord).rgb/30.0 + texture(addTex5, vTexCoord).rgb/40.0;
	vec3 color = textureLod(inputTex, vTexCoord, 0.0).rgb + max(bloom, vec3(0.0));
	color *= 4.0/exposure;
	color = color / (color + vec3(1.0));
	color = pow(color, vec3(1.0/2.2));
    fragColor = vec4(color,1);
}
