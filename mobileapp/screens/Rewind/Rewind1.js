import React, { useEffect, useRef } from "react";
import { View, StyleSheet } from "react-native";
import { GLView } from "expo-gl";
import RewindScreen1 from "./RewindScreen1";

const vertexShaderSrc = `
precision mediump float;
attribute vec2 a_Position;
void main() {
  gl_Position = vec4(a_Position, 0.0, 1.0);
}`;

const fragmentShaderSrc = `
precision mediump float;
uniform vec2 u_Resolution;
uniform float u_Time;

// simple moving circles
float circle(vec2 uv, vec2 center, float radius) {
  return smoothstep(radius, radius - 0.02, length(uv - center));
}

void main() {
  vec2 uv = gl_FragCoord.xy / u_Resolution;
  uv = uv * 2.0 - 1.0;
  uv.x *= u_Resolution.x / u_Resolution.y;

  // animate a few circles
  float t = u_Time * 0.5;
  float c1 = circle(uv, vec2(sin(t), cos(t)) * 0.5, 0.3);
  float c2 = circle(uv, vec2(cos(t * 1.3), sin(t * 1.7)) * 0.6, 0.25);
  float c3 = circle(uv, vec2(sin(t * 1.9), sin(t * 1.2)) * 0.4, 0.2);

  vec3 col = vec3(0.0);
  col += mix(vec3(1.0, 0.3, 0.6), vec3(0.2, 0.8, 1.0), c1);
  col += mix(vec3(0.1, 1.0, 0.4), vec3(1.0, 0.8, 0.2), c2) * 0.8;
  col += mix(vec3(0.8, 0.4, 1.0), vec3(0.3, 1.0, 0.9), c3) * 0.6;

  gl_FragColor = vec4(col, 1.0);
}`;

export default function Rewind1() {
  const raf = useRef();
  const start = useRef();

  function onContextCreate(gl) {
    const { drawingBufferWidth: width, drawingBufferHeight: height } = gl;
    gl.viewport(0, 0, width, height);
    gl.clearColor(0, 0, 0, 1);

    // compile shaders
    const vs = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vs, vertexShaderSrc);
    gl.compileShader(vs);
    const fs = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fs, fragmentShaderSrc);
    gl.compileShader(fs);

    const program = gl.createProgram();
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    gl.useProgram(program);

    // set up buffer
    const quad = new Float32Array([1, -1, -1, -1, -1, 1, 1, -1, 1, 1, -1, 1]);
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, quad, gl.STATIC_DRAW);
    const posLoc = gl.getAttribLocation(program, "a_Position");
    gl.enableVertexAttribArray(posLoc);
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

    // uniforms
    const uRes = gl.getUniformLocation(program, "u_Resolution");
    const uTime = gl.getUniformLocation(program, "u_Time");
    gl.uniform2f(uRes, width, height);

    start.current = performance.now();
    function render() {
      const now = performance.now();
      gl.uniform1f(uTime, (now - start.current) * 0.001);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
      gl.endFrameEXP();
      raf.current = requestAnimationFrame(render);
    }
    render();
  }

  useEffect(() => {
    return () => raf.current && cancelAnimationFrame(raf.current);
  }, []);

  return (
    <View style={styles.container}>
      <GLView style={styles.background} onContextCreate={onContextCreate} />
      <View style={styles.content} pointerEvents="box-none">
        <RewindScreen1 />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "black", // only here
  },
  background: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "black", // fallback if GLView fails
  },
  content: {
    flex: 1,
    backgroundColor: "transparent", // let shader show through
  },
});
