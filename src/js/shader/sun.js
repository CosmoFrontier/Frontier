import { AdditiveBlending, BackSide, Color, Vector3 } from "three";

export class GlowShader {
  constructor(intensity, fade, color, cameraPos) {}

  uniforms = {
    c: {
      type: "f",
      value: this.intensity,
    },
    p: {
      type: "f",
      value: this.fade,
    },
    glowColor: {
      type: "c",
      value: new Color(this.color),
    },
    viewVector: {
      type: "v3",
      value: this.cameraPos,
    },
  };
  vertexShader = `
        uniform vec3 viewVector;
        uniform float c;
        uniform float p;
        varying float intensity;
        void main() {
          vec3 vNormal = normalize( normalMatrix * normal );
          vec3 vNormel = normalize( normalMatrix * viewVector );
          intensity = pow( c - dot(vNormal, vNormel), p );
          gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
        }`;
  fragmentShader = `
        uniform vec3 glowColor;
        varying float intensity;
        void main() 
        {
          vec3 glow = glowColor * intensity;
          gl_FragColor = vec4( glow, 1.0 );
        }`;
  side = BackSide;
  blending = AdditiveBlending;
  transparent = true;
}
