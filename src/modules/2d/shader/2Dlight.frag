#version 300 es
precision mediump float;

in vec2 vUv;
in vec4 vTint;
in mat3 vProj;
uniform vec2 uRes;
uniform vec4 uLight[8];
uniform vec4 uColor[8];
uniform sampler2D uImage;
out vec4 fColor;

void main() {
    vec4 a = vec4(0, 0, 0, 1);
    vec3 w = vProj * vec3((gl_FragCoord.xy / uRes) * 2.0 - 1.0, 1);
    for(int i=0; i<8; i++) {
        vec4 l = uLight[i];
        float d = length(w.xy - l.xy);
        float s = 1.0;
        if (d > l.z) {
            s -= (d - l.z) / l.w;
        }
        vec4 c = uColor[i] * max(s, 0.0);
        a.r = max(a.r, c.r * c.a);
        a.g = max(a.g, c.g * c.a);
        a.b = max(a.b, c.b * c.a);
    }
	fColor = texture(uImage, vUv) * vTint * a;
    fColor.rgb *= fColor.a;
}
