var
  gl, CURRENT_SHAPE = 'triangles', LAST_VERTEX = vec2(0, 0), PRESSED = false, CURRENT_WIDTH = 1,
  CURRENT_COLOR = 0x000000ff,
  CURRENT_INDEX = 0,
  TOLERANCE = 0.005,
  MAX_POINTS = 1024,
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
    ctrlColor             : document.getElementById('ctrlColor')
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
  gl.bindBuffer(gl.ARRAY_BUFFER, cBufferId);
  gl.bufferData(gl.ARRAY_BUFFER, SIZE_OF_FLOAT * 4 * MAX_POINTS, gl.STATIC_DRAW);

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
  var vColor = gl.getAttribLocation(program, 'vColor');
  gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(vColor);

  uiElements.ctrlColor.addEventListener('change', function (event) {
    CURRENT_COLOR = event.target.value;
    render(vertices);
  });

  function render(arrayOfVertex, options) {
    var currentPoints, actualPoints, start = 0, colors = [];
    console.log(CURRENT_SHAPE);

    gl.clear(gl.COLOR_BUFFER_BIT);

    for (var i = 0; i < vertices.length; i += 1) {
      currentPoints = vertices[i];
      colors = [];

      for (var c = 0; c < currentPoints.points.length; c += 1) {
        colors.push(vec4(Math.random(), Math.random(), Math.random(), 1.0));
      }

      gl.lineWidth(currentPoints.width);

      gl.bindBuffer( gl.ARRAY_BUFFER, bufferId );
      gl.bufferSubData( gl.ARRAY_BUFFER, 0, flatten(currentPoints.points));

      gl.bindBuffer( gl.ARRAY_BUFFER, cBufferId );
      gl.bufferSubData( gl.ARRAY_BUFFER, 0, flatten(colors));

      P909Utils.drawBuffer(gl, CURRENT_SHAPE, start, 3);
    }

  }

  //vertices = P909Utils.makePolygon(1, 3);
  vertices = [
    new P909Utils.VertexObject(
      [vec2(-0.5, -0.5), vec2(0.5, -0.5), vec2(0, 0.5)],
      1,
      vec4(1.0, 1.0, 0.0, 1.0)
    )
  ];

  render(vertices);

};