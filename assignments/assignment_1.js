var
  gl,
  STYLE = 'TRIANGLES',
  SIDES = 3, RADIUS = 1,
  IS_FULL_TRIANGLE = true,
  MAX_SUBDIVISION = 10,
  pointArray = [],
  subdivisionLevel = 0,
  angle = 0,
  infos = {
    subds    : 0,
    rotation : 0,
    triangles: 1,
    vertices : 3
  },
// initial polygon (triangle)
vertices = [],
colors = [];

window.onload = function () {

  // bind UI
  var subdBtn = document.getElementById('subdivisionLevel');
    subdBtn.addEventListener('input', function (evt) {
	var tessellatedVertices;
    subdivisionLevel = parseInt(evt.target.value, 10);
    if (subdivisionLevel > (MAX_SUBDIVISION - 3)) {
      console.warn('out of bound: ' + subdivisionLevel);
      evt.target.value = 0;
	subdivisionLevel = 0;
	
    }
	console.log(' current vertices: ' + vertices.points.length);
	tessellatedVertices = P909Utils.tessellatePolygon(vertices.points, subdivisionLevel);
	vertices.points = tessellatedVertices;
    render([vertices]);
  });

  var angleBtn = document.getElementById('thetaAngle');
  angleBtn.addEventListener('input', function (evt) {
    angle = parseInt(evt.target.value, 10) * (Math.PI / 180);
    render([vertices]);
  });

  var showAsSierpinski = document.getElementById('showAsSierpinski');
  showAsSierpinski.addEventListener('change', function (evt) {
    IS_FULL_TRIANGLE = !evt.target.checked;
    render([vertices]);
  });

  var renderType = document.getElementById('renderType');
  renderType.addEventListener('change', function (evt) {
    STYLE = evt.target.value;
    render([vertices]);
  });

  var geometryControls = document.getElementById('sides');
  geometryControls.addEventListener('input', function (evt) {
    var sides = parseInt(evt.target.value, 10);
    if (sides > 2 && sides < 11) {
      SIDES = sides;
      vertices = P909Utils.makePolygon(RADIUS, SIDES);
      render([vertices]);
    } else {
      evt.target.value = 3;
    }
  });

  var sizeControls = document.getElementById('radius');
  sizeControls.addEventListener('input', function (evt) {
    var radius = parseFloat(evt.target.value, 10);
    //console.log('radius '+radius);
    if (radius > 0 && radius <= 1) {
      RADIUS = radius;
	vertices = P909Utils.makePolygon(RADIUS, SIDES);
        render([vertices]);
    } else {
      evt.target.value = 1;
    }
  });

  infos.rotation = document.getElementById('infoRotation');
  infos.subds = document.getElementById('infoSubdivisions');
  infos.triangles = document.getElementById('infoTriangles');
  infos.vertices = document.getElementById('infoVertices');


  // init
  var canvas = document.getElementById('gl-canvas');
  gl = WebGLUtils.setupWebGL(canvas);

  if (!gl) {
    alert('WebGL is not available');
    return;
  }

  // configure webgl
  gl.viewport(0, 0, canvas.width, canvas.height);
  gl.clearColor(1.0, 1.0, 1.0, 1.0);

  // load shaders
  var program = initShaders(gl, 'vertex-shader', 'fragment-shader');

  gl.useProgram(program);

  // load data into the GPU
  var bufferId = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, bufferId);

  var cbufferId = gl.createBuffer();
  var vColor = gl.getAttribLocation( program, "vColor" );

  // associate out shader variables with our data buffer
  var vPosition = gl.getAttribLocation(program, 'vPosition');
  gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(vPosition);
  gl.bufferData(gl.ARRAY_BUFFER, 8 * Math.pow(3, MAX_SUBDIVISION + 1), gl.STATIC_DRAW);

  vertices = P909Utils.makePolygon(RADIUS, SIDES);

  render([vertices]);

    function render(_arrayOfVertex, options) {
        var currentPoints, actualPoints, start = 0, colors = [],
            arrayOfVertex = (Array.isArray(_arrayOfVertex)) ? _arrayOfVertex : [_arrayOfVertex];
            var currentArray = arrayOfVertex[0];
            var myVertices = currentArray.points;
 
        for (var p = 0; p < currentArray.points.length; p += 1) {
            colors = colors.concat([Math.random(),Math.random(),Math.random()]);
        }

    /* === update buffers with new data for color and geometry === */
    gl.bindBuffer( gl.ARRAY_BUFFER, bufferId);
    gl.bufferData( gl.ARRAY_BUFFER, flatten(myVertices), gl.STATIC_DRAW );

    gl.vertexAttribPointer( vPosition, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );

    gl.bindBuffer( gl.ARRAY_BUFFER, cbufferId );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW );

    gl.vertexAttribPointer( vColor, 3, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vColor );
        
//  pointArray = [];
	//divideTriangle(myVertices[0], myVertices[1], myVertices[2], subdivisionLevel);
/*
  for (var v = 3; v < myVertices.length; v += 1) {
    divideTriangle(myVertices[v - 2], myVertices[v - 1], myVertices[v], subdivisionLevel);
  }

  for (var i = 0; i < pointArray.length; i += 1) {
    point = pointArray[i];
    pointArray[i] = rotatePoint(point, angle, true);
  }
*/

        gl.clear(gl.COLOR_BUFFER_BIT);

	console.log('myVertices: '+myVertices.length);
	var p;
        for (var i = 0; i < myVertices.length; i += 3) {	 
	    //            currentPoints = myVertices[i];
	    start = i;
	    console.log('index is '+i+' < '+myVertices.length);
	    console.log('will draw: ');
	    console.log('   at '+myVertices[i][0]+' '+myVertices[i][1]);
	    console.log('   at '+myVertices[i+1][0]+' '+myVertices[i+1][1]);
	    console.log('   at '+myVertices[i+2][0]+' '+myVertices[i+2][1]);
	    
            P909Utils.drawBuffer(gl, STYLE, start, 3);
         }

  infos.rotation.value = Math.floor(angle / (Math.PI / 180));
  infos.subds.value = subdivisionLevel;
  infos.triangles.value = pointArray.length / 3;
  infos.vertices.value = pointArray.length;

}

};


    
