#version 430
precision mediump float;
in vec4 vPosition;

out vec4 frag_color;

const float PI = 3.14159265359;

uniform sampler2D colorTex; //color texture - rgb: color | a: metalness
uniform sampler2D normalTex; //normal texture - rgb: normal | a: IOR
uniform sampler2D posTex; //position texture - rgb: position | a: roughness
uniform sampler2DShadow shadowTex;

uniform samplerCube environment; //the environment cubemap to sample reflections from
uniform float environment_mipmap; //the number of mipmaps the environment map has (used to select mipmap based on roughness)
const int sample_count = 1; //number of times to sample the cubemap for specular lighting
uniform mat4 irradiance[3]; //matrices from the calculated SH corresponding to the env. diffuse lighting for r, g, and b.

//world space camera position, to get view vector
uniform vec3 cameraPos;
uniform vec3 uLightColor;
uniform vec3 uLightPosition;
uniform vec3 uLightDirection;
uniform vec3 uLightFalloff;
uniform float uLightSize = 1.0f;
uniform vec2 uScreenSize;
uniform int uLightType;
uniform mat4 uShadow_Matrix;
uniform mat4 uIV_Matrix;

//main algorithm from http://holger.dammertz.org/stuff/notes_HammersleyOnHemisphere.html
vec2 Hammersley(int i, int N) {
	 uint bits = bitfieldReverse(i);
     return vec2(float(i)/float(N),float(bits) * 2.3283064365386963e-10);
 }

//sampling angle calculations from http://blog.tobias-franke.eu/2014/03/30/notes_on_importance_sampling.html
//vector calculations from http://blog.selfshadow.com/publications/s2013-shading-course/karis/s2013_pbs_epic_notes_v2.pdf
vec3 GGX_Sample(vec2 xi,  vec3 normal, float a) {
	float phi = 2.0 * PI * xi.x;
	float cosTheta = sqrt((1.0 - xi.y) / ((a*a - 1.0) * xi.y + 1.0));
	float sinTheta = sqrt(1.0 - cosTheta * cosTheta);

	
	vec3 H;
	H.x = sinTheta * cos( phi );
	H.y = sinTheta * sin( phi );
	H.z = cosTheta;

	
	vec3 UpVector = abs(normal.z) < 0.999 ? vec3(0,0,1) : vec3(1,0,0);
	vec3 TangentX = normalize( cross( UpVector, normal ) );
	vec3 TangentY = cross( normal, TangentX );
	
	// Tangent to world space
	return TangentX * H.x + TangentY * H.y + normal * H.z;
}

float GGX_Visibility(float dotProduct, float k) {
	//return 2.0 / (dotProduct + sqrt(k*k + (1 - k*k)*dotProduct*dotProduct)); //More accurate, but slower version

	k=k/2;
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

		vec3 F = F0 + (vec3(1,1,1)-F0) * pow(1-dotLH, 5);

		float k = clamp(a+.36, 0.0, 1.0);
		float G = GGX_Visibility(dotNV, k) * GGX_Visibility(dotNL, k) * d + (1-d);

		return F * lightColor * (G * dotNL);
}

//generates sample directions, sets up the values, calls the BRDF, then accumulates resulting colors
vec3 SpecularEnvMap(vec3 normal, vec3 view, float a, vec3 F0) {
	vec3 color = vec3(0,0,0);
	vec3 lightDir_Main =  reflect(-view, normal);
	for (int s=0; s<sample_count; ++s) {
		vec2 xi = Hammersley(s, sample_count);
		vec3 lightDir = GGX_Sample(xi, lightDir_Main, a);
		vec3 lightColor = textureLod(environment, lightDir, a*environment_mipmap).xyz;
		color += SpecularBRDF(lightColor, normal, view, lightDir, a, F0, 0);
	}
	color /= sample_count;
	return color;
}

const vec2 poissonDisk[4] = vec2[](
   vec2( -0.94201624, -0.39906216 ),
   vec2( 0.94558609, -0.76890725 ),
   vec2( -0.094184101, -0.92938870 ),
   vec2( 0.34495938, 0.29387760 )
 );

