import { useEffect, useRef } from 'react'

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
#define PI 3.141592653589793

vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }

vec3 permute(vec3 x) { return mod289(((x * 34.0) + 1.0) * x); }

vec3 rand3(vec3 p) {
  vec3 a = vec3(PI * 2.0);
  vec3 b = vec3(PI);
  vec3 p3 = fract((p + dot(p, a)) * b);
  p3 += dot(p3, p3.yzx + 19.19);
  return fract((p3.xx + p3.yz) * p3.zy);
}

vec3 fade(vec3 t) { return t * t * t * (t * (t * 6.0 - 15.0) + 10.0); }

vec3 grad3(vec3 p) {
  vec4 q = vec4(
    dot(p, vec3(127.1, 311.7, 74.7)),
    dot(p, vec3(269.5, 183.3, 246.1)),
    dot(p, vec3(113.5, 271.9, 124.6)),
    0.0
  );
  q.w = dot(p, vec3(74.7, 113.5, 271.9));
  q = fract(sin(q) * 43758.5453);
  q = q - 0.5;
  return (q.xyz * q.w + q.yzw * q.x) * 0.5;
}

float noise3(vec3 p) {
  vec3 i = floor(p);
  vec3 f = fract(p);
  vec3 u = fade(f);

  vec3 g000 = grad3(i + vec3(0.0, 0.0, 0.0));
  vec3 g100 = grad3(i + vec3(1.0, 0.0, 0.0));
  vec3 g010 = grad3(i + vec3(0.0, 1.0, 0.0));
  vec3 g110 = grad3(i + vec3(1.0, 1.0, 0.0));
  vec3 g001 = grad3(i + vec3(0.0, 0.0, 1.0));
  vec3 g101 = grad3(i + vec3(1.0, 0.0, 1.0));
  vec3 g011 = grad3(i + vec3(0.0, 1.0, 1.0));
  vec3 g111 = grad3(i + vec3(1.0, 1.0, 1.0));

  float n000 = dot(g000, f);
  float n100 = dot(g100, f - vec3(1.0, 0.0, 0.0));
  float n010 = dot(g010, f - vec3(0.0, 1.0, 0.0));
  float n110 = dot(g110, f - vec3(1.0, 1.0, 0.0));
  float n001 = dot(g001, f - vec3(0.0, 0.0, 1.0));
  float n101 = dot(g101, f - vec3(1.0, 0.0, 1.0));
  float n011 = dot(g011, f - vec3(0.0, 1.0, 1.0));
  float n111 = dot(g111, f - vec3(1.0, 1.0, 1.0));

  float nx00 = mix(n000, n100, u.x);
  float nx01 = mix(n001, n101, u.x);
  float nx10 = mix(n010, n110, u.x);
  float nx11 = mix(n011, n111, u.x);

  float nxy0 = mix(nx00, nx10, u.y);
  float nxy1 = mix(nx01, nx11, u.y);

  return 0.5 + 0.5 * mix(nxy0, nxy1, u.z);
}

float dotStars(vec2 uv, float t) {
  vec2 id = floor(uv);
  vec2 f = fract(uv);
  vec3 r = rand3(vec3(id, 0.0));
  vec2 center = vec2(cos(r.x * TAU), sin(r.y * TAU)) * 0.4 + 0.5;
  float dist = length(f - center);
  float twinkle = sin(r.z * TAU + t * r.x) * 0.5 + 0.5;
  return (1.0 - smoothstep(0.0, 0.03, dist)) * twinkle * 0.35;
}

float star4(vec2 p, float size) {
  float angle = atan(p.y, p.x);
  float radius = length(p);
  float points = abs(cos(angle * 2.0));
  points = pow(points, 0.22);
  float edge = size * (0.18 + points * 0.82);
  float body = 1.0 - smoothstep(edge * 0.55, edge, radius);
  float core = 1.0 - smoothstep(0.0, size * 0.18, radius);
  return body + core * 0.6;
}

