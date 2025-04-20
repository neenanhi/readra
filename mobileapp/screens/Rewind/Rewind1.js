import { useEffect, useRef } from "react";
import { View, StyleSheet } from "react-native";
import { GLView } from "expo-gl";
import RewindScreen1 from "./RewindScreen1";
import { COLORS } from "../../styles/colors"; 

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

// Circle function
float circle(vec2 uv, vec2 center, float radius) {
  // Using a slightly larger feathering for a softer edge, which might help the "darker blue" illusion
  return smoothstep(radius, radius - 0.025, length(uv - center));
}

void main() {
  vec2 uv = gl_FragCoord.xy / u_Resolution;
  uv = uv * 2.0 - 1.0;
  uv.x *= u_Resolution.x / u_Resolution.y;

  // Define colors
  vec3 backgroundColor = vec3(240.0/255.0, 240.0/255.0, 240.0/255.0); // #f0f0f0
  vec3 primaryCircleColor = vec3(125.0/255.0, 129.0/255.0, 159.0/255.0); // #7d819f

  // Start with the background color
  vec3 col = backgroundColor;

  // Animate a few circles
  float t = u_Time * 0.4; // Adjusted time for potentially different feel

  // Primary Color Circles
  float c1_shape = circle(uv, vec2(sin(t * 1.1), cos(t * 0.9)) * 0.55, 0.28);
  float c2_shape = circle(uv, vec2(cos(t * 1.4 + 1.0), sin(t * 1.2 - 0.5)) * 0.6, 0.22);
  float c3_shape = circle(uv, vec2(sin(t * 0.8 - 0.8), cos(t * 1.5 + 0.2)) * 0.5, 0.18);

  // Mix primary circle colors
  // The order of mixing matters for layering.
  // If c1 is drawn, then c2, c2 will appear on top of c1 where they overlap.
  col = mix(col, primaryCircleColor, c1_shape);
  col = mix(col, primaryCircleColor, c2_shape * 0.95); // Slight transparency for depth
  col = mix(col, primaryCircleColor, c3_shape * 0.9);  // More transparency

  // Occluding Circle (Background Color)
  // This circle will "erase" parts of other circles or make them appear darker/transparent
  float oc1_radius = 0.25 + 0.03 * sin(u_Time * 0.7 + 2.0); // Pulsating
  vec2 oc1_pos = vec2(cos(t * 1.0 + 3.0) * 0.45, sin(t * -0.8 - 1.5)) * 0.6;
  float oc1_shape = circle(uv, oc1_pos, oc1_radius);
  
  // When this mixes, if 'col' was primaryColor, it will blend it towards backgroundColor.
  // The alpha (oc1_shape) determines how much it erases.
  // A higher alpha for oc1_shape means stronger erasure.
  col = mix(col, backgroundColor, oc1_shape * 0.85); // 0.85 alpha for the occluding effect

  gl_FragColor = vec4(col, 1.0);
}`;

export default function Rewind1() {
  const raf = useRef(null);
  const start = useRef(0);

  function onContextCreate(gl) {
    const { drawingBufferWidth: width, drawingBufferHeight: height } = gl;
    gl.viewport(0, 0, width, height);
    gl.clearColor(240.0 / 255.0, 240.0 / 255.0, 240.0 / 255.0, 1.0);

    const vs = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vs, vertexShaderSrc);
    gl.compileShader(vs);
    if (!gl.getShaderParameter(vs, gl.COMPILE_STATUS)) {
      console.error("Vertex shader compile error: " + gl.getShaderInfoLog(vs));
      gl.deleteShader(vs);
      return;
    }

    const fs = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fs, fragmentShaderSrc);
    gl.compileShader(fs);
    if (!gl.getShaderParameter(fs, gl.COMPILE_STATUS)) {
      console.error(
        "Fragment shader compile error: " + gl.getShaderInfoLog(fs)
      );
      gl.deleteShader(vs);
      gl.deleteShader(fs);
      return;
    }

    const program = gl.createProgram();
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error(
        "Shader program link error: " + gl.getProgramInfoLog(program)
      );
      gl.deleteProgram(program);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
      return;
    }
    gl.useProgram(program);

    gl.deleteShader(vs);
    gl.deleteShader(fs);

    const quadVertices = new Float32Array([
      1.0, -1.0, -1.0, -1.0, -1.0, 1.0, 1.0, -1.0, 1.0, 1.0, -1.0, 1.0,
    ]);
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, quadVertices, gl.STATIC_DRAW);

    const positionAttribLocation = gl.getAttribLocation(program, "a_Position");
    gl.enableVertexAttribArray(positionAttribLocation);
    gl.vertexAttribPointer(positionAttribLocation, 2, gl.FLOAT, false, 0, 0);

    const uResolutionLocation = gl.getUniformLocation(program, "u_Resolution");
    const uTimeLocation = gl.getUniformLocation(program, "u_Time");

    if (uResolutionLocation === null || uTimeLocation === null) {
      console.error("Failed to get uniform locations.");
      gl.deleteProgram(program);
      return;
    }

    gl.uniform2f(uResolutionLocation, width, height);
    start.current = performance.now();

    function render() {
      const now = performance.now();
      gl.uniform1f(uTimeLocation, (now - start.current) * 0.001);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
      gl.endFrameEXP();
      raf.current = requestAnimationFrame(render);
    }
    render();
  }

  useEffect(() => {
    return () => {
      if (raf.current) {
        cancelAnimationFrame(raf.current);
        raf.current = null;
      }
    };
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
    backgroundColor: "COLORS.background",
  },
  background: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#f0f0f0",
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
  },
});
