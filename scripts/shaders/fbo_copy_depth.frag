#version 300 es
precision mediump float;
in vec2 vTexCoord;

uniform samplerCube inputDepth;

uniform int currentFace;

void main() {
    vec3 cTexCoord;
    vec2 coord = (vTexCoord*2.0 - 1.0);

    if (currentFace==0)
        cTexCoord = vec3(1,-coord.y, -coord.x);
    if (currentFace==1)
        cTexCoord = vec3(-1,-coord.y, coord.x);
    if (currentFace==2)
        cTexCoord = vec3(coord.x, 1, coord.y);
    if (currentFace==3)
        cTexCoord = vec3(coord.x, -1, -coord.y);
    if (currentFace==4)
        cTexCoord = vec3(coord.x,-coord.y, 1);
    if (currentFace==5)
        cTexCoord = vec3(-coord.x, -coord.y, -1);

    gl_FragDepth = texture(inputDepth, cTexCoord).r;
}
