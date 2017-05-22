#version 300 es
precision mediump float;
in vec4 vPosition;

out vec4 frag_color;

const float PI = 3.14159265359;

uniform sampler2D colorTex; //color texture - rgb: color | a: metalness
uniform sampler2D normalTex; //normal texture - rgb: normal | a: Empty
uniform sampler2D posTex; //position texture - rgb: position | a: roughness
uniform sampler2D shadowTex;

//world space camera position, to get view vector
uniform vec3 cameraPos;
uniform vec3 uLightColor;
uniform vec3 uLightPosition;
uniform vec3 uLightDirection;
uniform vec2 uScreenSize;
uniform mat4 uShadow_Matrix;

float GGX_Visibility(float dotProduct, float k) {
	//return 2.0 / (dotProduct + sqrt(k*k + (1.0 - k*k)*dotProduct*dotProduct)); //More accurate, but slower version

	k=k/2.0;
	return 1.0 / (dotProduct * (1.0 - k) + k);
}

float GGX_D(float dotNH, float a) {
	a = clamp(a, 0.001, 1.0); //prevent a (and a2) from being too close to zero
	float a2 = a*a;
	float bot = (dotNH * dotNH * (a2 - 1.0) + 1.0);
	return (a2) / (PI * bot * bot);
}

vec3 SpecularBRDF(vec3 lightColor, vec3 normal, vec3 view, vec3 lightDir, float a, vec3 F0, float d) {
		vec3 halfVec = normalize(view + lightDir);
		
		float dotNL = clamp(dot(normal, lightDir), 0.0, 1.0);

		float dotNV = clamp(dot(normal, view), 0.0, 1.0);
		float dotLH = clamp(dot(lightDir, halfVec), 0.0, 1.0);

		vec3 F = F0 + (vec3(1.0,1.0,1.0)-F0) * pow(1.0-dotLH, 5.0);

		float k = clamp(a+.36, 0.0, 1.0);
		float G = GGX_Visibility(dotNV, k) * GGX_Visibility(dotNL, k);

		return F * lightColor * (G * dotNL);
}

const vec2 poissonDisk[4] = vec2[](
   vec2( -0.94201624, -0.39906216 ),
   vec2( 0.94558609, -0.76890725 ),
   vec2( -0.094184101, -0.92938870 ),
   vec2( 0.34495938, 0.29387760 )
 );


float textureShadow(float posZ, vec2 uv) {
    return step(posZ, texture(shadowTex, uv).r);
}

void main () {
  vec2 screenTexCoord = gl_FragCoord.xy / uScreenSize;
  vec4 albedo = texture(colorTex, screenTexCoord);
  if(albedo.xyz == vec3(0.0)) discard; //TODO does this actually provide a performance boost?
  vec4 pos = texture(posTex, screenTexCoord);
  vec4 normal = texture(normalTex, screenTexCoord);
  vec3 mat = vec3(albedo.a, pos.w, normal.w);
  normal.xyz = normal.xyz * 2.0 - 1.0;

  vec3 view = normalize(cameraPos - pos.xyz);

  mat.y += 0.0001; //there seem to be issues with roughness = 0 due to visibility
  float a = sqrt(mat.y);// squaring it makes everything shiny, sqrting it looks like linear roughness

  //F0 is essentially specular color, as well as Fresnel term
  vec3 F0 = vec3(1,1,1) * 0.02777777777;//pow((1.0 - IOR) / (1.0 + IOR), 2.0);
  F0 = mix(F0, albedo.rgb, mat.r); //interpolate Fresnel with the color as metalness increases (with metalness=1, color => reflection color)
  F0 = mix(vec3(1,1,1) * dot(vec3(.33,.33,.33),F0), F0, mat.r); //my own improvement - could be wrong : desaturates Fresnel as metalness decreases

  vec3 lightDir;
  float lightDist;

  vec3 shadowPos = (uShadow_Matrix * vec4(pos.xyz, 1.0)).xyz / (uShadow_Matrix * vec4(pos.xyz, 1.0)).w;
  lightDir = -uLightDirection;
  lightDist = 0.0;

  //TODO might want to change settings later
  shadowPos.z -= max(0.005 * (1.0 - clamp(dot(normal.xyz, lightDir), 1.0, 0.0)), 0.005);
  shadowPos.z = min(shadowPos.z, 0.9999);
  vec2 texelSize = 1.0 / vec2(textureSize(shadowTex, 0));
  vec2 size = vec2(textureSize(shadowTex, 0));

  float shadow=0.0;
  for(int i = 0; i < 4; i++) {
    vec3 offset = vec3(poissonDisk[i] * texelSize, 0);
    vec2 uv = shadowPos.xy + offset.xy;

    //software bilinear + pcf shadow idea from http://codeflow.org/entries/2013/feb/15/soft-shadow-mapping/
    vec2 t = fract(uv*size - (0.5));
    uv = floor(uv*size - (0.5))/size;

    float a = textureShadow(shadowPos.z,  uv + vec2(0, 0) * texelSize);
    float b = textureShadow(shadowPos.z,  uv + vec2(1, 0) * texelSize);
    float c = textureShadow(shadowPos.z,  uv + vec2(0, 1) * texelSize);
    float d = textureShadow(shadowPos.z,  uv + vec2(1, 1) * texelSize);

    float e = mix(a, b, t.x);
    float f = mix(c, d, t.x);



    shadow += mix(e, f, t.y);
  }
  shadow /= 4.0;

  vec3 diffuseLight = uLightColor * clamp(dot(lightDir, normal.xyz), 0.0, 1.0);

  vec3 halfVec = normalize(view + lightDir);
  float dotNH = clamp(dot(normal.xyz, halfVec), 0.0, 1.0);

  float a2 = a*a;
  vec3 specColor = GGX_D(dotNH, a2*a2) * SpecularBRDF(uLightColor, normal.xyz, view, lightDir, a, F0, 1.0);

  vec3 diffuseColor = ((1.0-mat.r) * albedo.rgb) * diffuseLight;
  vec3 color = diffuseColor + specColor;
  frag_color = vec4(color * shadow, 1.0);
}
