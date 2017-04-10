#version 330

layout (location = 1) in float duration;
layout (location = 2) in int corner; // 0 = BL, 1 = BR, 2 = TL, 3 = TR
layout (location = 3) in uint seed;

uniform mat4 uM_Matrix;
uniform mat4 uV_Matrix;
uniform mat4 uP_Matrix;

// Updates differently per version
uniform vec3 emitterPos;
uniform vec3 emitterVelocity;

uniform vec3 minVelocity;
uniform vec3 maxVelocity;
uniform vec3 minAcceleration;
uniform vec3 maxAcceleration;
uniform vec3 minStartColor;
uniform vec3 maxStartColor;
uniform vec3 minEndColor;
uniform vec3 maxEndColor;
uniform float elapsedTime;
uniform float minStartSize;
uniform float maxStartSize;
uniform float minEndSize;
uniform float maxEndSize;
uniform float startOpacity;
uniform float endOpacity;
uniform float minStartAngle;
uniform float maxStartAngle;
uniform float minAngularVelocity;
uniform float maxAngularVelocity;
uniform uint rotateTowardsVelocity; // 0 or 1

// Burst specific
uniform float startTime;
uniform uint burstSeed;

out float opacity;
out float angle;
out vec3 color;
out vec2 texCoord;

uint rand();
float range(float min, float max);
vec3 range(vec3 min, vec3 max);
void srand(uint newSeed);

void main()
{
	vec4 pos;
	vec3 tmpVec;
	float tmp, t;
	
	srand(seed + burstSeed);

	texCoord.x = int(corner == 1 || corner == 2);
	texCoord.y = int(corner > 1);
	
	// Init
	pos = vec4(emitterPos, 1);
	t = elapsedTime - startTime;

	// Velocity
	vec3 velocity = range(minVelocity, maxVelocity);
	vec3 emitterVel = range(vec3(0, 0, 0), emitterVelocity);
	pos.xyz += (velocity - emitterVel) * t;

	// Acceleration
	tmpVec = range(minAcceleration, maxAcceleration);
	pos.xyz += 0.5f * tmpVec * t * t;

	// Size
	tmp = (1 - t / duration) * range(minStartSize, maxStartSize) + (t / duration) * range(minEndSize, maxEndSize);

	// Billboard particles
	mat4 transformMatrix = uV_Matrix * uM_Matrix;
	pos = transformMatrix * pos;
	pos.x += (texCoord.x - 0.5f) * tmp; // Multiply by size
	pos.y += (texCoord.y - 0.5f) * tmp;

	vec2 velocity_screen = ((transformMatrix) * vec4(velocity + (tmpVec * t), 1.0)).xy;

	// Angle
	angle = (rotateTowardsVelocity) * atan(velocity_screen.y, velocity_screen.x) 
		+ (1u - rotateTowardsVelocity) * (range(minStartAngle, maxStartAngle) + range(minAngularVelocity, maxAngularVelocity) * t);

	// Opacity
	tmp = t / duration;
	uint finished = 1u - min(1u, uint((elapsedTime - startTime) / duration));
	opacity = ((1 - tmp) * startOpacity + tmp * endOpacity) * float(finished);

	// Color
	color = (1 - tmp) * range(minStartColor, maxStartColor) + tmp * range(minEndColor, maxEndColor);

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
	return min + (max - min) * (rand() / 4294967295f);
}

vec3 range(vec3 min, vec3 max)
{
	return min + (max - min) 
		* vec3(float(rand()) / 4294967295f, float(rand()) / 4294967295f, float(rand()) / 4294967295f);
}

void srand(uint newSeed)
{
	rSeed = newSeed;
}