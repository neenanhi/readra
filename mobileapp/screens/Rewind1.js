import React, {useEffect, useState} from 'react';
import { View } from 'react-native';
import { GLView } from 'expo-gl';

var VSHADER_SOURCE = `
  attribute vec4 a_Position;
  attribute vec4 a_Color;
  varying vec4 v_Color;
  void main() {
    gl_Position = a_Position;
    v_Color = a_Color;
  }`;

// Fragment shader program
var FSHADER_SOURCE = `
  precision mediump float;
  varying vec4 v_Color;
  void main() {
    gl_FragColor = v_Color;
  }`;

let vertexBuffer, a_Position, a_Color, gl;

export default function Rewind1() {
    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <GLView key={VSHADER_SOURCE} style={{ width: "100%", height: "100%" }} onContextCreate={onContextCreate} />
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

    a_Color = gl.getAttribLocation(gl.program, 'a_Color');
    if (a_Color < 0) {
        console.log('Failed to get the storage location of a_Color');
        return -1;
    }

    gl.clearColor(0, 0, 0, 1.0);

    // Clear <canvas>
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    requestAnimationFrame(tick);
}

let g_startTime = performance.now() / 1000.0;
let g_seconds = performance.now() / 1000.0 - g_startTime;

function tick() {

    g_seconds = performance.now() / 1000.0 - g_startTime;

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    var tri1 = new Float32Array([
        1.0,  -1.0,  Math.cos(g_seconds),  0.0,  0.0,
        1.0, 1.0,  0.0,  Math.sin(g_seconds),  0.0,
        -1.0, 1.0,  0.0,  0.0,  Math.tan(g_seconds),
    ]);

    var tri2 = new Float32Array([
        1.0,  -1.0,  Math.sin(g_seconds),  0.0,  0.0,
        -1.0, -1.0,  0.0,  Math.tan(g_seconds),  0.0,
        -1.0, 1.0,  0.0,  0.0,  Math.cos(g_seconds),
    ]);

    drawTriangle(tri1);
    drawTriangle(tri2);

    gl.flush();
    gl.endFrameEXP();

    requestAnimationFrame(tick);
}

function drawTriangle(verticesColors) {
    const FSIZE = verticesColors.BYTES_PER_ELEMENT;

    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verticesColors), gl.DYNAMIC_DRAW);

    gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, FSIZE * 5, 0);
    gl.enableVertexAttribArray(a_Position);

    gl.vertexAttribPointer(a_Color, 3, gl.FLOAT, false, FSIZE * 5, FSIZE * 2);
    gl.enableVertexAttribArray(a_Color);


    gl.drawArrays(gl.TRIANGLES, 0, 3);
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