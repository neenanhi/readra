// File: Rewind3.js
import React, { useEffect, useState, useRef } from "react";
import { View, Text, StyleSheet, Animated } from "react-native";
import LottieView from "lottie-react-native";
import { getRewind3Data } from "../../api/rewindData";
import { use } from "react";

const AnimatedLottie = Animated.createAnimatedComponent(LottieView);

export default function RewindWithDataScreen({isActive}) {
  const [topAuthors, setTopAuthors] = useState([]);
  const [topRatedBooks, setTopRatedBooks] = useState([]);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const progress = useRef(new Animated.Value(0)).current;
  const lottieRef = useRef(null);

  // 1️⃣ Fetch data once on mount
  useEffect(() => {
    getRewind3Data()
      .then(data => {
        setTopAuthors(data.topAuthors || []);
        setTopRatedBooks(data.topBooks || []);
      })
      .catch(e => console.error("fetchData error:", e));
  }, []);

  useEffect(() => {
    if (!isActive) return;
    fadeAnim.setValue(0); // reset fade animation
    slideAnim.setValue(50); // reset slide animation

    progress.setValue(0); // reset progress animation
    Animated.timing(progress, {
      toValue: 1,
      duration: 1200,
      useNativeDriver: false,
    }).start();
    // lottieRef.current?.reset();
    // lottieRef.current?.play();

        // slide + fade in
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1200,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 1200,
        useNativeDriver: true,
      }),
    ]).start();
  }, [isActive, fadeAnim, slideAnim, progress]);

  return (
    <View style={styles.container}>
      {/* key toggles so Lottie unmounts/remounts each focus */}
      <AnimatedLottie
        // key={String(isActive)}
        // ref={lottieRef}
        source={require("../../assets/animations/spotlight.json")}
        // autoPlay={false}
        // loop={false}
        // speed={0.25}
        progress={progress}
        resizeMode="cover"
        style={styles.background}
      />

      <Animated.View
        style={[
          styles.statsCard,
          { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
        ]}
      >
        <Text style={styles.sectionHeader}>Top Rated Books</Text>
        {topRatedBooks.length ? (
          topRatedBooks.map((b, i) => (
            <Text key={i} style={styles.text}>
              {b.title} — {b.user_rating} ⭐
            </Text>
          ))
        ) : (
          <Text style={styles.text}>Loading…</Text>
        )}

        <Text style={styles.sectionHeader}>Top Rated Authors</Text>
        <Text style={styles.text}>
          {topAuthors.length ? topAuthors.join(", ") : "Loading…"}
        </Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(123, 116, 73, 0.15)",
  },
  background: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 0,
  },
  statsCard: {
    alignSelf: "center",
    zIndex: 1,
    width: "90%",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    elevation: 8,
  },
  sectionHeader: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#4169E1",
    marginBottom: 12,
    textAlign: "center",
  },
  text: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 6,
  },
});

// // File: Rewind3.js

// import { View, Text, StyleSheet, Animated } from "react-native";
// import { useEffect, useState, useRef } from "react";
// import { GLView } from "expo-gl";
// import { getRewind3Data } from "../../api/rewindData";

// const vertexShaderSrc = `
// precision mediump float;
// attribute vec2 a_Position;
// void main() {
//   gl_Position = vec4(a_Position, 0.0, 1.0);
// }`;

// const fragmentShaderSrc = `
// precision mediump float;
// uniform vec2 u_Resolution;
// uniform float u_Time;

// // --- Shape and Utility Functions ---

// // 2D rotation matrix (still needed for rotating squares)
// mat2 rotate(float angle) {
//     float s = sin(angle);
//     float c = cos(angle);
//     return mat2(c, -s, s, c);
// }

// // --- NEW: Signed Distance Function for a square centered at origin ---
// // 'p' is the point to check, 'halfSize' is half the side length of the square.
// float sdfSquare(vec2 p, float halfSize) {
//     vec2 d = abs(p) - vec2(halfSize);
//     return length(max(d, 0.0)) + min(max(d.x, d.y), 0.0);
// }

