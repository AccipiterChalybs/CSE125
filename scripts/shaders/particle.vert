#version 300 es

layout (location = 0) in uint corner; // 0 = BR, 1 = BL, 2 = TL, 3 = TR
layout (location = 1) in uint seed;
layout (location = 2) in float duration;

uniform mat4 uM_Matrix;
uniform mat4 uV_Matrix;
uniform mat4 uP_Matrix;

// Updates differently per version
uniform vec3 emitterPos;
uniform vec3 emitterVelocity;

uniform float elapsedTime;
uniform vec3 minVelocity;
uniform vec3 maxVelocity;
uniform vec3 minAcceleration;
uniform vec3 maxAcceleration;

uniform vec4 minStartColor;
uniform vec4 maxStartColor;
uniform vec4 minEndColor;
uniform vec4 maxEndColor;

uniform float minStartSize;
uniform float maxStartSize;
uniform float minEndSize;
uniform float maxEndSize;
/*
uniform float minStartAngle;
uniform float maxStartAngle;
uniform float minAngularVelocity;
uniform float maxAngularVelocity;
uniform uint rotateTowardsVelocity; // 0 or 1
*/

out float angle;
out vec4 color;
out vec2 texCoord;

uint rand();
float range(float min, float max);
vec3 range(vec3 min, vec3 max);
vec4 range(vec4 min, vec4 max);
void srand(uint newSeed);

void main()
{
	vec4 pos;
	vec3 tmpVec;
	float tmp, t;
	
	srand(seed + uint((elapsedTime) / duration));

	texCoord.x = float(int(corner == 1u || corner == 2u));
	texCoord.y = float(int(corner > 1u));
	
	// Init
	pos = vec4(emitterPos, 1.0);
	t = mod(elapsedTime, duration);


	// Velocity
	vec3 velocity = range(minVelocity, maxVelocity);
	pos.xyz += (velocity - emitterVelocity) * t;

	// Acceleration
	tmpVec = range(minAcceleration, maxAcceleration);
	pos.xyz += 0.5f * tmpVec * t * t;


	// Size
	tmp = (1.0 - t / duration) * range(minStartSize, maxStartSize) + (t / duration) * range(minEndSize, maxEndSize);

	// Billboard particles
	mat4 transformMatrix = uV_Matrix;
	pos = transformMatrix * pos;
	pos.x += (texCoord.x - 0.5f) * tmp; // Multiply by size
	pos.y += (texCoord.y - 0.5f) * tmp;

	//vec2 velocity_screen = ((transformMatrix) * vec4(velocity - emitterVelocity + (tmpVec * t), 1.0)).xy;

    // Angle
	/*angle = (rotateTowardsVelocity) * atan(velocity_screen.y, velocity_screen.x)
		+ (1u - rotateTowardsVelocity) * (range(minStartAngle, maxStartAngle) + range(minAngularVelocity, maxAngularVelocity) * t);
    */

	tmp = t / duration;

	// Color
	//TODO full random, or just interpolate?
	color = (1.0 - tmp) * mix(minStartColor, maxStartColor, float(rand()) / 4294967295.0) + tmp * mix(minEndColor, maxEndColor, float(rand()) / 4294967295.0);


	gl_Position = uP_Matrix * pos;
}

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

vec3 range(vec3 min, vec3 max)
{
	return min + (max - min) * vec3(float(rand()) / 4294967295.0, float(rand()) / 4294967295.0, float(rand()) / 4294967295.0);
}

vec4 range(vec4 min, vec4 max)
{
	return min + (max - min) * vec4(float(rand()) / 4294967295.0, float(rand()) / 4294967295.0, float(rand()) / 4294967295.0, float(rand()) / 4294967295.0);
}

void srand(uint newSeed)
{
	rSeed = newSeed;
}