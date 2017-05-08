#version 300 es
precision mediump float;

in vec4 vPosition;
uniform vec3 uLightPosition;

uniform float uFarDepth;

void main()
{
    float bias = 0.0001;
    gl_FragDepth = length(vPosition.xyz - uLightPosition)/uFarDepth + bias;
}
