import { View, StyleSheet } from "react-native";
import { useEffect, useRef } from "react";
import { GLView } from "expo-gl";
import RewindScreen2 from "./RewindScreen2"; // Assuming this component exists

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

// --- Shape and Utility Functions (for Triangles) ---

// 2D rotation matrix
mat2 rotate(float angle) {
    float s = sin(angle);
    float c = cos(angle);
    return mat2(c, -s, s, c);
}

// Signed Distance Function for an equilateral triangle centered at origin
float sdfEquilateralTriangle(vec2 p, float r) {
    const float k = sqrt(3.0); 
    p.x = abs(p.x) - r;
    p.y = p.y + r / k; 
    if (p.x + k * p.y > 0.0) { 
        p = vec2(p.x - k * p.y, -k * p.x - p.y) / 2.0; 
    }
    p.x -= clamp(p.x, -2.0 * r, 0.0); 
    return -length(p) * sign(p.y); 
}

// Triangle shape function using SDF
float triangle(vec2 uv, vec2 center, float size, float angle, float feather) {
    vec2 p = rotate(-angle) * (uv - center); 
    float d = sdfEquilateralTriangle(p, size); 
    return smoothstep(feather, -feather, d); 
}

void main() {
  vec2 uv = gl_FragCoord.xy / u_Resolution; 
  uv = uv * 2.0 - 1.0; 
  uv.x *= u_Resolution.x / u_Resolution.y; 

  // Define colors
  vec3 backgroundColor = vec3(240.0/255.0, 240.0/255.0, 240.0/255.0); // #f0f0f0
  vec3 primaryShapeColor = vec3(125.0/255.0, 129.0/255.0, 159.0/255.0); // #7d819f

  // Start with the background color
  vec3 col = backgroundColor;

  float t = u_Time * 0.4; 
  float triangleFeather = 0.02; 

  // --- Primary Color Triangles ---
  // Triangle 1 - Adjusted phase for different starting position
  vec2 center1 = vec2(sin(t * 1.1 + 0.8), cos(t * 0.9 + 2.1)) * 0.55;  float size1 = 0.28; 
  float angle1 = t * 0.5; 
  float tri1_shape = triangle(uv, center1, size1, angle1, triangleFeather);

  // Triangle 2 - Kept original phase, different from others
  vec2 center2 = vec2(cos(t * 1.4 - 0.5), sin(t * 1.2 + 1.2)) * 0.6;
  float size2 = 0.22; 
  float angle2 = -t * 0.6; 
  float tri2_shape = triangle(uv, center2, size2, angle2, triangleFeather);

  // Triangle 3 - Adjusted phase for different starting position
  vec2 center3 = vec2(sin(t * 0.8 - 1.5), cos(t * 1.5 + 1.0)) * 0.5; // Adjusted phase offsets
  float size3 = 0.18; 
  float angle3 = t * 0.7 + 1.0; 
  float tri3_shape = triangle(uv, center3, size3, angle3, triangleFeather);

  // Mix primary triangle colors
  col = mix(col, primaryShapeColor, tri1_shape);
  col = mix(col, primaryShapeColor, tri2_shape * 0.95); 
  col = mix(col, primaryShapeColor, tri3_shape * 0.9);  

  // --- Occluding Shapes ---
  // Occluding Triangle
  float oc_size = 0.25 + 0.03 * sin(u_Time * 0.7 + 2.0); 
  vec2 oc_center = vec2(cos(t * 1.0 + 3.0) * 0.45, sin(t * -0.8 - 1.5)) * 0.6; 
  float oc_angle = t * 0.4; 
  float oc_tri_shape = triangle(uv, oc_center, oc_size, oc_angle, triangleFeather * 1.1); 
  col = mix(col, backgroundColor, oc_tri_shape * 0.85); 

  gl_FragColor = vec4(col, 1.0);
}`;

const Rewind2 = () => {
  // second rewind screen
  const raf = useRef(null);
  const start = useRef(0);

  function onContextCreate(gl) {
    const { drawingBufferWidth: width, drawingBufferHeight: height } = gl;
    gl.viewport(0, 0, width, height);
    gl.clearColor(240.0 / 255.0, 240.0 / 255.0, 240.0 / 255.0, 1.0); // #f0f0f0

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
      console.error(
        "Failed to get uniform locations. u_Resolution:",
        uResolutionLocation,
        "u_Time:",
        uTimeLocation
      );
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
        <RewindScreen2 />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f0f0f0",
  },
  background: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
  },
});

export default Rewind2;