void main () {
  vec4 albedo = texture(colorTex, gl_FragCoord.xy / uScreenSize);
  if(albedo.xyz == vec3(0)) discard;
  vec4 pos = texture(posTex, gl_FragCoord.xy / uScreenSize);
  vec4 normal = texture(normalTex, gl_FragCoord.xy / uScreenSize);
  vec3 mat = vec3(albedo.a, pos.w, normal.w);
  pos = uIV_Matrix * vec4(pos.xyz, 1);
  pos /= pos.w;
  normal.xyz = normal.xyz * 2 - 1;

  vec3 view = normalize(cameraPos - pos.xyz);


  mat.y += 0.0001; //there seem to be issues with roughness = 0 due to visibility
  float a = sqrt(mat.y);// squaring it makes everything shiny, sqrting it looks like linear roughness

  float IOR = 1 + mat.z;
  //F0 is essentially specular color, as well as Fresnel term
  vec3 F0 = vec3(1,1,1) * pow((1.0 - IOR) / (1.0 + IOR), 2);
  F0 = mix(F0, albedo.rgb, mat.r); //interpolate Fresnel with the color as metalness increases (with metalness=1, color => reflection color)
  F0 = mix(vec3(1,1,1) * dot(vec3(.33,.33,.33),F0), F0, mat.r); //my own improvement - could be wrong : desaturates Fresnel as metalness decreases

  if(uLightType == 3) {
	  vec4 normal4 = vec4(normal.xyz, 1.0);

	  vec3 diffuseLight = vec3(dot(normal4, (irradiance[0] * normal4)),
							   dot(normal4, (irradiance[1] * normal4)),
							   dot(normal4, (irradiance[2] * normal4)) );
							   
	  vec3 diffuseColor = ((1.0-mat.r) * albedo.rgb) * diffuseLight;
	  vec3 specColor = SpecularEnvMap(normal.xyz, view, a, F0);
	  vec3 color = diffuseColor + specColor;
  
	  frag_color = vec4(color, 1.0);
  }
  else {
	  vec3 lightDir;
	  float lightDist;
	  float shadow = 1;
	  if(uLightType == 0) {
		  lightDir = uLightPosition - pos.xyz;
		  lightDist = length(lightDir);

		  //Spherical light algorithm from http://blog.selfshadow.com/publications/s2013-shading-course/karis/s2013_pbs_epic_notes_v2.pdf
		  float sphereRadius = uLightSize;
		  vec3 reflectedRay = reflect(-view, normal.xyz);
		  vec3 centerToRay = dot(lightDir, reflectedRay) * reflectedRay - lightDir;
		  lightDir = normalize(lightDir + centerToRay * clamp(sphereRadius / length(centerToRay), 0.0, 1.0));
		  //todo normalize based on sphere size
	  }
	  else {
		  vec3 shadowPos = (uShadow_Matrix * vec4(pos.xyz, 1.0)).xyz / (uShadow_Matrix * vec4(pos.xyz, 1.0)).w;
		  lightDir = uLightDirection;
		  lightDist = 0;
  
		  shadowPos.z -= max(0.05 * (1.0 - dot(normal.xyz, lightDir)), 0.005);
		  shadowPos.z = min(shadowPos.z, 0.9999);
		  vec2 texelSize = 1.0 / textureSize(shadowTex, 0);
		  for(int i = 0; i < 4; i++) {
			vec3 offset = vec3(poissonDisk[i] * texelSize, 0);
			shadow += texture(shadowTex, shadowPos + offset, 0);
		  }
		  shadow /= 4;
	  }


	  float power = 1.0 / (lightDist * lightDist * uLightFalloff.z + lightDist * uLightFalloff.y + uLightFalloff.x);
	  vec3 diffuseLight = uLightColor * clamp(dot(lightDir, normal.xyz), 0.0, 1.0) * power;
	
	  vec3 halfVec = normalize(view + lightDir);
	  float dotNH = clamp(dot(normal.xyz, halfVec), 0.0, 1.0);
	  
	  float a2 = a*a;
	  vec3 specColor = GGX_D(dotNH, a2*a2) * SpecularBRDF(uLightColor, normal.xyz, view, lightDir, a, F0, 1) * power;

	  vec3 diffuseColor = ((1.0-mat.r) * albedo.rgb) * diffuseLight;
	  vec3 color = diffuseColor + specColor;

	  frag_color = vec4(color * shadow, 1.0);
  }
}
