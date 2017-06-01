#version 300 es
precision mediump float;

in vec4 vPosition;
in vec2 vTexCoord;
uniform vec3 uLightPosition;

uniform float uFarDepth;

uniform sampler2D inputTex;

void main()
{
    if (texture(inputTex, vTexCoord).a > 0.25) discard;
    float bias = 0.0001;
    gl_FragDepth = length(vPosition.xyz - uLightPosition)/uFarDepth + bias;
}
