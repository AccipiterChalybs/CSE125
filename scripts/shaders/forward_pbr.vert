#version 330
layout(location = 0) in vec4 aPosition;
layout(location = 1) in vec3 aNormal;
layout(location = 2) in vec2 aTexCoord;
layout(location = 3) in vec3 aTangent;
layout(location = 4) in vec3 aBitangent;

uniform mat4 uM_Matrix;
uniform mat4 uV_Matrix;
uniform mat4 uP_Matrix;
		
out vec4 vPosition;
out vec3 vNormal;
out vec2 vTexCoord;
out vec3 vTangent;
out vec3 vBitangent;

void main () {
	vNormal = mat3(uM_Matrix) * aNormal;
	vTangent = mat3(uM_Matrix) * aTangent;
	vBitangent = mat3(uM_Matrix) * aBitangent;
    vTexCoord = aTexCoord;
    vPosition = uV_Matrix * uM_Matrix * aPosition;
	gl_Position = uP_Matrix * vPosition;
}
