varying vec3 vPos;
varying vec3 vNormal;
uniform float uTime;
void main(){
    vec3 normal = normalize(vNormal);
    if(!gl_FrontFacing){
        normal *= -1.0;
    }
    float stripes = pow(mod((vPos.y-uTime * .02 )*20.0,1.0),3.0);
    vec3 viewDirection = normalize(vPos-cameraPosition);
    float fresnel = 1.0+dot(viewDirection,normal);
    fresnel = pow(fresnel,2.0);
    float falloff = smoothstep(.8,.0,fresnel);
    float holo = stripes * fresnel;
    holo += fresnel * 1.25;
    holo += falloff;
    gl_FragColor = vec4(1.,1.,1.,holo);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
}