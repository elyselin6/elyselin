import { useEffect, useRef } from 'react'
import './StarfieldBackground.css'

const VERTEX_SHADER = `
attribute vec2 a_position;
void main() {
  gl_Position = vec4(a_position, 0.0, 1.0);
}
`

const FRAGMENT_SHADER = `
precision mediump float;
uniform float uTime;
uniform vec2 uResolution;

#define TAU 6.28318530718

float hash11(float n) {
  return fract(sin(n) * 43758.5453123);
}

float hash21(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

vec3 hash31(vec2 p) {
  return vec3(
    hash21(p),
    hash21(p + 17.3),
    hash21(p + 43.7)
  );
}

float valueNoise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);

  float a = hash21(i);
  float b = hash21(i + vec2(1.0, 0.0));
  float c = hash21(i + vec2(0.0, 1.0));
  float d = hash21(i + vec2(1.0, 1.0));

  return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
}

float smoothNebula(vec2 p) {
  float n = 0.0;
  float amp = 0.55;
  float freq = 1.0;
  for (int i = 0; i < 3; i++) {
    n += valueNoise(p * freq) * amp;
    freq *= 2.0;
    amp *= 0.5;
  }
  return n;
}

float milkyWayBand(vec2 p) {
  vec2 band = mat2(0.82, -0.57, 0.57, 0.82) * p;
  float core = exp(-band.x * band.x * 1.8) * exp(-band.y * band.y * 0.06);
  float haze = exp(-band.x * band.x * 0.55) * exp(-band.y * band.y * 0.025);
  return core * 1.0 + haze * 0.35;
}

float stars(vec2 uv, float density, float sizeMin, float sizeMax, float t, float seed) {
  vec2 id = floor(uv);
  vec2 f = fract(uv) - 0.5;
  vec3 r = hash31(id + seed);

  if (r.x > density) return 0.0;

  vec2 center = (r.yz - 0.5) * 0.92;
  float dist = length(f - center);
  float size = mix(sizeMin, sizeMax, r.y);
  float core = exp(-(dist * dist) / (size * size));
  float twinkle = 0.72 + 0.28 * sin(t * (0.7 + r.z * 2.5) + r.x * TAU);
  float brightness = 0.25 + r.z * 0.75;
  return core * twinkle * brightness;
}

void main() {
  vec2 uv = gl_FragCoord.xy / uResolution;
  vec2 p = (uv - 0.5) * uResolution / min(uResolution.x, uResolution.y);
  float t = uTime * 0.35;
  p += vec2(t * 0.004, t * 0.002);

  float band = milkyWayBand(p);
  vec3 col = vec3(0.0);

  float nebula = smoothNebula(p * 0.55 + vec2(1.7, 0.4));
  col += vec3(0.09, 0.095, 0.11) * nebula * band * 0.55;

  float starField = 0.0;
  starField += stars(p * 95.0, 0.544, 0.008, 0.018, t, 1.0);
  starField += stars(p * 72.0 + 3.1, 0.496, 0.010, 0.022, t, 2.0);
  starField += stars(p * 52.0 + 7.4, 0.448, 0.012, 0.028, t, 3.0);
  starField += stars(p * 34.0 + 11.2, 0.304, 0.016, 0.038, t, 4.0);
  starField += stars(p * 20.0 + 15.8, 0.112, 0.022, 0.055, t, 5.0);

  starField *= 1.0 + band * 2.2;
  col += vec3(0.88, 0.91, 1.0) * starField;

  float vignette = 1.0 - dot(uv - 0.5, uv - 0.5) * 0.55;
  col *= vignette;

  gl_FragColor = vec4(col, 1.0);
}
`

export default function StarfieldBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rafRef = useRef<number>(0)

  useEffect(() => {
    const maybeCanvas = canvasRef.current
    if (!maybeCanvas) return

    const maybeGl = maybeCanvas.getContext('webgl', { alpha: false, antialias: false })
    if (!maybeGl) return

    const canvasEl: HTMLCanvasElement = maybeCanvas
    const glCtx: WebGLRenderingContext = maybeGl

    function createShader(type: number, source: string) {
      const shader = glCtx.createShader(type)
      if (!shader) return null
      glCtx.shaderSource(shader, source)
      glCtx.compileShader(shader)
      if (!glCtx.getShaderParameter(shader, glCtx.COMPILE_STATUS)) {
        console.error('Shader compile error:', glCtx.getShaderInfoLog(shader))
        glCtx.deleteShader(shader)
        return null
      }
      return shader
    }

    const vs = createShader(glCtx.VERTEX_SHADER, VERTEX_SHADER)
    const fs = createShader(glCtx.FRAGMENT_SHADER, FRAGMENT_SHADER)
    if (!vs || !fs) return

    const program = glCtx.createProgram()
    if (!program) return

    glCtx.attachShader(program, vs)
    glCtx.attachShader(program, fs)
    glCtx.linkProgram(program)

    if (!glCtx.getProgramParameter(program, glCtx.LINK_STATUS)) {
      console.error('Program link error:', glCtx.getProgramInfoLog(program))
      return
    }

    glCtx.useProgram(program)

    const positionBuffer = glCtx.createBuffer()
    if (!positionBuffer) return

    glCtx.bindBuffer(glCtx.ARRAY_BUFFER, positionBuffer)
    glCtx.bufferData(
      glCtx.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
      glCtx.STATIC_DRAW
    )

    const posLoc = glCtx.getAttribLocation(program, 'a_position')
    glCtx.enableVertexAttribArray(posLoc)
    glCtx.vertexAttribPointer(posLoc, 2, glCtx.FLOAT, false, 0, 0)

    const uTime = glCtx.getUniformLocation(program, 'uTime')
    const uResolution = glCtx.getUniformLocation(program, 'uResolution')

    function resize() {
      const dpr = Math.min(window.devicePixelRatio, 2)
      canvasEl.width = window.innerWidth * dpr
      canvasEl.height = window.innerHeight * dpr
      glCtx.viewport(0, 0, canvasEl.width, canvasEl.height)
    }

    resize()
    window.addEventListener('resize', resize)

    const startTime = performance.now()

    function render() {
      const elapsed = (performance.now() - startTime) / 1000
      if (uTime) glCtx.uniform1f(uTime, elapsed)
      if (uResolution) glCtx.uniform2f(uResolution, canvasEl.width, canvasEl.height)
      glCtx.drawArrays(glCtx.TRIANGLES, 0, 6)
      rafRef.current = requestAnimationFrame(render)
    }

    rafRef.current = requestAnimationFrame(render)

    return () => {
      cancelAnimationFrame(rafRef.current)
      window.removeEventListener('resize', resize)
      glCtx.deleteProgram(program)
      glCtx.deleteShader(vs)
      glCtx.deleteShader(fs)
      glCtx.deleteBuffer(positionBuffer)
    }
  }, [])

  return <canvas ref={canvasRef} className="starfield-background" aria-hidden="true" />
}
