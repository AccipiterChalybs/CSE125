#version 300 es
precision mediump float;
in vec4 vPosition;
in vec2 vTexCoord;

layout(location = 0) out vec4 frag_color;

//TODO add texture back in :)
//uniform sampler2D colorTex; //color texture - rgb: color | a: transparency

void main() {
    //vec4 albedo = texture(colorTex, vTexCoord);

    frag_color = vec4(1,1,1,0);
}
