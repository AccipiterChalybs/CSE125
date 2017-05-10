#version 300 es

precision mediump float;

uniform sampler2D inputTex;
uniform sampler2D colourBuffer;
uniform sampler2D normalBuffer;
uniform sampler2D positionBuffer;

uniform mat4 uInvM_Matrix;

uniform vec3 uForwardNormal;

uniform float uSizeZ;

in vec4 vPerspectivePosition;

out vec4 fragColor;

void main() {
    vec2 normalizedPos = vPerspectivePosition.xy / vPerspectivePosition.w;
    vec2 texCoord = normalizedPos * 0.5 + 0.5;

    vec3 worldPos = texture(positionBuffer, texCoord).rgb;

    vec3 objPos = (uInvM_Matrix * vec4(worldPos, 1.0)).xyz;

    if (abs(objPos.x) > 0.5 || abs(objPos.y) > 0.5 || abs(objPos.z) > uSizeZ) discard;

    vec3 normal = texture(normalBuffer, texCoord).rgb * 2.0 - 1.0;

    if (dot(normal, uForwardNormal) <= 0.1) discard;

    vec3 destColour = texture(colourBuffer, texCoord).rgb;

    //need to flip y of images
    vec4 color = texture(inputTex, vec2(objPos.x + 0.5, 0.5 - objPos.y));
    fragColor = vec4((color.rgb * color.a) + (destColour.rgb * (1.0-color.a)), 1.0);
}
