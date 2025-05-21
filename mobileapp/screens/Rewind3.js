import { View, Text, StyleSheet, Animated } from "react-native";
import { useEffect, useState, useRef } from "react";
import { GLView } from "expo-gl";
import { getRewind3Data } from "../api/rewindData";

// GLSL Shaders (same as rewind1.js)
const VSHADER_SOURCE = `
  attribute vec4 a_Position;
  void main() {
    gl_Position = a_Position;
  }
`;

const FSHADER_SOURCE = `
precision mediump float;

uniform vec2  u_Resolution;
uniform float u_Time;

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

void main() {
  vec2 st = gl_FragCoord.xy / u_Resolution;
  float ang = u_Time * 0.2;
  mat2 rot = mat2(
    cos(ang), -sin(ang),
    sin(ang),  cos(ang)
  );
  st = rot * (st - 0.5) + 0.5;
  float r = hash(st * 8.0 + u_Time * 0.3);
  float g = hash(st * 16.0 - u_Time * 0.5 + 1.0);
  float b = hash(st * 32.0 + u_Time * 0.8 + 2.0);
  r = smoothstep(0.2, 0.8, r);
  g = smoothstep(0.2, 0.8, g);
  b = smoothstep(0.2, 0.8, b);
  gl_FragColor = vec4(r, g, b, 1.0);
}
`;

let gl, a_Position, u_Resolution, u_Time, vertexBuffer;
let startTime = performance.now();

function loadShader(gl, type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  const compiled = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
  if (!compiled) {
    console.error('Shader compile failed:', gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

function onContextCreate(gll) {
  gl = gll;
  const { drawingBufferWidth: w, drawingBufferHeight: h } = gl;
  gl.viewport(0, 0, w, h);

  gl.enable(gl.DEPTH_TEST);
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

  const vertexShader = loadShader(gl, gl.VERTEX_SHADER, VSHADER_SOURCE);
  const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, FSHADER_SOURCE);

  const program = gl.createProgram();
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  gl.useProgram(program);
  gl.program = program;

  a_Position = gl.getAttribLocation(program, 'a_Position');
  u_Resolution = gl.getUniformLocation(program, 'u_Resolution');
  u_Time = gl.getUniformLocation(program, 'u_Time');

  gl.uniform2f(u_Resolution, w, h);

  const quadVerts = new Float32Array([
    1, -1, -1, -1, -1, 1,
    1, -1, 1, 1, -1, 1,
  ]);

  vertexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, quadVerts, gl.STATIC_DRAW);
  gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(a_Position);

  requestAnimationFrame(tick);
}

function tick() {
  const seconds = (performance.now() - startTime) * 0.001;
  gl.uniform1f(u_Time, seconds);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.drawArrays(gl.TRIANGLES, 0, 6);
  gl.flush();
  gl.endFrameEXP();
  requestAnimationFrame(tick);
}

const Rewind3 = () => {
  const [topAuthors, setTopAuthors] = useState([]);
  const [topRatedBooks, setTopRatedBooks] = useState([]);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const fetchData = async () => {
      const rewind3Data = await getRewind3Data();
      setTopAuthors(rewind3Data.topAuthors || []);
      setTopRatedBooks(rewind3Data.topBooks || []);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 2000,
        useNativeDriver: true,
      }).start();
    };
    fetchData();
  }, []);

  const renderBooks = () =>
    topRatedBooks.map((book, idx) => (
      <Text key={idx} style={styles.text}>
        {book.title} — {book.user_rating}
      </Text>
    ));

  return (
    <View style={styles.container}>
      <GLView
        style={StyleSheet.absoluteFill}
        key={FSHADER_SOURCE}
        onContextCreate={onContextCreate}
      />
      <View style={styles.overlay}>
        <Text style={styles.sectionHeader}>Top Rated Books</Text>
        <Animated.View style={{ opacity: fadeAnim }}>
          {topRatedBooks.length === 0 ? (
            <Text style={styles.text}>Loading top books...</Text>
          ) : (
            renderBooks()
          )}
        </Animated.View>
        <Text style={styles.sectionHeader}>Top Rated Authors</Text>
        <Animated.View style={{ opacity: fadeAnim }}>
          <Text style={styles.text}>
            {topAuthors.length === 0
              ? "Loading top authors..."
              : topAuthors.join("\n")}
          </Text>
        </Animated.View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  overlay: {
    position: "absolute",
    top: 0, left: 0, right: 0, bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  sectionHeader: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
    textAlign: "center",
    marginVertical: 10,
    textShadowColor: 'black',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
    marginTop: 70,
  },
  animatedText: {
    fontSize: 20,
    fontWeight: "600",
    color: 'white',
    marginTop: 10,
    textAlign: 'center',
  },
  text: {
    fontSize: 16,
    color: 'white',
    textAlign: 'center',
  },
});

export default Rewind3;
