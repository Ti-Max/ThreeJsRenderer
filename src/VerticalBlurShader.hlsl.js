export const vertexShader = `
out vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1);
}
`;

export const fragmentShader = `
uniform sampler2D tDiffuse;
in vec2 vUv;
const int radius = 6;
float weight[radius] = float[] (0.10485061116991602, 0.10327503419567892, 0.09869024169485364, 0.09149649780162632, 0.08229732447296427, 0.07181559624991886);
void main() {
  float texelSize = 1.0f / float(textureSize(tDiffuse, 0).y);
  vec3 result = texture(tDiffuse, vUv).rgb * weight[0]; // main texel

  for(int i = 1; i < radius; i++)
  {
      result += texture(tDiffuse, vUv + vec2(0, texelSize* float(i))).rgb * float(weight[i]);
      result += texture(tDiffuse, vUv - vec2(0, texelSize* float(i))).rgb * float(weight[i]);
  }
   gl_FragColor =  vec4(result, 1.0f);
}
`