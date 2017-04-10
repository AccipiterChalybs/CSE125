#version 330

in float vDistance;
in float vDir;

uniform float trailLength;
uniform sampler2D colorTex;


layout(location = 0) out vec4 fragColor;

void main() {
	vec2 texCoord = vec2(vDir * 0.5 + 0.5,  clamp((trailLength - vDistance) / trailLength, 0.0, 1.0));
    fragColor = vec4(5,5,5, texCoord.y) * texture(colorTex, texCoord);
}
