var gl;
var points;

var
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
  vertices = [
    vec2(-FACTOR, -FACTOR),
    vec2(0, FACTOR),
    //vec2(-FACTOR, FACTOR),
    //vec2(-FACTOR, FACTOR),
    vec2(FACTOR, -FACTOR)
  ];

window.onload = function () {

  // bind UI
  var subdBtn = document.getElementById('subdivisionLevel');
  subdBtn.addEventListener('input', function (evt) {
    subdivisionLevel = parseInt(this.value, 10);
    if (subdivisionLevel > (MAX_SUBDIVISION - 3)) {
      console.log('oob: ' + subdivisionLevel)
      this.value = 0;
      subdivisionLevel = 0;
    }
    //console.log('subdivisionLevel: ' + subdivisionLevel);
    render();
  });

  var angleBtn = document.getElementById('thetaAngle');
  angleBtn.addEventListener('input', function (evt) {
    angle = parseInt(this.value, 10) * (Math.PI / 180);
    //console.log('angle: ' + angle);
    render();
  });


  // init
  var canvas = document.getElementById('gl-canvas');
  gl = WebGLUtils.setupWebGL(canvas);

  if (!gl) {
    alert('WebGL is not available');
    return;
  }

  infos.rotation = document.getElementById('infoRotation');
  infos.subds = document.getElementById('infoSubdivisions');
  infos.triangles = document.getElementById('infoTriangles');
  infos.vertices = document.getElementById('infoVertices');

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
  pointArray = [];
  divideTriangle(vertices[0], vertices[1], vertices[2], subdivisionLevel);

  var point;
  console.log('draw ' + subdivisionLevel);
  for (var i = 0; i < pointArray.length; i += 1) {
    point = pointArray[i];
    pointArray[i] = rotatePoint(point, angle);
  }

  gl.bufferSubData(gl.ARRAY_BUFFER, 0, flatten(pointArray));
  gl.clear(gl.COLOR_BUFFER_BIT);
  gl.drawArrays(gl.TRIANGLES, 0, pointArray.length);

  infos.rotation.value = Math.floor(angle / (Math.PI / 180));
  infos.subds.value = subdivisionLevel;
  infos.triangles.value = pointArray.length / 3;
  infos.vertices.value = pointArray.length;

  pointArray = [];

}

function rotatePoint(vector, _angle) {
  var
    a = vector[0], b = vector[1],
    distance = Math.sqrt(Math.pow(a, 2) + Math.pow(b, 2)),
    angle = _angle * distance,
  /*
   x′=xcosθ−ysinθ

   y′=xsinθ+ycosθ
   */
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
    pointArray.push(a, b, c);
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
    divideTriangle(midAB, midBC, midCA, count);
  }
}