// // --- NEW: Square shape function using SDF ---
// // 'size' here will be used as 'halfSize' for the square.
// float square(vec2 uv, vec2 center, float size, float angle, float feather) {
//     vec2 p = rotate(-angle) * (uv - center); // Apply rotation
//     float d = sdfSquare(p, size);           // Use the square SDF
//     return smoothstep(feather, -feather, d); // Use smoothstep for anti-aliasing
// }

// /*
// // OLD Triangle SDF and function (commented out or removed)
// float sdfEquilateralTriangle(vec2 p, float r) {
//     const float k = sqrt(3.0);
//     p.x = abs(p.x) - r;
//     p.y = p.y + r / k;
//     if (p.x + k * p.y > 0.0) {
//         p = vec2(p.x - k * p.y, -k * p.x - p.y) / 2.0;
//     }
//     p.x -= clamp(p.x, -2.0 * r, 0.0);
//     return -length(p) * sign(p.y);
// }

// float triangle(vec2 uv, vec2 center, float size, float angle, float feather) {
//     vec2 p = rotate(-angle) * (uv - center);
//     float d = sdfEquilateralTriangle(p, size);
//     return smoothstep(feather, -feather, d);
// }
// */

// void main() {
//   vec2 uv = gl_FragCoord.xy / u_Resolution;
//   uv = uv * 2.0 - 1.0; // Normalize to -1.0 to 1.0 range
//   uv.x *= u_Resolution.x / u_Resolution.y; // Correct for aspect ratio

//   // Define colors
//   vec3 backgroundColor = vec3(240.0/255.0, 240.0/255.0, 240.0/255.0); // #f0f0f0
//   vec3 primaryShapeColor = vec3(125.0/255.0, 129.0/255.0, 159.0/255.0); // #7d819f

//   // Start with the background color
//   vec3 col = backgroundColor;

//   float t = u_Time * 0.4;
//   float shapeFeather = 0.02; // Renamed from triangleFeather for generality

//   // --- Primary Color Squares ---
//   // Note: The 'size' parameters (size1, size2, size3, oc_size) will now define
//   // the half-side length of the squares. You might want to adjust these values
//   // to get the desired visual appearance, as they previously defined the 'radius' for triangles.

//   // Square 1 - Changed phase offsets for different starting position
//   vec2 center1 = vec2(sin(t * 1.1 + 1.5), cos(t * 0.9 + 2.0)) * 0.55; // MODIFIED
//   float size1 = 0.20; // Adjusted size for square (half side-length)
//   float angle1 = t * 0.5;
//   float sq1_shape = square(uv, center1, size1, angle1, shapeFeather);

//   // Square 2 - Changed phase offsets for different starting position
//   vec2 center2 = vec2(cos(t * 1.4 + 3.0), sin(t * 1.2 - 1.0)) * 0.6; // MODIFIED
//   float size2 = 0.15; // Adjusted size for square (half side-length)
//   float angle2 = -t * 0.6;
//   float sq2_shape = square(uv, center2, size2, angle2, shapeFeather);

//   // Square 3 - Changed phase offsets for different starting position
//   vec2 center3 = vec2(sin(t * 0.8 - 0.5), cos(t * 1.5 + 4.5)) * 0.5; // MODIFIED
//   float size3 = 0.12; // Adjusted size for square (half side-length)
//   float angle3 = t * 0.7 + 1.0;
//   float sq3_shape = square(uv, center3, size3, angle3, shapeFeather);

//   // Mix primary square colors
//   col = mix(col, primaryShapeColor, sq1_shape);
//   col = mix(col, primaryShapeColor, sq2_shape * 0.95);
//   col = mix(col, primaryShapeColor, sq3_shape * 0.9);

//   // --- Occluding Shapes ---
//   // Occluding Square - Changed phase offsets for different starting position
//   float oc_size = 0.18 + 0.03 * sin(u_Time * 0.7 + 2.0); // Adjusted size for square (half side-length)
//   vec2 oc_center = vec2(cos(t * 1.0 + 5.0), sin(t * -0.8 - 2.5)) * 0.6; // MODIFIED
//   float oc_angle = t * 0.4;
//   float oc_sq_shape = square(uv, oc_center, oc_size, oc_angle, shapeFeather * 1.1);
//   col = mix(col, backgroundColor, oc_sq_shape * 0.85); // Mix with background for occlusion

