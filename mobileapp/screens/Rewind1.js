import React, {useEffect, useState} from 'react';
import {Text, View} from 'react-native';
import { GLView } from 'expo-gl';

var VSHADER_SOURCE = `
  attribute vec4 a_Position;
  void main() {
    gl_Position = a_Position;
  }`;

// Fragment shader program
var FSHADER_SOURCE = `
// FSHADER_SOURCE
precision mediump float;

uniform vec2  u_Resolution;  // in pixels
uniform float u_Time;        // seconds since start

// cheap 2D hash
float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

void main() {
  // normalize to [0,1]
  vec2 st = gl_FragCoord.xy / u_Resolution;

  // rotate coords for more motion
  float ang = u_Time * 0.2;
  mat2 rot = mat2(
    cos(ang), -sin(ang),
    sin(ang),  cos(ang)
  );
  st = rot * (st - 0.5) + 0.5;

  // build three differently scaled “noise” layers
  float r = hash(st * 8.0 + u_Time * 0.3);
  float g = hash(st * 16.0 - u_Time * 0.5 + 1.0);
  float b = hash(st * 32.0 + u_Time * 0.8 + 2.0);

  // smooth out the result
  r = smoothstep(0.2, 0.8, r);
  g = smoothstep(0.2, 0.8, g);
  b = smoothstep(0.2, 0.8, b);

  gl_FragColor = vec4(r, g, b, 1.0);
}
`;

let vertexBuffer, a_Position, u_Resolution, u_Time, gl;

export default function Rewind1() {
    return (
        <View style={{ flex: 1, position: 'relative' }}>
            <GLView
                key={FSHADER_SOURCE}
                style={{ flex: 1 }}
                onContextCreate={onContextCreate}
            />
            <View
                style={{
                    position: 'absolute',
                    top: 0, left: 0, right: 0, bottom: 0,
                    justifyContent: 'center',
                    alignItems: 'center',
                    pointerEvents: 'none',
                }}
            >
                <Text
                    style={{
                        color: 'white',
                        fontSize: 36,
                        fontWeight: 'bold',
                        textShadowColor: 'rgba(0, 0, 0, 0.8)',
                        textShadowOffset: { width: 2, height: 2 },
                        textShadowRadius: 4,
                    }}
                >
                    You are a ---
                </Text>
            </View>
        </View>
    );
}


function onContextCreate(gll) {
    gl = gll;

    const { drawingBufferWidth: w, drawingBufferHeight: h } = gl;
    gl.viewport(0, 0, w, h);


    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);


    var vertexShader = loadShader(gl, gl.VERTEX_SHADER, VSHADER_SOURCE);
    var fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, FSHADER_SOURCE);
    if (!vertexShader || !fragmentShader) {
        return null;
    }

    var program = gl.createProgram();
    if (!program) {
        return null;
    }

    // Attach the shader objects
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);

    // Link the program object
    gl.linkProgram(program);
    gl.useProgram(program);
    gl.program = program;

    // Check the result of linking
    var linked = gl.getProgramParameter(program, gl.LINK_STATUS);
    if (!linked) {
        var error = gl.getProgramInfoLog(program);
        console.log('Failed to link program: ' + error);
        gl.deleteProgram(program);
        gl.deleteShader(fragmentShader);
        gl.deleteShader(vertexShader);
        return null;
    }

    if (!program) {
        console.log('Failed to create program');
        return false;
    }

    vertexBuffer = gl.createBuffer();
    if (!vertexBuffer) {
        console.log('Failed to create the buffer object');
        return -1;
    }

    a_Position = gl.getAttribLocation(gl.program, 'a_Position');
    if (a_Position < 0) {
        console.log('Failed to get the storage location of a_Position');
        return;
    }

    // a_Color = gl.getAttribLocation(gl.program, 'a_Color');
    // if (a_Color < 0) {
    //     console.log('Failed to get the storage location of a_Color');
    //     return -1;
    // }

    u_Time = gl.getUniformLocation(program, 'u_Time');

    u_Resolution = gl.getUniformLocation(program, 'u_Resolution');

    gl.uniform2f(u_Resolution, gl.drawingBufferWidth, gl.drawingBufferHeight);

    gl.clearColor(0, 0, 0, 1.0);

    // Clear <canvas>
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    const quadVerts = new Float32Array([
        // two triangles for a fullscreen quad
        1, -1,
        -1, -1,
        -1,  1,
        1, -1,
        1,  1,
        -1,  1,
    ]);

    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(quadVerts), gl.STATIC_DRAW);

    gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(a_Position);

    requestAnimationFrame(tick);
}

// let g_startTime = performance.now() / 1000.0;
// let g_seconds = performance.now() / 1000.0 - g_startTime;
let startTime = performance.now();

function tick() {

    // g_seconds = performance.now() / 1000.0 - g_startTime;
    const seconds = (performance.now() - startTime) * 0.001;

    gl.uniform1f(u_Time, seconds);

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    gl.drawArrays(gl.TRIANGLES, 0, 6);

    gl.flush();
    gl.endFrameEXP();

    requestAnimationFrame(tick);
}

function loadShader(gl, type, source) {
    // Create shader object
    var shader = gl.createShader(type);
    if (shader == null) {
        console.log('unable to create shader');
        return null;
    }

    // Set the shader program
    gl.shaderSource(shader, source);

    // Compile the shader
    gl.compileShader(shader);

    // Check the result of compilation
    var compiled = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
    if (!compiled) {
        var error = gl.getShaderInfoLog(shader);
        console.log('Failed to compile shader: ' + error);
        gl.deleteShader(shader);
        return null;
    }

    return shader;
}