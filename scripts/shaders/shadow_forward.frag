#version 300 es
precision mediump float;

in vec2 vTexCoord;
uniform sampler2D inputTex;

void main()
{
    if (texture(inputTex, vTexCoord).a < 0.5) discard;
    float bias = 0.0001;
    gl_FragDepth = gl_FragCoord.z + bias;
}
