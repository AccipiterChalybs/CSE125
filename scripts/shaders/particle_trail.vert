#version 330

layout(location=0) in vec4 aPosition;
layout(location=1) in vec3 aNormal;
layout(location=2) in float distance;
layout(location=3) in float dir;

uniform float size;

uniform mat4 uM_Matrix;
uniform mat4 uV_Matrix;
uniform mat4 uP_Matrix;

out float vDistance;
out float vDir;


void main(){
	mat4 transformMatrix = uV_Matrix;
	vec4 pos = transformMatrix * aPosition;
	vec3 normal_screen = mat3(transformMatrix) * aNormal;
	vec4 tangent = normalize(vec4(normal_screen.y, -normal_screen.x, 0, 0));//cross(normalize(vec3(normal_screen.xy, 0.0)), vec3(0,0,1)), 0.0);
	vDistance = distance;
	vDir = dir;
	gl_Position = uP_Matrix * (pos + size*dir*tangent);
}
