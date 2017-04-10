#version 330
layout(location = 0) in vec4 aPosition;
layout(location = 1) in vec3 aNormal;
layout(location = 2) in vec2 aTexCoord;
layout(location = 3) in vec3 aTangent;
layout(location = 4) in vec3 aBitangent;
layout(location = 5) in vec4 aBoneWeight;
layout(location = 6) in ivec4 aBoneId;

uniform mat4 uM_Matrix;
uniform mat4 uV_Matrix;
uniform mat4 uP_Matrix;
		
const int MAX_BONES = 100;
uniform mat4 bone_Matrix[MAX_BONES];


out vec4 vPosition;
out vec3 vNormal;
out vec2 vTexCoord;
out vec3 vTangent;
out vec3 vBitangent;

void main () {
	mat4 transformMatrix;
	transformMatrix = bone_Matrix[aBoneId.x] * aBoneWeight.x;
	transformMatrix += bone_Matrix[aBoneId.y] * aBoneWeight.y;
	transformMatrix += bone_Matrix[aBoneId.z] * aBoneWeight.z;
	transformMatrix += bone_Matrix[aBoneId.w] * aBoneWeight.w;

	transformMatrix = uV_Matrix * uM_Matrix * transformMatrix;
		  
	vNormal = mat3(transformMatrix) * aNormal;
	vTangent = mat3(transformMatrix) * aTangent;
	vBitangent = mat3(transformMatrix) * aBitangent;
    vTexCoord = aTexCoord;
    vPosition = transformMatrix * aPosition;
	gl_Position = uP_Matrix * vPosition;
}
