var
  gl, CURRENT_SHAPE = 'line', LAST_VERTEX = vec2(0, 0), PRESSED = false, CURRENT_WIDTH = 1,
  CURRENT_INDEX = 0,
  TOLERANCE = 0.005,
  MAX_POINTS = 1024,
  SIZE_OF_FLOAT = 4,
  currentVertexArray = [],
  vertices = [];

var VertexObject = function (points, width, color) {
  this.points = [];
  for (var p = 0; p < points.length; p += 1) {
    this.points.push(points[p]);
  }
  this.width = width;
  this.color = vec4(1.0, 0.0, 0.0, 1.0);
};

function printVec2(vec) {
  return vec[0] + ',' + vec[1];
}

function printCoords(x, y) {
  return x + ',' + y;
}

/**
 * Flatten arrays and count elements
 * @param array {Array} of VertexObject
 * @returns {number} the number of items
 */
function countElements(array) {
  var total = 0;
  for (var i = 0; i < array.length; i += 1) {
    total += array[i].points.length;
  }
  return total;
}

/**
 * Automagically convert coordinates from DOM to WebGL context.
 * @param mouseX {number} the mouse X coordinate
 * @param mouseY {number} the mouse Y coordinate
 * @param canvas {HTMLElement} the canvas being used
 * @returns {{x: number, y: number}}
 */
function convertCoords(mouseX, mouseY, canvas) {
  return {
    x: Math.floor(((mouseX / canvas.width * 2) - 1) * 1000) / 1000,
    y: Math.floor((((canvas.height - mouseY) / canvas.height * 2) - 1) * 1000) / 1000
  };
}

function getUIElements() {
  return {
    theContainer          : document.getElementById('theContainer'),
    canvas                : document.getElementById('gl-canvas'),
    infoLayerPosition     : document.getElementById('layerPosition'),
    infoIsMouseDown       : document.getElementById('isMouseDown'),
    infoNormalizedPosition: document.getElementById('normalizedPosition'),
    infoVertices          : document.getElementById('infoVertices'),
    ctrlLineWidth         : document.getElementById('ctrlLineWidth'),
    ctrlClearCanvas       : document.getElementById('ctrlClearCanvas'),
    drawType0             : document.getElementById('drawType0'),
    drawType1             : document.getElementById('drawType1'),
    drawType2             : document.getElementById('drawType2'),
    drawType3             : document.getElementById('drawType3'),
    drawType4             : document.getElementById('drawType3')
  }
}

