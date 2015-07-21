var
  gl,
  MAX_POINTS = 16,
  pointArray = [],
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

  // bind UI
  var infoLayerPosition = document.getElementById('layerPosition');
  var infoIsMouseDown = document.getElementById('isMouseDown');
  var infoNormalizedPosition = document.getElementById('normalizedPosition');
  var infoVertices = document.getElementById('infoVertices');

  function updateVertices(point) {
    if (vertices.length === MAX_POINTS) {
      vertices = [];
    }
    vertices.push(point);
    infoVertices.value = vertices.length;
  }

  // init
  var canvas = document.getElementById('gl-canvas');
  gl = WebGLUtils.setupWebGL(canvas);

  if (!gl) {
    alert('WebGL is not available');
    return;
  }

  canvas.addEventListener('mousedown', function (event) {
    var glCoords = convertCoords(event.layerX, event.layerY, canvas);
    infoLayerPosition.value = printCoords(event.layerX, event.layerY);
    infoIsMouseDown.value = 'DOWN';
    infoNormalizedPosition.value = printCoords(glCoords.x, glCoords.y);
  });

  canvas.addEventListener('mouseup', function (event) {
    var glCoords = convertCoords(event.layerX, event.layerY, canvas);
    infoLayerPosition.value = printCoords(event.layerX, event.layerY);
    infoIsMouseDown.value = '';
    infoNormalizedPosition.value = printCoords(glCoords.x, glCoords.y);
    updateVertices(vec2(glCoords.x, glCoords.y));
    render();
  });

  canvas.addEventListener('mousemove', function (event) {
    var glCoords = convertCoords(event.layerX, event.layerY, canvas);
    infoLayerPosition.value = printCoords(event.layerX, event.layerY);
    infoNormalizedPosition.value = printCoords(glCoords.x, glCoords.y);
  });

  // configure webgl
  gl.viewport(0, 0, canvas.width, canvas.height);
  gl.clearColor(1.0, 1.0, 1.0, 1.0);

  // load shaders
  var program = initShaders(gl, 'vertex-shader', 'fragment-shader');

  gl.useProgram(program);

  // load data into the GPU
  var bufferId = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, bufferId);

  // associate out shader variables with our data buffer
  var vPosition = gl.getAttribLocation(program, 'vPosition');
  gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(vPosition);
  gl.bufferData(gl.ARRAY_BUFFER, 8 * MAX_POINTS, gl.STATIC_DRAW);

  render();

};

function render() {
  var point;

  pointArray = vertices;

  gl.bufferSubData(gl.ARRAY_BUFFER, 0, flatten(pointArray));
  gl.clear(gl.COLOR_BUFFER_BIT);

  if (vertices.length == 1) {
    gl.drawArrays(gl.POINTS, 0, vertices.length);
  } else {
    gl.drawArrays(gl.LINE_STRIP, 0, vertices.length);
  }

}