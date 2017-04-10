#version 330
precision mediump float;

void main()
{
    float bias = 0.0001;
    gl_FragDepth = gl_FragCoord.z + bias;
}
