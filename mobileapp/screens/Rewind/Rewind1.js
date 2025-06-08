//File: Rewind1.js

import React, { useEffect, useRef } from "react";
import { View, StyleSheet, Animated } from "react-native";
import { GLView } from "expo-gl";
import RewindScreen1 from "./RewindScreen1";
import { COLORS } from "../../styles/colors"; 

export default function Rewind1({ onNext }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const raf = useRef(null);

  useEffect(() => {
    // Fade in the overlay UI over 400ms
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();

    // Clean up on unmount
    return () => {
      if (raf.current) {
        cancelAnimationFrame(raf.current);
      }
    };
  }, []);

  function onContextCreate(gl) {
    // Compile vertex shader
    const vertexShaderSource = `
      attribute vec2 a_position;
      varying vec2 v_uv;
      void main() {
        v_uv = a_position * 0.5 + 0.5;
        gl_Position = vec4(a_position, 0, 1);
      }
    `;
    const vs = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vs, vertexShaderSource);
    gl.compileShader(vs);
    if (!gl.getShaderParameter(vs, gl.COMPILE_STATUS)) {
      console.warn("Vertex shader compile error:", gl.getShaderInfoLog(vs));
    }

    // Compile fragment shader (example ripple effect)
    const fragmentShaderSource = `
      precision highp float;
      varying vec2 v_uv;
      uniform float u_Time;
      void main() {
        float t = u_Time;
        float r = distance(v_uv, vec2(0.5, 0.5));
        float ripple = sin((r - t * 0.25) * 20.0) * 0.5 + 0.5;
        vec3 color = mix(vec3(0.1, 0.2, 0.4), vec3(1.0, 0.867, 0.502), ripple);
        gl_FragColor = vec4(color, 1.0);
      }
    `;
    const fs = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fs, fragmentShaderSource);
    gl.compileShader(fs);
    if (!gl.getShaderParameter(fs, gl.COMPILE_STATUS)) {
      console.warn("Fragment shader compile error:", gl.getShaderInfoLog(fs));
    }

    // Link program
    const program = gl.createProgram();
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.warn("Program link error:", gl.getProgramInfoLog(program));
    }
    gl.useProgram(program);

    // Look up uniform location
    const uTimeLocation = gl.getUniformLocation(program, "u_Time");

    // Set up full-screen quad
    const quadVerts = new Float32Array([
      -1, -1,  1, -1,  -1, 1,
      -1,  1,  1, -1,   1, 1,
    ]);
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, quadVerts, gl.STATIC_DRAW);

    const posLoc = gl.getAttribLocation(program, "a_position");
    gl.enableVertexAttribArray(posLoc);
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

    function render() {
      const t = performance.now() * 0.001;
      gl.uniform1f(uTimeLocation, t);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
      gl.endFrameEXP();

      raf.current = requestAnimationFrame(render);
    }

    // Kick off the loop
    gl.clearColor(0.1, 0.2, 0.4, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.endFrameEXP();
    raf.current = requestAnimationFrame(render);
  }

  return (
    <View style={styles.container}>
      <GLView style={styles.glBackground} onContextCreate={onContextCreate} />
      <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
        <RewindScreen1 onNext={onNext} />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  glBackground: {
    ...StyleSheet.absoluteFillObject,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(246,234,153,0.15)", // subtle cream
  },
});