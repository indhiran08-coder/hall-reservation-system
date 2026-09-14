import React, { useRef, useEffect, useCallback } from 'react';

/* ─────────────────────────────────────────────────────────────────────────────
   RippleDistortion – WebGL water-ripple mouse effect
   Props:
     src          – image URL
     brushSize    – radius of the distortion brush (px)
     strength     – max displacement amount (0–1)
     swirl        – rotational swirl factor
     rings        – number of ripple rings
     grayscale    – desaturate the image
     spread       – how far rings spread
     fade         – ring fade sharpness
     tint         – hex color tint e.g. "#2957a4"
     tintAmount   – 0–1 how strong the tint is
     trigger      – "hover" | "always"
     clickStrength– extra strength multiplier on click
     enabled      – master enable/disable
───────────────────────────────────────────────────────────────────────────── */
const RippleDistortion = ({
  src,
  brushSize      = 120,
  strength       = 0.18,
  swirl          = 0.8,
  rings          = 4,
  grayscale      = false,
  spread         = 4,
  fade           = 2.5,
  tint           = '#2957a4',
  tintAmount     = 0.08,
  trigger        = 'hover',
  clickStrength  = 2,
  enabled        = true,
  className      = '',
  style          = {},
}) => {
  const canvasRef    = useRef(null);
  const glRef        = useRef(null);
  const progRef      = useRef(null);
  const rafRef       = useRef(null);
  const mouseRef     = useRef({ x: -999, y: -999, active: false, click: 0 });
  const timeRef      = useRef(0);
  const startRef     = useRef(null);

  const parseTint = (hex) => {
    const c = hex.replace('#', '');
    return [
      parseInt(c.slice(0,2),16)/255,
      parseInt(c.slice(2,4),16)/255,
      parseInt(c.slice(4,6),16)/255,
    ];
  };

  const VERT = `
    attribute vec2 a_pos;
    varying   vec2 v_uv;
    void main(){
      v_uv = a_pos * 0.5 + 0.5;
      v_uv.y = 1.0 - v_uv.y;
      gl_Position = vec4(a_pos, 0.0, 1.0);
    }
  `;

  const FRAG = `
    precision mediump float;
    uniform sampler2D u_tex;
    uniform vec2      u_mouse;
    uniform float     u_strength;
    uniform float     u_swirl;
    uniform float     u_brushSize;
    uniform float     u_rings;
    uniform float     u_spread;
    uniform float     u_fade;
    uniform float     u_grayscale;
    uniform float     u_tintR;
    uniform float     u_tintG;
    uniform float     u_tintB;
    uniform float     u_tintAmt;
    uniform float     u_time;
    uniform float     u_active;
    uniform float     u_click;
    uniform vec2      u_resolution;
    varying vec2      v_uv;

    void main(){
      vec2 uv   = v_uv;
      vec2 diff = uv - u_mouse;
      diff.x   *= u_resolution.x / u_resolution.y;
      float dist = length(diff);

      vec2 displaced = uv;
      if(u_active > 0.5){
        float r        = dist / u_brushSize;
        float envelope = exp(-r * u_fade) * max(0.0, 1.0 - r / u_spread);
        float wave     = sin(r * u_rings * 3.14159 - u_time * 3.0) * envelope;
        float str      = u_strength * (1.0 + u_click * 0.8) * wave;
        vec2  dir      = normalize(diff + 0.0001);
        float angle    = atan(dir.y, dir.x) + u_swirl * wave;
        vec2  swirled  = vec2(cos(angle), sin(angle));
        displaced      = uv - swirled * str * u_brushSize;
      }

      vec4 col = texture2D(u_tex, displaced);

      if(u_grayscale > 0.5){
        float lum = dot(col.rgb, vec3(0.299, 0.587, 0.114));
        col.rgb   = vec3(lum);
      }

      vec3 tintCol = vec3(u_tintR, u_tintG, u_tintB);
      col.rgb      = mix(col.rgb, tintCol, u_tintAmt);

      gl_FragColor = col;
    }
  `;

  const initGL = useCallback((canvas, image) => {
    const gl = canvas.getContext('webgl', { alpha: false, antialias: false });
    if (!gl) return;
    glRef.current = gl;

    const compile = (type, src) => {
      const s = gl.createShader(type);
      gl.shaderSource(s, src);
      gl.compileShader(s);
      return s;
    };

    const prog = gl.createProgram();
    gl.attachShader(prog, compile(gl.VERTEX_SHADER, VERT));
    gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(prog);
    gl.useProgram(prog);
    progRef.current = prog;

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, 1,1]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, 'a_pos');
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

    const tex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
  }, []);

  const render = useCallback((ts) => {
    if (!startRef.current) startRef.current = ts;
    timeRef.current = (ts - startRef.current) / 1000;

    const gl     = glRef.current;
    const prog   = progRef.current;
    const canvas = canvasRef.current;
    if (!gl || !prog || !canvas) return;

    const { x, y, active, click } = mouseRef.current;
    const [tr, tg, tb] = parseTint(tint);

    gl.viewport(0, 0, canvas.width, canvas.height);
    const u = (n) => gl.getUniformLocation(prog, n);

    gl.uniform2f(u('u_mouse'),      x, y);
    gl.uniform1f(u('u_strength'),   strength);
    gl.uniform1f(u('u_swirl'),      swirl);
    gl.uniform1f(u('u_brushSize'),  brushSize / canvas.width);
    gl.uniform1f(u('u_rings'),      rings);
    gl.uniform1f(u('u_spread'),     spread);
    gl.uniform1f(u('u_fade'),       fade);
    gl.uniform1f(u('u_grayscale'),  grayscale ? 1 : 0);
    gl.uniform1f(u('u_tintR'),      tr);
    gl.uniform1f(u('u_tintG'),      tg);
    gl.uniform1f(u('u_tintB'),      tb);
    gl.uniform1f(u('u_tintAmt'),    tintAmount);
    gl.uniform1f(u('u_time'),       timeRef.current);
    gl.uniform1f(u('u_active'),     (enabled && active) ? 1 : 0);
    gl.uniform1f(u('u_click'),      click);
    gl.uniform2f(u('u_resolution'), canvas.width, canvas.height);
    gl.uniform1i(u('u_tex'),        0);

    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

    if (mouseRef.current.click > 0) {
      mouseRef.current.click = Math.max(0, mouseRef.current.click - 0.05);
    }

    rafRef.current = requestAnimationFrame(render);
  }, [brushSize, strength, swirl, rings, spread, fade, grayscale, tint, tintAmount, enabled]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !enabled) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = src;
    img.onload = () => {
      const rect = canvas.parentElement.getBoundingClientRect();
      canvas.width  = rect.width  || 600;
      canvas.height = rect.height || 500;
      initGL(canvas, img);
      rafRef.current = requestAnimationFrame(render);
    };

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [src, enabled, initGL, render]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      canvas.width  = width;
      canvas.height = height;
    });
    ro.observe(canvas.parentElement);
    return () => ro.disconnect();
  }, []);

  const onMove = useCallback((e) => {
    const canvas = canvasRef.current;
    const rect   = canvas.getBoundingClientRect();
    mouseRef.current.x      = (e.clientX - rect.left)  / rect.width;
    mouseRef.current.y      = 1 - (e.clientY - rect.top) / rect.height;
    mouseRef.current.active = true;
  }, []);

  const onLeave = useCallback(() => {
    if (trigger === 'hover') mouseRef.current.active = false;
  }, [trigger]);

  const onClick = useCallback(() => {
    mouseRef.current.click = clickStrength;
  }, [clickStrength]);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{ display: 'block', width: '100%', height: '100%', ...style }}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      onClick={onClick}
    />
  );
};

export default RippleDistortion;
