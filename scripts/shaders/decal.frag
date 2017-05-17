#version 300 es

precision mediump float;

uniform mat4 uV_Matrix;

uniform sampler2D colourBuffer;
uniform sampler2D normalBuffer;
uniform sampler2D positionBuffer;

uniform sampler2D inputColorTex;
uniform sampler2D inputNormalTex;

uniform mat4 uInvM_Matrix;
uniform vec3 uForwardNormal;

uniform float uSizeZ;

uniform vec4 uDecalColor;

uniform vec3 decalWorldPosition; //for converting worldPosition to relativePosition for better precision

in vec4 vPerspectivePosition;

layout(location = 0) out vec4 fragColor;
layout(location = 1) out vec4 fragNormal;


void main() {
    vec2 normalizedPos = vPerspectivePosition.xy / vPerspectivePosition.w;
    vec2 texCoord = normalizedPos * 0.5 + 0.5;
    vec3 worldPos = texture(positionBuffer, texCoord).rgb;
    vec3 objPos = (uInvM_Matrix * vec4(worldPos, 1.0)).xyz;


    //partial derivative idea from http://martindevans.me/game-development/2015/02/27/Drawing-Stuff-On-Other-Stuff-With-Deferred-Screenspace-Decals/
    //WARNING: if worldPos is too large, precision issues arise! See here: https://www.enkisoftware.com/devlogpost-20150131-1-Normal_generation_in_the_pixel_shader
    vec3 dWdx = dFdx(worldPos);
    vec3 dWdy = dFdy(worldPos);

    if (abs(objPos.x) > 0.5 || abs(objPos.y) > 0.5 || abs(objPos.z) > uSizeZ) discard;

    //use partial derivatives to calculate tangent space basis
    vec3 normal = normalize(cross(dWdx, dWdy));

    if (dot( normal.xyz * 2.0 - 1.0, uForwardNormal) <= 0.1) discard;

    vec3 tangent = normalize(dWdx);
    vec3 bitangent = normalize(dWdy);
    mat3 view = transpose(mat3(uV_Matrix));

    vec4 decalNormal = texture(inputNormalTex, vec2(objPos.x + 0.5, 0.5 - objPos.y));
    decalNormal = decalNormal *2.0 -1.0;
    decalNormal.xyz = normalize(tangent * decalNormal.x + bitangent * decalNormal.y + normal * decalNormal.z);
    decalNormal = decalNormal * 0.5 + 0.5;


    vec3 destColour = texture(colourBuffer, texCoord).rgb;
    vec4 destNormal = texture(normalBuffer, texCoord);

    //need to flip y of images
    vec4 color = texture(inputColorTex, vec2(objPos.x + 0.5, 0.5 - objPos.y)) * uDecalColor;

    fragColor = vec4((color.rgb * color.a) + (destColour.rgb * (1.0-color.a)), 1.0);
    fragNormal = vec4((decalNormal.rgb * color.a) + (destNormal.rgb * (1.0-color.a)), destNormal.a);
}
