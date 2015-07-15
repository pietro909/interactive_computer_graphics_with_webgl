var
  gl,
  STYLE = '',
  IS_FULL_TRIANGLE = true,
  MAX_SUBDIVISION = 10,
  pointArray = [],
  subdivisionLevel = 0,
  angle = 0,
  FACTOR = 0.5,
  infos = {
    subds    : 0,
    rotation : 0,
    triangles: 1,
    vertices : 3
  },
// initial polygon (triangle)
  vertices = [/*
   vec2(-FACTOR, -FACTOR),
   vec2(0, FACTOR),
   //vec2(-FACTOR, FACTOR),
   //vec2(-FACTOR, FACTOR),
   vec2(FACTOR, -FACTOR)
   */];

function makePolygon(radius, side) {
  var
    _lastPoint,
    lastPoint = vec2(0, radius),
    rotationDeg = 360 / side,
    rotation = rotationDeg * (Math.PI / 180);

  vertices = [
    vec2(0,0)
  ];

  console.log('angle -> ' + rotationDeg);

  //vertices.push(firstPoint);

  for (var s = 1; s <= side; s += 1) {
    _lastPoint = rotatePoint(lastPoint, rotation);
    vertices.push(_lastPoint);
    lastPoint = _lastPoint;
  }
}

makePolygon(1, 3);

/**
 * r2 = x2 + y2
 */

window.onload = function () {

  // bind UI
  var subdBtn = document.getElementById('subdivisionLevel');
  subdBtn.addEventListener('input', function (evt) {
    subdivisionLevel = parseInt(this.value, 10);
    if (subdivisionLevel > (MAX_SUBDIVISION - 3)) {
      console.warn('out of bound: ' + subdivisionLevel);
      this.value = 0;
      subdivisionLevel = 0;
    }
    render();
  });

  var angleBtn = document.getElementById('thetaAngle');
  angleBtn.addEventListener('input', function (evt) {
    angle = parseInt(this.value, 10) * (Math.PI / 180);
    render();
  });

  var showAsSierpinski = document.getElementById('showAsSierpinski');
  showAsSierpinski.addEventListener('change', function (evt) {
    IS_FULL_TRIANGLE = !this.checked;
    render();
  });

  var renderType = document.getElementById('renderType');
  renderType.addEventListener('input', function (evt) {
    STYLE = this.value;
    render();
  });

  var geometryControls = document.getElementById('sides');
  geometryControls.addEventListener('input', function (evt) {
    makePolygon(1, parseInt(this.value, 10));
    render();
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

  // associate out shader variables with our data buffer
  var vPosition = gl.getAttribLocation(program, 'vPosition');
  gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(vPosition);
  gl.bufferData(gl.ARRAY_BUFFER, 8 * Math.pow(3, MAX_SUBDIVISION + 1), gl.STATIC_DRAW);

  render();

};

function render() {
  var point;

  pointArray = [];
  divideTriangle(vertices[0], vertices[1], vertices[2], subdivisionLevel);
  for (var v = 3; v < vertices.length; v += 1) {
    divideTriangle(vertices[v - 2], vertices[v - 1], vertices[v], subdivisionLevel);
  }

  for (var i = 0; i < pointArray.length; i += 1) {
    point = pointArray[i];
    pointArray[i] = rotatePoint(point, angle);
  }

  gl.bufferSubData(gl.ARRAY_BUFFER, 0, flatten(pointArray));
  gl.clear(gl.COLOR_BUFFER_BIT);

  switch (STYLE) {
    case 'POINTS':
      gl.drawArrays(gl.POINTS, 0, pointArray.length);
      break;
    case 'WIREFRAME':
      for (var k = 0; k < pointArray.length; k += 3) {
        gl.drawArrays(gl.LINE_LOOP, k, 3);
      }
      break;
    default :
      gl.drawArrays(gl.TRIANGLE_FAN, 0, pointArray.length);
      break;
  }

  infos.rotation.value = Math.floor(angle / (Math.PI / 180));
  infos.subds.value = subdivisionLevel;
  infos.triangles.value = pointArray.length / 3;
  infos.vertices.value = pointArray.length;

  //pointArray = [];

}

function rotatePoint(vector, _angle) {
  var
    a = vector[0], b = vector[1],
    distance = Math.sqrt(Math.pow(a, 2) + Math.pow(b, 2)),
    angle = _angle * distance,
    a1 = a * Math.cos(angle) - b * Math.sin(angle),
    b1 = a * Math.sin(angle) + b * Math.cos(angle);
  return (vec2(a1, b1));
}

function divideTriangle(a, b, c, count) {
  var midAB, midBC, midCA;
  // if end of subds, do the last triangle
  if (count < 0) {
    console.error('cannot recurse < 0');
    return;
  }
  if (count === 0) {
    if (a !== undefined && b !== undefined && c !== undefined) {
      pointArray.push(a, b, c);
    } else {
      console.error('undefined point ', a, b, c);
    }
  } else {
    count -= 1;
    // divide triangle
    midAB = mix(a, b, 0.5);
    midBC = mix(b, c, 0.5);
    midCA = mix(c, a, 0.5);
    // take just the three outer triangles
    divideTriangle(a, midAB, midCA, count);
    divideTriangle(c, midCA, midBC, count);
    divideTriangle(b, midBC, midAB, count);
    if (IS_FULL_TRIANGLE) {
      divideTriangle(midAB, midBC, midCA, count);
    }
  }
}