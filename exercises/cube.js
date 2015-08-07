console.log('geometries');

function loadGL() {
  var program, vBuffer, cBuffer, vColor, vPosition,
      geometries = [],
      RADIUS = 1, SIDES = 4,
      canvas = document.getElementById('glCanvas'),
      gl = WebGLUtils.setupWebGL(canvas);


  if (!gl)
  {
    alert('WebGL not supported, please check for it on http://get.webgl.org');
  }

  gl.viewport(0,0,canvas.width, canvas.height);
  gl.clearColor(1.0, 1.0, 1.0, 1.0);

  console.log('geometries 2');

  program = initShaders(gl, 'vShader_cube.glsl', 'fShader_cube.glsl');
  gl.useProgram(program);

  /******** init buffers here ********/
  vBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);

  cBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);

  vColor = gl.getAttribLocation( program, 'vColor' );
  vPosition = gl.getAttribLocation(program, 'vPosition');

  gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(vPosition);

  gl.vertexAttribPointer( vColor, 3, gl.FLOAT, false, 0, 0 );
  gl.enableVertexAttribArray( vColor );

  /******** end of buffers management ********/

  function pRender(arrayOfVertex, options) {
    var currentArray, myVertices, myColors = [];

    gl.clear(gl.COLOR_BUFFER_BIT);

    for (var i = 0; i < arrayOfVertex.length; i += 1) {
      currentArray = arrayOfVertex[i];
      myVertices = currentArray.points;

      for (var p = 0; p < currentArray.points.length; p += 1) {
        myColors = myColors.concat([Math.random(),Math.random(),Math.random()]);
      }

      /* === update buffers with new data for color and geometry === */
      gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer);
      gl.bufferData( gl.ARRAY_BUFFER, flatten(myVertices), gl.STATIC_DRAW );

      gl.vertexAttribPointer( vPosition, 2, gl.FLOAT, false, 0, 0 );
      gl.enableVertexAttribArray( vPosition );

      gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer );
      gl.bufferData( gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW );

      gl.vertexAttribPointer( vColor, 3, gl.FLOAT, false, 0, 0 );
      gl.enableVertexAttribArray( vColor );

      for (var k = 0; k < myVertices.length; k += 3) {	 	    
        P909Utils.drawBuffer(gl, STYLE, start, 3);
      }

    }

  }

  console.log('geometries');
  geometries.push(P909Utils.makePolygon(RADIUS, SIDES));

  pRender(gl, geometries);

}

