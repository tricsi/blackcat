#version 300 es

in vec2 aUv;
in vec2 aPos;
in vec4 aTint;
uniform mat3 uProj;
out vec2 vUv;
out vec4 vTint;
out mat3 vProj;

void main() {
    vUv = aUv;
    vTint = aTint;
    vProj = inverse(uProj);
    gl_Position = vec4(uProj * vec3(aPos, 1), 1);
}
