var
  gl, CURRENT_SHAPE = 'LINE_STRIP', LAST_VERTEX = vec2(0, 0), PRESSED = false, CURRENT_WIDTH = 1,
  CURRENT_INDEX = 0,
  TOLERANCE = 0.005,
  MAX_POINTS = 4096,
  SIZE_OF_FLOAT = 4,
  currentVertexArray = [],
  vertices = [];

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

  uiElements.ctrlLineWidth.addEventListener('change', function (event) {
    CURRENT_WIDTH = parseInt(event.target.value, 10);
  });

  uiElements.ctrlClearCanvas.addEventListener('click', function (event) {
    gl.clear(gl.COLOR_BUFFER_BIT);
    vertices = [];
    uiElements.infoVertices.value = 0 + ' out of ' + MAX_POINTS;
  });

  uiElements.canvas.addEventListener('mousedown', function (event) {
    var glCoords = P909Utils.convertCoords(event.layerX, event.layerY, uiElements.canvas);
    uiElements.infoLayerPosition.value = P909Utils.printCoords(event.layerX, event.layerY);
    uiElements.infoIsMouseDown.value = 'DOWN';
    PRESSED = true;
    CURRENT_INDEX += 1;
    uiElements.infoNormalizedPosition.value = P909Utils.printCoords(glCoords.x, glCoords.y);
  });

  uiElements.canvas.addEventListener('mouseup', function (event) {
    var glCoords = P909Utils.convertCoords(event.layerX, event.layerY, uiElements.canvas);
    uiElements.infoNormalizedPosition.value = P909Utils.printCoords(glCoords.x, glCoords.y);
    uiElements.infoLayerPosition.value = P909Utils.printCoords(event.layerX, event.layerY);
    uiElements.infoIsMouseDown.value = '';
    currentVertexArray = [];
    PRESSED = false;
  });

  uiElements.canvas.addEventListener('mousemove', function (event) {
    var glCoords = P909Utils.convertCoords(event.layerX, event.layerY, uiElements.canvas);
    var currentPoint = vec2(glCoords.x, glCoords.y);
    uiElements.infoLayerPosition.value = P909Utils.printCoords(event.layerX, event.layerY);
    uiElements.infoNormalizedPosition.value = P909Utils.printCoords(glCoords.x, glCoords.y);
    if (PRESSED) {
      if (Math.abs(LAST_VERTEX[0] - glCoords.x) > TOLERANCE) {
        var total = P909Utils.countElements(vertices);
        if (total >= MAX_POINTS) {
          vertices = [];
          uiElements.infoVertices.value = 'max vertices number!';
        }
        currentVertexArray.push(currentPoint);
        vertices.push(new P909Utils.VertexObject(
          currentVertexArray, CURRENT_WIDTH, '', CURRENT_SHAPE
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

  function render() {
    var currentPoints, colors, start = 0;

    for (var i = 0; i < vertices.length; i += 1) {
      currentPoints = vertices[i];

      gl.bindBuffer(gl.ARRAY_BUFFER, bufferId);
      gl.bufferSubData(gl.ARRAY_BUFFER, start, flatten(currentPoints.points));

      gl.lineWidth(currentPoints.width);

      if (currentPoints.length == 1) {
        gl.drawArrays(gl.POINTS, start, currentPoints.points.length);
      } else {
        console.log('drawing '+currentPoints.shape);
        P909Utils.drawBuffer(gl, currentPoints.shape, start, currentPoints.points.length);
      }
    }

  }

  render();

};