float twinkleStars(vec2 uv, float t) {
  vec2 id = floor(uv);
  vec2 f = fract(uv) - 0.5;
  vec3 r = rand3(vec3(id, 1.0));

  if (r.x < 0.82) return 0.0;

  float size = 0.06 + r.y * 0.08;
  float star = star4(f, size);

  float twinkle = sin(r.z * TAU * 2.0 + t * (1.5 + r.y * 2.0)) * 0.5 + 0.5;
  twinkle = pow(twinkle, 2.0);
  float shimmer = sin(r.x * TAU * 3.0 + t * 4.0) * 0.3 + 0.7;

  return star * twinkle * shimmer;
}

void main() {
  vec2 uv = gl_FragCoord.xy / uResolution;
  vec2 p = (uv - 0.5) * uResolution / min(uResolution.x, uResolution.y);
  float t = uTime * 0.5;
  p = mat2(cos(t * 0.1), -sin(t * 0.1), sin(t * 0.1), cos(t * 0.1)) * p;

  vec3 col = vec3(0.0);
  for (int i = 0; i < 3; i++) {
    float fi = float(i);
    float scale = fi * 2.0 + 1.0;
    vec2 uvLayer = p * scale + t * 0.05 * (fi + 1.0);
    float dim = 1.0 - fi * 0.25;
    col += dotStars(uvLayer, t + fi * 10.0) * dim * vec3(0.7, 0.72, 0.78);
  }

  for (int i = 0; i < 2; i++) {
    float fi = float(i);
    float scale = fi * 1.5 + 2.5;
    vec2 uvLayer = p * scale + t * 0.03 * (fi + 1.0);
    float twinkleField = twinkleStars(uvLayer, t + fi * 7.0);
    float brightness = 1.0 - fi * 0.3;
    col += twinkleField * brightness * vec3(0.85, 0.88, 0.95);
  }

  col = col / (1.0 + col * 0.8);
  gl_FragColor = vec4(col, 1.0);
}
`

export default function StarfieldBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rafRef = useRef<number>(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const gl = canvas.getContext('webgl', { alpha: false, antialias: false })
    if (!gl) return

    // Compile shaders
    function createShader(gl: WebGLRenderingContext, type: number, source: string) {
      const shader = gl.createShader(type)!
      gl.shaderSource(shader, source)
      gl.compileShader(shader)
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error('Shader compile error:', gl.getShaderInfoLog(shader))
        gl.deleteShader(shader)
        return null
      }
      return shader
    }

    const vs = createShader(gl, gl.VERTEX_SHADER, VERTEX_SHADER)
    const fs = createShader(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER)
    if (!vs || !fs) return

    const program = gl.createProgram()!
    gl.attachShader(program, vs)
    gl.attachShader(program, fs)
    gl.linkProgram(program)

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error('Program link error:', gl.getProgramInfoLog(program))
      return
    }

    gl.useProgram(program)

    // Full-screen quad
    const positionBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
      -1, -1, 1, -1, -1, 1,
      -1, 1, 1, -1, 1, 1
    ]), gl.STATIC_DRAW)

    const posLoc = gl.getAttribLocation(program, 'a_position')
    gl.enableVertexAttribArray(posLoc)
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0)

    const uTime = gl.getUniformLocation(program, 'uTime')
    const uResolution = gl.getUniformLocation(program, 'uResolution')

    function resize() {
      if (!canvas) return
      const dpr = Math.min(window.devicePixelRatio, 1.5)
      canvas.width = window.innerWidth * dpr
      canvas.height = window.innerHeight * dpr
      gl!.viewport(0, 0, canvas.width, canvas.height)
    }

    resize()
    window.addEventListener('resize', resize)

    const startTime = performance.now()

    function render() {
      if (!gl || !canvas) return
      const elapsed = (performance.now() - startTime) / 1000
      gl.uniform1f(uTime, elapsed)
      gl.uniform2f(uResolution, canvas.width, canvas.height)
      gl.drawArrays(gl.TRIANGLES, 0, 6)
      rafRef.current = requestAnimationFrame(render)
    }

    rafRef.current = requestAnimationFrame(render)

    return () => {
      cancelAnimationFrame(rafRef.current)
      window.removeEventListener('resize', resize)
      gl.deleteProgram(program)
      gl.deleteShader(vs)
      gl.deleteShader(fs)
      gl.deleteBuffer(positionBuffer)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
      }}
    />
  )
}
