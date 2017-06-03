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

const int sample_count = 16;
const vec2 poissonDisk[16] = vec2[](
vec2(-0.8919533582805225, -0.040334146316760355),
vec2(-0.15044204514600149, -0.46386131910986705),
vec2(-0.23206994925631516, 0.7143164096366398),
vec2(0.6590062652549565, -0.7148737702066644),
vec2(-0.7897024088377917, 0.0590403404856489),
vec2(0.4810451963898865, 0.39868640255296756),
vec2(-0.11991918519311802, 0.05876699813624387),
vec2(0.03922230230198842, 0.09129516647631901),
vec2(-0.2428978619049903, 0.1947261483542239),
vec2(0.7936966883628382, -0.5979133163763386),
vec2(0.43188816832602384, 0.11092629463449295),
vec2(0.8953955556608171, 0.09146620387163344),
vec2(0.05303104165273079, 0.03543904118228003),
vec2(0.5793028717780759, -0.06553494796914884),
vec2(-0.19726364793432014, -0.24916301659682444),
vec2(-0.05067515003838261, -0.05016262120636546)
 );

 /*

   vec2( -0.94201624, -0.39906216 ),
   vec2( 0.94558609, -0.76890725 ),
   vec2( -0.094184101, -0.92938870 ),
   vec2( 0.34495938, 0.29387760 ),
   */


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
  vec2 screenTexCoord = gl_FragCoord.xy / uScreenSize;

  /*vec3 n = texture(normalTex, screenTexCoord).xyz;
  n = (n * 2.0) - 1.0;*/
  vec3 pos = texture(positionTex, screenTexCoord).xyz;

    vec2 pixelOffset = (uRadius/uScreenSize);
    vec3 n = cross(normalize(dFdx(pos)), normalize(dFdy(pos)));


	srand(uint(pos.x*50.0 + cameraPos.x*50.0));

    float sum = 0.0;
        float rotation = range(0.0, 6.28);
        float cosTheta = cos(rotation);
        float sinTheta = sin(rotation);

    float samples = 0.001;

    for (int i=0; i<sample_count; ++i) {
        vec2 sampleOffset = vec2(poissonDisk[i].x * cosTheta - poissonDisk[i].y * sinTheta, poissonDisk[i].x * sinTheta + poissonDisk[i].y * cosTheta);
        vec3 samplePos = texture(positionTex, screenTexCoord + (pixelOffset * sampleOffset)).xyz;
        vec3 v = samplePos - pos;

        float toofar = step(length(v)/5.0, 1.0);
        float toosharp = step(0.1, dot(normalize(v),normalize(n)));

        float depthBias = -10.0 * length(pos);
        float bot = dot(v,v) + 0.001;
        float top = dot(v, n) + 0.0001 * depthBias;
        top = max(top, 0.0);
        //sum += (top / bot);
        float valid = 1.0;//toofar * toosharp;
        sum += valid*(top / bot) - (1.0-valid);
        samples += valid;
    }

    float coeff = 2.0 * uSigma / samples;
    float AO = pow(max(0.0, 1.0 - (coeff * sum)), 2.0);
    fragColor = vec4(AO, AO, AO, 1.0);
}