#version 300 es
precision mediump float;

void main()
{
    float bias = 0.0001;
    gl_FragDepth = gl_FragCoord.z + bias;
}
