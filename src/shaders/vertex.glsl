varying vec3 vPos; 
varying vec3 vNormal;
void main()
{
    vec4 modelPosition = modelMatrix * vec4(position, 1.0);
    vPos = modelPosition.xyz;
    gl_Position = projectionMatrix * viewMatrix * modelPosition;
    vec4 modelNormal = vec4(normal,0.0) * modelMatrix;
    vNormal = modelNormal.xyz;
}