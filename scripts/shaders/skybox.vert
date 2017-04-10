#version 300 es
precision mediump float;
out vec3 eyeDir;

layout(location=0) in vec4 aPosition;

uniform mat4 uV_Matrix;
uniform mat4 uP_Matrix;

//idea from http://gamedev.stackexchange.com/questions/60313/implementing-a-skybox-with-glsl-version-330

void main(){

mat3 invModel = transpose(mat3(uV_Matrix));
eyeDir = invModel * (inverse(uP_Matrix) * aPosition).xyz;

gl_Position = vec4(aPosition.xy, 1.0, 1.0);
}
