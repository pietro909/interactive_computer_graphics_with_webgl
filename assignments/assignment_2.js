var
  gl, LAST_VERTEX = vec2(0, 0), PRESSED = false,
  TOLERANCE = 0.005,
  MAX_POINTS = 1024,
  lastArrayVertex = [],
  vertices = [];

function printCoords(x, y) {
  return x + ',' + y;
}

function convertCoords(mouseX, mouseY, canvas) {
  return {
    x: Math.floor(((mouseX / canvas.width * 2) - 1) * 1000) / 1000,
    y: Math.floor((((canvas.height - mouseY) / canvas.height * 2) - 1) * 1000) / 1000
  };
}

window.onload = function () {

  var theContainer = document.getElementById('theContainer');
  var canvas = document.getElementById('gl-canvas');
  canvas.height = window.innerHeight;
  canvas.width = theContainer.clientWidth;

  // bind UI
  var infoLayerPosition = document.getElementById('layerPosition');
  var infoIsMouseDown = document.getElementById('isMouseDown');
  var infoNormalizedPosition = document.getElementById('normalizedPosition');
  var infoVertices = document.getElementById('infoVertices');
  var ctrlLineWidth = document.getElementById('ctrlLineWidth');
  var ctrlClearCanvas = document.getElementById('ctrlClearCanvas');

  function getTotalVertices() {
    var total = 0;
    for (var i = 0; i < vertices.length; i += 1) {
      total += vertices[i].length;
    }
    return total;
  }

  function updateVertices(point) {
    var total = getTotalVertices();
    if (total === MAX_POINTS) {
      vertices = [];
    }
    lastArrayVertex.push(point);
    infoVertices.value = total + ' out of ' + MAX_POINTS;
  }

  // init
  gl = WebGLUtils.setupWebGL(canvas);

  if (!gl) {
    alert('WebGL is not available');
    return;
  }

  ctrlLineWidth.addEventListener('change', function (event) {
    var width = parseInt(event.target.value, 10);
    gl.lineWidth(width);
  });

  ctrlClearCanvas.addEventListener('click', function (event) {
    gl.clear(gl.COLOR_BUFFER_BIT);
    vertices = [];
  });

  canvas.addEventListener('mousedown', function (event) {
    var glCoords = convertCoords(event.layerX, event.layerY, canvas);
    infoLayerPosition.value = printCoords(event.layerX, event.layerY);
    infoIsMouseDown.value = 'DOWN';
    PRESSED = true;
    vertices.push(lastArrayVertex);
    infoNormalizedPosition.value = printCoords(glCoords.x, glCoords.y);
  });

  canvas.addEventListener('mouseup', function (event) {
    var glCoords = convertCoords(event.layerX, event.layerY, canvas);
    infoNormalizedPosition.value = printCoords(glCoords.x, glCoords.y);
    infoLayerPosition.value = printCoords(event.layerX, event.layerY);
    infoIsMouseDown.value = '';
    lastArrayVertex = [];
    PRESSED = false;
  });

  canvas.addEventListener('mousemove', function (event) {
    var glCoords = convertCoords(event.layerX, event.layerY, canvas);
    var currentPoint = vec2(glCoords.x, glCoords.y);
    infoLayerPosition.value = printCoords(event.layerX, event.layerY);
    infoNormalizedPosition.value = printCoords(glCoords.x, glCoords.y);
    if (PRESSED) {
      console.log(LAST_VERTEX[0], glCoords.x);
      if (Math.abs(LAST_VERTEX[0] - glCoords.x) > TOLERANCE) {
        updateVertices(currentPoint);
        LAST_VERTEX = currentPoint;
        render();
      }
    }
  });

  // configure webgl
  gl.viewport(0, 0, canvas.width, canvas.height);
  gl.clearColor(1.0, 1.0, 1.0, 1.0);
  gl.lineWidth(1);

  // load shaders
  var program = initShaders(gl, 'vertex-shader', 'fragment-shader');

  gl.useProgram(program);

  // load data into the GPU
  var bufferId = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, bufferId);
  gl.bufferData(gl.ARRAY_BUFFER, 8 * MAX_POINTS, gl.STATIC_DRAW);
  var vPos = gl.getAttribLocation(program, "vPosition");
  gl.vertexAttribPointer(vPos, 2, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(vPos);

  var cBufferId = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, cBufferId);
  gl.bufferData(gl.ARRAY_BUFFER, 16 * MAX_POINTS, gl.STATIC_DRAW);
  var vColor = gl.getAttribLocation(program, "vColor");
  gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(vColor);

  function render() {
    var currentPoints, color = vec4(1.0, 0.0, 0.0, 1.0);

    gl.bindBuffer(gl.ARRAY_BUFFER, cBufferId);
    gl.bufferSubData(gl.ARRAY_BUFFER, 16*getTotalVertices(), flatten(color));

    gl.bindBuffer(gl.ARRAY_BUFFER, bufferId);

    for (var i = 0; i < vertices.length; i += 1) {
      currentPoints = vertices[i];
      gl.bufferSubData(gl.ARRAY_BUFFER, 0, flatten(currentPoints));
      if (currentPoints.length == 1) {
        gl.drawArrays(gl.POINTS, 0, currentPoints.length);
      } else {
        gl.drawArrays(gl.LINE_STRIP, 0, currentPoints.length);
      }
    }

  }

  render();

};

