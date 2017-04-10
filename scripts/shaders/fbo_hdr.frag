#version 330
in vec2 vTexCoord;

uniform sampler2D inputTex;
uniform sampler2D addTex1;
uniform sampler2D addTex2;
uniform sampler2D addTex3;
uniform sampler2D addTex4;
uniform sampler2D addTex5;

uniform float exposure = 0.25f;

layout(location = 0) out vec4 fragColor;

void main() {
	vec3 bloom = texture(addTex1, vTexCoord).rgb/5 + texture(addTex2, vTexCoord).rgb/10 + texture(addTex3, vTexCoord).rgb/20 + texture(addTex4, vTexCoord).rgb/30 + texture(addTex5, vTexCoord).rgb/40;
	vec3 color = textureLod(inputTex, vTexCoord, 0).rgb + max(bloom, vec3(0.0));
	float exposureTex = length(textureLod(inputTex, vTexCoord, 10.f));
	color *= mix(exposure, exposureTex, 0.25);
	color = color / (color + vec3(1));
	color = pow(color, vec3(1/2.2));
    fragColor = vec4(color,1);
}