window.onload = function () {
  'use strict';

  var uiElements = getUIElements();

  uiElements.canvas.height = window.innerHeight;
  uiElements.canvas.width = theContainer.clientWidth;

  // init context
  gl = WebGLUtils.setupWebGL(uiElements.canvas);

  if (!gl) {
    alert('WebGL is not available');
    return;
  }

  /**
   * the buffer for Vertex: they are represented as Vec2 and will then take 4 byte * 2 = 8 byte
   */
  var bufferId = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, bufferId);
  gl.bufferData(gl.ARRAY_BUFFER, SIZE_OF_FLOAT * 2 * MAX_POINTS, gl.STATIC_DRAW);

  /**
   * the buffer for the Color: it is represented as Vec4 and will then take 4 byte * 4 = 16 byte
   */
  var cBufferId = gl.createBuffer();
  //gl.bindBuffer(gl.ARRAY_BUFFER, cBufferId);
  //gl.bufferData(gl.ARRAY_BUFFER, SIZE_OF_FLOAT * 4 * MAX_POINTS, gl.STATIC_DRAW);

  // configure webgl
  gl.viewport(0, 0, uiElements.canvas.width, uiElements.canvas.height);
  gl.clearColor(1.0, 1.0, 1.0, 1.0);
  gl.lineWidth(1);

  // load shaders
  var program = initShaders(gl, 'vertex-shader', 'fragment-shader');

  gl.useProgram(program);

  // load data into the GPU
  var vPos = gl.getAttribLocation(program, 'vPosition');
  gl.vertexAttribPointer(vPos, 2, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(vPos);
  /*
   var vColor = gl.getAttribLocation(program, 'vColor');
   gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 0, 0);
   gl.enableVertexAttribArray(vColor);
   */
  uiElements.ctrlLineWidth.addEventListener('change', function (event) {
    CURRENT_WIDTH = parseInt(event.target.value, 10);
  });

  uiElements.ctrlClearCanvas.addEventListener('click', function (event) {
    gl.clear(gl.COLOR_BUFFER_BIT);
    vertices = [];
    uiElements.infoVertices.value = 0 + ' out of ' + MAX_POINTS;
  });

  uiElements.canvas.addEventListener('mousedown', function (event) {
    var glCoords = convertCoords(event.layerX, event.layerY, uiElements.canvas);
    uiElements.infoLayerPosition.value = printCoords(event.layerX, event.layerY);
    uiElements.infoIsMouseDown.value = 'DOWN';
    PRESSED = true;
    CURRENT_INDEX += 1;
    uiElements.infoNormalizedPosition.value = printCoords(glCoords.x, glCoords.y);
  });

  uiElements.canvas.addEventListener('mouseup', function (event) {
    var glCoords = convertCoords(event.layerX, event.layerY, uiElements.canvas);
    uiElements.infoNormalizedPosition.value = printCoords(glCoords.x, glCoords.y);
    uiElements.infoLayerPosition.value = printCoords(event.layerX, event.layerY);
    uiElements.infoIsMouseDown.value = '';
    currentVertexArray = [];
    PRESSED = false;
  });

  uiElements.canvas.addEventListener('mousemove', function (event) {
    var glCoords = convertCoords(event.layerX, event.layerY, uiElements.canvas);
    var currentPoint = vec2(glCoords.x, glCoords.y);
    uiElements.infoLayerPosition.value = printCoords(event.layerX, event.layerY);
    uiElements.infoNormalizedPosition.value = printCoords(glCoords.x, glCoords.y);
    if (PRESSED) {
      if (Math.abs(LAST_VERTEX[0] - glCoords.x) > TOLERANCE) {
        var total = countElements(vertices);
        if (total === MAX_POINTS) {
          vertices = [];
        }
        //console.log('current point: ' + printVec2(currentPoint));
        currentVertexArray.push(currentPoint);
        vertices.push(new VertexObject(
          currentVertexArray, CURRENT_WIDTH, ''
        ));
        uiElements.infoVertices.value = total + ' out of ' + MAX_POINTS;
        LAST_VERTEX = currentPoint;
        render();
      }
    }
  });

  function onDrawChange(event) {
    if (event.target.checked) {
      CURRENT_SHAPE = event.target.value;
    }
  }

  uiElements.drawType0.addEventListener('change', onDrawChange);
  uiElements.drawType1.addEventListener('change', onDrawChange);
  uiElements.drawType2.addEventListener('change', onDrawChange);
  uiElements.drawType3.addEventListener('change', onDrawChange);
  uiElements.drawType4.addEventListener('change', onDrawChange);

  function render() {
    var currentPoints, color = vec4(Math.random(), Math.random(), 0.0, 1.0), start = 0;
    console.log(CURRENT_SHAPE);

    //gl.bindBuffer(gl.ARRAY_BUFFER, cBufferId);
    //gl.bufferSubData(gl.ARRAY_BUFFER, SIZE_OF_FLOAT * 4 * countElements(vertices), flatten(color));

    //gl.bindBuffer(gl.ARRAY_BUFFER, bufferId);
    //gl.bufferSubData(gl.ARRAY_BUFFER, SIZE_OF_FLOAT * 2 * countElements(vertices), flatten(vertices));

    for (var i = 0; i < vertices.length; i += 1) {
      currentPoints = vertices[i];

      //gl.lineWidth(CURRENT_WIDTH);

      gl.bindBuffer(gl.ARRAY_BUFFER, bufferId);
      gl.bufferSubData(gl.ARRAY_BUFFER, start, flatten(currentPoints.points));

      gl.lineWidth(currentPoints.width);
      /*
       gl.bindBuffer(gl.ARRAY_BUFFER, cBufferId);
       gl.bufferSubData(gl.ARRAY_BUFFER, 0, flatten(color));
       */
      if (currentPoints.length == 1) {
        gl.drawArrays(gl.POINTS, start, currentPoints.points.length);
      } else {
        switch (CURRENT_SHAPE) {
          case 'lines' :
            gl.drawArrays(gl.LINES, start, currentPoints.points.length);
            break;
          case 'line' :
            gl.drawArrays(gl.LINE_STRIP, start, currentPoints.points.length);
            break;
          case 'triangle_fan':
            gl.drawArrays(gl.TRIANGLE_FAN, start, currentPoints.points.length);
            break;
          case 'triangle_loop':
            gl.drawArrays(gl.TRIANGLE_LOOP, start, currentPoints.points.length);
            break;
          default :
            gl.drawArrays(gl.POINTS, start, currentPoints.points.length);
        }
      }
    }

  }

  render();

};

