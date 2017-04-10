#version 330 compatibility

uniform mat4 uM_Matrix;
uniform mat4 uV_Matrix;
uniform mat4 uP_Matrix;

void main(){
	gl_Position = uP_Matrix * uV_Matrix * uM_Matrix * gl_Vertex;
	gl_FrontColor = gl_Color;
}