//   gl_FragColor = vec4(col, 1.0);
// }`;

// const RewindWithDataScreen = () => {
//   // State for top authors and books
//   const [topAuthors, setTopAuthors] = useState([]);
//   const [topRatedBooks, setTopRatedBooks] = useState([]);
//   const fadeAnim = useRef(new Animated.Value(0)).current;

//   // Refs for GL animation
//   const raf = useRef(null);
//   const glContext = useRef(null);
//   const programRef = useRef(null);
//   const bufferRef = useRef(null);

//   // onContextCreate for WebGL setup
//   function onContextCreate(gl) {
//     glContext.current = gl;
//     const { drawingBufferWidth: width, drawingBufferHeight: height } = gl;
//     gl.viewport(0, 0, width, height);
//     gl.clearColor(240.0 / 255.0, 240.0 / 255.0, 240.0 / 255.0, 1.0); // #f0f0f0

//     const vs = gl.createShader(gl.VERTEX_SHADER);
//     gl.shaderSource(vs, vertexShaderSrc);
//     gl.compileShader(vs);
//     if (!gl.getShaderParameter(vs, gl.COMPILE_STATUS)) {
//       console.error("Vertex shader compile error: " + gl.getShaderInfoLog(vs));
//       gl.deleteShader(vs);
//       return;
//     }

//     const fs = gl.createShader(gl.FRAGMENT_SHADER);
//     gl.shaderSource(fs, fragmentShaderSrc);
//     gl.compileShader(fs);
//     if (!gl.getShaderParameter(fs, gl.COMPILE_STATUS)) {
//       console.error(
//         "Fragment shader compile error: " + gl.getShaderInfoLog(fs)
//       );
//       gl.deleteShader(vs); // Clean up vertex shader if fragment fails
//       gl.deleteShader(fs);
//       return;
//     }

//     const program = gl.createProgram();
//     programRef.current = program; // Store program
//     gl.attachShader(program, vs);
//     gl.attachShader(program, fs);
//     gl.linkProgram(program);
//     if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
//       console.error(
//         "Shader program link error: " + gl.getProgramInfoLog(program)
//       );
//       gl.deleteProgram(program);
//       gl.deleteShader(vs);
//       gl.deleteShader(fs);
//       programRef.current = null;
//       return;
//     }
//     gl.useProgram(program);

//     // Shaders are linked, so they can be deleted
//     gl.deleteShader(vs);
//     gl.deleteShader(fs);

//     const quadVertices = new Float32Array([
//       // Full-screen quad
//       1.0, 1.0, -1.0, 1.0, 1.0, -1.0, -1.0, -1.0,
//     ]);
//     const buffer = gl.createBuffer();
//     bufferRef.current = buffer;
//     gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
//     gl.bufferData(gl.ARRAY_BUFFER, quadVertices, gl.STATIC_DRAW);

//     const positionAttribLocation = gl.getAttribLocation(program, "a_Position");
//     gl.enableVertexAttribArray(positionAttribLocation);
//     // Corrected vertexAttribPointer for drawing two triangles (a quad)
//     // Each vertex has 2 components (x, y)
//     gl.vertexAttribPointer(positionAttribLocation, 2, gl.FLOAT, false, 0, 0);

//     const uResolutionLocation = gl.getUniformLocation(program, "u_Resolution");
//     const uTimeLocation = gl.getUniformLocation(program, "u_Time");

//     if (uResolutionLocation === null || uTimeLocation === null) {
//       console.error(
//         "Failed to get uniform locations. u_Resolution:",
//         uResolutionLocation,
//         "u_Time:",
//         uTimeLocation
//       );
//       if (program) gl.deleteProgram(program);
//       programRef.current = null;
//       if (buffer) gl.deleteBuffer(buffer);
//       bufferRef.current = null;
//       return;
//     }

//     gl.uniform2f(uResolutionLocation, width, height);
//     const startTime = performance.now();

