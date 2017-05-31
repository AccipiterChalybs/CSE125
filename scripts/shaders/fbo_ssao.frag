#version 300 es
precision mediump float;
in vec2 vTexCoord;

uniform sampler2D normalTex;
uniform sampler2D positionTex;

uniform vec2 uScreenSize;
uniform float uRadius;
uniform float uSigma;
uniform float uK;

uniform vec3 cameraPos;

layout(location = 0) out vec4 fragColor;

const int sample_count = 5;
const vec2 poissonDisk[5] = vec2[](
   vec2( -0.94201624, -0.39906216 ),
   vec2( 0.94558609, -0.76890725 ),
   vec2( -0.094184101, -0.92938870 ),
   vec2( 0.34495938, 0.29387760 ),
   vec2( 0.0, 0.0 )
 );


// RANDOM FUNCTIONS
// Source: http://www.reedbeta.com/blog/2013/01/12/quick-and-easy-gpu-random-numbers-in-d3d11/

uint rSeed = 1u;

uint rand()
{
    rSeed = (rSeed ^ 61u) ^ (rSeed >> 16u);
    rSeed *= 9u;
    rSeed = rSeed ^ (rSeed >> 4u);
    rSeed *= 0x27d4eb2du;
    rSeed = rSeed ^ (rSeed >> 15u);
    return rSeed;
}

float range(float min, float max)
{
	return min + (max - min) * (float(rand()) / 4294967295.0);
}

void srand(uint newSeed)
{
	rSeed = newSeed;
}


//SSAO method from http://graphics.cs.williams.edu/papers/AlchemyHPG11/
void main()
{
	srand(uint(gl_FragCoord.x * gl_FragCoord.y));
  vec2 screenTexCoord = gl_FragCoord.xy / uScreenSize;
  vec3 n = texture(normalTex, screenTexCoord).xyz;
  n = (n * 2.0) - 1.0;
  vec3 pos = texture(positionTex, screenTexCoord).xyz;

    vec2 pixelOffset = (uRadius/uScreenSize);
    n = cross(normalize(dFdx(pos)), normalize(dFdy(pos)));

    float sum = 0.0;
        float rotation = range(0.0, 6.28);
        float cosTheta = cos(rotation);
        float sinTheta = sin(rotation);
    for (int i=0; i<sample_count; ++i) {
        float depth = -length(pos);
        vec2 sampleOffset = vec2(poissonDisk[i].x * cosTheta - poissonDisk[i].y * sinTheta, poissonDisk[i].x * sinTheta + poissonDisk[i].y * cosTheta);
        vec3 samplePos = texture(positionTex, screenTexCoord + (pixelOffset * sampleOffset)).xyz;
        vec3 v = samplePos - pos;
    //fragColor = vec4(v, 1.0);
    //return;
        float bot = dot(v,v) + 0.001;
        float top = dot(v, n) + 0.0001 * depth;
        top = max(top, 0.0);
        sum += (top / bot);
    }

    float coeff = 2.0 * uSigma / float(sample_count);
    float AO = pow(max(0.0, 1.0 - (coeff * sum)), uK);
    fragColor = vec4(AO, AO, AO, 1.0);
}