#version 300 es
precision mediump float;
in vec3 eyeDir;

uniform samplerCube environment;

layout(location = 0) out vec4 fragColor;
layout(location = 1) out vec4 eyeColor;

void main() {
    vec4 color = texture(environment, normalize(eyeDir.xyz)).rgba;
    fragColor = vec4(color);
    eyeColor = vec4(.5*(eyeDir) + vec3(.5, .5, .5), 1.0);
}
