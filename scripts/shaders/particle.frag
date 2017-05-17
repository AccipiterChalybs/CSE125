#version 300 es

precision mediump float;

//in float angle;
in vec2 texCoord;
in vec4 color;

uniform sampler2D tex;

out vec4 frag_color;

void main()
{
	/*mat2 rot = mat2(cos(angle), sin(angle), -sin(angle), cos(angle));
	vec2 coord = clamp((texCoord - 0.5f) * rot + 0.5, vec2(0,0), vec2(1,1));
	*/
	vec4 texel = texture(tex, texCoord);
	frag_color = color * texel;
}