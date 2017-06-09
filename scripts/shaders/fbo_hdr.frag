#version 300 es
precision mediump float;
in vec2 vTexCoord;

uniform sampler2D inputTex;
uniform sampler2D addTex1;
uniform sampler2D addTex2;
uniform sampler2D addTex3;
uniform sampler2D addTex4;
uniform sampler2D addTex5;
uniform sampler2D ssao; //I know this should only be applied to ambient, but doing it here for artistic style.
uniform sampler2D fog;

uniform float gamma;
uniform float exposure;

layout(location = 0) out vec4 fragColor;

const float Lwhite2 = 5.0; //(squared) intensity at which light is rendered white


float toneMap (float luminance) {
    return (luminance * (1.0 + (luminance / Lwhite2))) / (luminance + 1.0);
}

//equation from https://knarkowicz.wordpress.com/2016/01/06/aces-filmic-tone-mapping-curve/
float ACESFilm( float x )
{
    float a = 2.51f;
    float b = 0.03f;
    float c = 2.43f;
    float d = 0.59f;
    float e = 0.14f;
    return clamp((x*(a*x+b))/(x*(c*x+d)+e), 0.0, 1.0);
}

void main() {
	vec3 bloom = texture(addTex1, vTexCoord).rgb/5.0 + texture(addTex2, vTexCoord).rgb/10.0 + texture(addTex3, vTexCoord).rgb/20.0 + texture(addTex4, vTexCoord).rgb/30.0 + texture(addTex5, vTexCoord).rgb/40.0;
	vec3 color = (textureLod(inputTex, vTexCoord, 0.0).rgb * (texture(ssao, vTexCoord).r))  + max(bloom, vec3(0.0));
	vec4 fog = texture(fog, vTexCoord);
    color = color + (fog.rgb * fog.a); //Fog shouldn't really be added on... but this seems to look ok?

	color *= 0.5 / exposure;

	//tonemap on luminance
	float L = length(color);
	float scale = ACESFilm(L);  //toneMap(L) / L;
	color *= scale;

	color = pow(color, vec3(1.0/2.2)); //linear to gamma correction
    fragColor =  vec4(color + gamma,1);
}
