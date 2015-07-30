var
  gl, CURRENT_SHAPE = 'TRIANGLES', LAST_VERTEX = vec2(0, 0), PRESSED = false, CURRENT_WIDTH = 1,
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

  // configure webgl
  gl.viewport(0, 0, uiElements.canvas.width, uiElements.canvas.height);
  gl.clearColor(1.0, 1.0, 1.0, 1.0);
  gl.lineWidth(1);

  // load shaders
  var program = initShaders(gl, 'vertex-shader', 'fragment-shader');

  gl.useProgram(program);

  uiElements.ctrlColor.addEventListener('change', function (event) {
    CURRENT_COLOR = event.target.value;
    render(vertices);
  });

  var bufferId = gl.createBuffer();
  var vPosition = gl.getAttribLocation( program, "vPosition" );
  var cbufferId = gl.createBuffer();
  var vColor = gl.getAttribLocation( program, "vColor" );

  function render(arrayOfVertex, options) {
    var currentPoints, actualPoints, start = 0, colors = [];

    //var vertices =  arrayOfVertex[0].points; //[-1, -1, 0, 1, 1, -1];
    var colors = [1, 0, 0, 0, 1, 0, 0, 0, 1];

    // Load the data into the GPU

    // Associate out shader variables with our data buffer

    gl.vertexAttribPointer( vPosition, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );

    gl.vertexAttribPointer( vColor, 3, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vColor );

    console.log(CURRENT_SHAPE);

    gl.clear(gl.COLOR_BUFFER_BIT);

    for (var i = 0; i < vertices.length; i += 1) {
      currentPoints = vertices[i];
      colors = [];
      vertices = currentPoints;

      gl.bindBuffer( gl.ARRAY_BUFFER, bufferId );
      gl.bufferData( gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW );

      gl.bindBuffer( gl.ARRAY_BUFFER, cbufferId );
      gl.bufferData( gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW );

      if (currentPoints.points !== undefined) {
        for (var c = 0; c < currentPoints.points.length; c += 1) {
          colors.push(vec4(Math.random(), Math.random(), Math.random(), 1.0));
        }
        gl.lineWidth(currentPoints.width);
      }

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
