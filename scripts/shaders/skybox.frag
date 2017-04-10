#version 300 es
precision mediump float;
in vec3 eyeDir;

uniform samplerCube environment;

layout(location = 0) out vec4 fragColor;
layout(location = 1) out vec4 eyeColor;

void main() {
    fragColor = textureLod(environment, normalize(eyeDir.xyz), 0.0);
    eyeColor = vec4(.5*(eyeDir) + vec3(.5, .5, .5), 1.0);
}
