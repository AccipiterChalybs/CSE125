#version 330
layout(location = 0) in vec4 aPosition;
layout(location = 1) in vec3 aNormal;
layout(location = 2) in vec2 aTexCoord;
layout(location = 3) in vec3 aTangent;
layout(location = 4) in vec3 aBitangent;

uniform float uScale;
uniform vec3 uLightPosition;
uniform mat4 uV_Matrix;
uniform mat4 uP_Matrix;
		
out vec4 vPosition;

void main () {
    vPosition = uV_Matrix * vec4(aPosition.xyz * uScale + uLightPosition, 1);
	gl_Position = uP_Matrix * vPosition;
}