//     function render(now) {
//       if (!glContext.current || !programRef.current) {
//         // Check if GL context or program is still valid
//         if (raf.current) cancelAnimationFrame(raf.current);
//         return;
//       }
//       gl.uniform1f(uTimeLocation, (now - startTime) * 0.001);

//       gl.clear(gl.COLOR_BUFFER_BIT);
//       // Draw the quad using TRIANGLE_STRIP and 4 vertices
//       gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

//       gl.endFrameEXP(); // Required for Expo GLView
//       raf.current = requestAnimationFrame(render);

//       setTimeout(() => {
//         if (raf.current) cancelAnimationFrame(raf.current)
//       }, 3000);
//     }
//     raf.current = requestAnimationFrame(render);
//   }

//   useEffect(() => {
//     return () => {
//       if (raf.current) {
//         cancelAnimationFrame(raf.current);
//         raf.current = null;
//       }
//       // Cleanup WebGL resources
//       const gl = glContext.current;
//       if (gl) {
//         if (programRef.current) {
//           gl.deleteProgram(programRef.current);
//           programRef.current = null;
//         }
//         if (bufferRef.current) {
//           gl.deleteBuffer(bufferRef.current);
//           bufferRef.current = null;
//         }
//       }
//       glContext.current = null;
//     };
//   }, []);

//   // useEffect for data fetching and fade animation
//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         const rewind3Data = await getRewind3Data();
//         setTopAuthors(rewind3Data.topAuthors || []);
//         setTopRatedBooks(rewind3Data.topBooks || []);
//         Animated.timing(fadeAnim, {
//           toValue: 1,
//           duration: 2000,
//           useNativeDriver: true, // Ensure this is supported for opacity on View
//         }).start();
//       } catch (error) {
//         console.error("Failed to fetch rewind data:", error);
//       }
//     };
//     fetchData();
//   }, [fadeAnim]);

//   // renderBooks function
//   const renderBooks = () =>
//     topRatedBooks.map((book, idx) => (
//       <Text key={idx} style={styles.text}>
//         {book.title} — {book.user_rating}
//       </Text>
//     ));

//   return (
//     <View style={styles.container}>
//       <GLView style={styles.glView} onContextCreate={onContextCreate} />
//       <View style={styles.overlayContent} pointerEvents="box-none">
//         <View style={styles.statsCard}>
//           <Text style={styles.sectionHeader}>Top Rated Books</Text>
//           <Animated.View
//             style={{ opacity: fadeAnim, width: "100%", alignItems: "center" }}
//           >
//             {topRatedBooks.length === 0 ? (
//               <Text style={styles.text}>Loading top books...</Text>
//             ) : (
//               renderBooks()
//             )}
//           </Animated.View>
//           <Text style={styles.sectionHeader}>Top Rated Authors</Text>
//           <Animated.View
//             style={{ opacity: fadeAnim, width: "100%", alignItems: "center" }}
//           >
//             <Text style={styles.text}>
//               {topAuthors.length === 0
//                 ? "Loading top authors..."
//                 : topAuthors.join(", ")}
//             </Text>
//           </Animated.View>
//         </View>
//       </View>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: "#f0f0f0",
//   },
//   glView: {
//     position: "absolute",
//     top: 0,
//     left: 0,
//     right: 0,
//     bottom: 0,
//   },
//   overlayContent: {
//     flex: 1,
//     alignItems: "center",
//     justifyContent: "center",
//     backgroundColor: "transparent",
//     paddingHorizontal: 20,
//   },
//   sectionHeader: {
//     fontSize: 24,
//     fontWeight: "bold",
//     color: "#4169E1",
//     textAlign: "center",
//     marginTop: 30,
//     paddingBottom: 10,
//   },
//   text: {
//     fontSize: 16,
//     color: "666",
//     textAlign: "center",
//     marginBottom: 5,
//   },
//   statsCard: {
//     backgroundColor: "#ffffff",
//     borderRadius: 16,
//     padding: 32,
//     alignItems: "center",
//     width: "90%",

//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.1,
//     shadowRadius: 10,
//     elevation: 8,
//   },
// });

// export default RewindWithDataScreen;
