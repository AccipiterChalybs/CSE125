#version 300 es
precision mediump float;
in vec2 vTexCoord;

uniform sampler2D positionTex;

uniform vec2 uScreenSize;
uniform vec3 cameraPos;


uniform float uFogPower;
uniform float uPowerB;
uniform vec3 uFogColor;

layout(location = 0) out vec4 fragColor;


void main()
{
  vec3 ray = texture(positionTex, vTexCoord).xyz; //this is world position - camera position
  if (ray == vec3(0,0,0)) discard;

  //heightFormula from http://iquilezles.org/www/articles/fog/fog.htm
  float fogStrength = uFogPower * exp(-uPowerB * cameraPos.y) * (1.0-exp( -uPowerB*length(ray)*ray.y ))/ray.y;

  fogStrength = min(fogStrength, 0.36);

  fragColor = vec4(uFogColor,fogStrength);
}