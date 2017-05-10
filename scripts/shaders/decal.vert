#version 300 es
precision mediump float;

layout(location = 0) in vec4 aPosition;

uniform mat4 uM_Matrix;
uniform mat4 uV_Matrix;
uniform mat4 uP_Matrix;
		
out vec4 vPerspectivePosition;

void main () {
    vPerspectivePosition = uP_Matrix * uV_Matrix * uM_Matrix * aPosition;
	gl_Position = vPerspectivePosition;
}
