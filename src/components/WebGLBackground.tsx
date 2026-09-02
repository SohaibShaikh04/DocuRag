// src/components/WebGLBackground.tsx — Procedural liquid-metal shader with mouse-reactive amber glow

import { useEffect, useRef } from "react";

const VS = `
  attribute vec2 a_position;
  void main() {
    gl_Position = vec4(a_position, 0.0, 1.0);
  }
`;

const FS = `
  precision highp float;
  uniform float u_time;
  uniform vec2 u_resolution;
  uniform vec2 u_mouse;

  float hash21(vec2 p) {
    p = fract(p * vec2(127.34, 311.71));
    p += dot(p, p + 45.32);
    return fract(p.x * p.y);
  }

  float smoothNoise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(hash21(i),             hash21(i + vec2(1.0, 0.0)), f.x),
      mix(hash21(i + vec2(0.0, 1.0)), hash21(i + vec2(1.0, 1.0)), f.x),
      f.y
    );
  }

  float fbm(vec2 p) {
    float v = 0.0, a = 0.5;
    mat2 rot = mat2(cos(0.5), sin(0.5), -sin(0.5), cos(0.5));
    for (int i = 0; i < 6; i++) {
      v += a * smoothNoise(p);
      p = rot * p * 2.1 + vec2(3.7 + float(i) * 0.4, 1.3);
      a *= 0.48;
    }
    return v;
  }

  void main() {
    vec2 uv = gl_FragCoord.xy / u_resolution;
    float aspect = u_resolution.x / u_resolution.y;
    uv.x *= aspect;

    float t = u_time * 0.07;

    vec2 q = vec2(fbm(uv + t * 0.9), fbm(uv + vec2(6.2, 1.3) + t * 0.6));
    vec2 r = vec2(
      fbm(uv + q + vec2(1.7, 9.2) + t * 0.13),
      fbm(uv + q + vec2(8.3, 2.8) + t * 0.11)
    );
    float f = fbm(uv + 2.0 * r);

    vec3 col = mix(
      vec3(0.05, 0.05, 0.05),
      vec3(0.10, 0.085, 0.055),
      clamp(f * 2.5, 0.0, 1.0)
    );
    col = mix(col, vec3(0.16, 0.12, 0.06), clamp(f * f * 3.5, 0.0, 1.0));

    float streak = smoothstep(0.42, 0.58, f + 0.06 * sin(uv.x * 8.0 + t));
    col += vec3(0.07, 0.05, 0.02) * streak;

    vec2 mouseUV = u_mouse / u_resolution;
    mouseUV.x *= aspect;
    float d = length(uv - mouseUV);
    float glow = exp(-d * d * 3.8) * 0.55;
    col += vec3(0.96, 0.62, 0.04) * glow;

    float vignette = 1.0 - smoothstep(0.4, 1.4, length(uv - vec2(aspect * 0.5, 0.5)));
    col *= (0.7 + 0.3 * vignette);

    float cornerGlow = exp(-length(uv - vec2(0.0, 0.0)) * 2.5) * 0.18;
    col += vec3(0.5, 0.25, 0.01) * cornerGlow;

    gl_FragColor = vec4(clamp(col, 0.0, 1.0), 1.0);
  }
`;

export function WebGLBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: 0, y: 0 });
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext("webgl", { antialias: false, alpha: false });
    if (!gl) return;

    const compileShader = (type: number, src: string) => {
      const s = gl.createShader(type)!;
      gl.shaderSource(s, src);
      gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
        console.error("Shader error:", gl.getShaderInfoLog(s));
      }
      return s;
    };

    const prog = gl.createProgram()!;
    gl.attachShader(prog, compileShader(gl.VERTEX_SHADER, VS));
    gl.attachShader(prog, compileShader(gl.FRAGMENT_SHADER, FS));
    gl.linkProgram(prog);
    gl.useProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
      gl.STATIC_DRAW
    );

    const aPos = gl.getAttribLocation(prog, "a_position");
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    const uTime = gl.getUniformLocation(prog, "u_time");
    const uRes = gl.getUniformLocation(prog, "u_resolution");
    const uMouse = gl.getUniformLocation(prog, "u_mouse");

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      gl.viewport(0, 0, canvas.width, canvas.height);
    };
    resize();
    window.addEventListener("resize", resize);

    const onMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: window.innerHeight - e.clientY };
    };
    window.addEventListener("mousemove", onMouseMove);

    const start = performance.now();
    const render = () => {
      const t = (performance.now() - start) / 1000;
      gl.uniform1f(uTime, t);
      gl.uniform2f(uRes, canvas.width, canvas.height);
      gl.uniform2f(uMouse, mouseRef.current.x, mouseRef.current.y);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      rafRef.current = requestAnimationFrame(render);
    };
    render();

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMouseMove);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        inset: 0,
        width: "100%",
        height: "100%",
        zIndex: 0,
        pointerEvents: "none",
        display: "block",
      }}
    />
  );
}
