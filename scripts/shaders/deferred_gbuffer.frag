#version 300 es
precision mediump float;

uniform sampler2D colorTex; //color texture - rgb: color | a: team mask
uniform sampler2D matTex; //material texture - r: metalness | g: IOR | b: roughness | a: unused
uniform sampler2D normalTex; //normal texture - rgb: normal | a: unused

uniform vec3 cameraPos;

in vec2 vTexCoord;
in vec3 vNormal;
in vec4 vPosition;
in vec3 vTangent;
in vec3 vBitangent;

const vec3 teamColor = vec3(1,0,0);

layout (location = 0) out vec4 ColorOut; //color texture - rgb: color | a: blank
layout (location = 1) out vec4 NormOut; //normal texture - rgb: normal | a: metalness
layout (location = 2) out vec4 PosOut; //position texture - rgb: position | a: roughness

void main()
{
	vec3 mat = texture(matTex, vTexCoord).xyz;

    vec3 norm = normalize(vNormal);
    vec3 tangent = normalize(vTangent);
    tangent = normalize(tangent - dot(tangent, norm) * norm);
    vec3 binormal = cross(tangent, norm);
    mat3 model = mat3(tangent, binormal, norm);

	vec4 color = texture(colorTex, vTexCoord);
    ColorOut = vec4(teamColor * (1.0-color.a) + color.rgb, 1.0);

    norm = 2.0 * texture(normalTex, vTexCoord).xyz - vec3(1.0);
    norm.y = -norm.y;
    NormOut = vec4(normalize(model * norm) * 0.5 + 0.5, mat.x);

    PosOut = vec4(vPosition.xyz/vPosition.w - cameraPos, mat.z);
}
