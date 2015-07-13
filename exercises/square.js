var gl;
var points;

var
    pointArray = [];

window.onload = function () {

    var canvas = document.getElementById('gl-canvas');
    gl = WebGLUtils.setupWebGL(canvas);

    if (!gl)
        alert('WebGL is not available');

    pointArray = [
        -0.5, -0.5,
        -0.5, 0.5,
        0.5, -0.5,
        0.5, 0.5];
    var vertices = new Float32Array(pointArray);

    // configure webgl
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(1.0, 1.0, 1.0, 1.0);

    // load shaders
    var program = initShaders(gl, 'vertex-shader', 'fragment-shader');

    gl.useProgram(program);

    // load data into the GPU
    var bufferId = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, bufferId);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    // associate out shader variables with our data buffer
    var vPosition = gl.getAttribLocation(program, 'vPosition');
    gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

    render();

};

function render() {

    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

}