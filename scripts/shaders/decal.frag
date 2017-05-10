#version 300 es

precision mediump float;

uniform sampler2D colourBuffer;
uniform sampler2D normalBuffer;
uniform sampler2D positionBuffer;

uniform sampler2D inputColorTex;
uniform sampler2D inputNormalTex;

uniform mat4 uInvM_Matrix;
uniform vec3 uForwardNormal;

uniform float uSizeZ;

uniform vec4 uDecalColor;

in vec4 vPerspectivePosition;

layout(location = 0) out vec4 fragColor;
layout(location = 1) out vec4 fragNormal;


void main() {
    vec2 normalizedPos = vPerspectivePosition.xy / vPerspectivePosition.w;
    vec2 texCoord = normalizedPos * 0.5 + 0.5;

    vec3 worldPos = texture(positionBuffer, texCoord).rgb;

    vec3 objPos = (uInvM_Matrix * vec4(worldPos, 1.0)).xyz;

    if (abs(objPos.x) > 0.5 || abs(objPos.y) > 0.5 || abs(objPos.z) > uSizeZ) discard;

    vec4 normal = texture(normalBuffer, texCoord);


    if (dot( normal.xyz * 2.0 - 1.0, uForwardNormal) <= 0.1) discard;

    vec3 destColour = texture(colourBuffer, texCoord).rgb;

    //need to flip y of images
    vec4 color = texture(inputColorTex, vec2(objPos.x + 0.5, 0.5 - objPos.y)) * uDecalColor;
    vec4 decalNormal = texture(inputNormalTex, vec2(objPos.x + 0.5, 0.5 - objPos.y));

    fragColor = vec4((color.rgb * color.a) + (destColour.rgb * (1.0-color.a)), 1.0);
    fragNormal = vec4((decalNormal.rgb * color.a) + (normal.rgb * (1.0-color.a)), normal.a);
}
