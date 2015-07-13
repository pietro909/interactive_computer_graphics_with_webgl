var gl;
var points;

var
    pointArray = [],
    subdivisions = 5;

window.onload = function () {

    var canvas = document.getElementById('gl-canvas');
    gl = WebGLUtils.setupWebGL(canvas);

    if (!gl)
        alert('WebGL is not available');

    var
        vertices = [
            vec3(0.0000, 0.0000, -1.0000),
            vec3(0.0000, 0.9428, 0.3333),
            vec3(-0.8165, -0.4714, 0.3333),
            vec3(0.8165, -0.4714, 0.3333)
        ];

    function doTriangle(a, b, c) {
        pointArray.push(a, b, c);
    }

    function divideTriangle(a, b, c, count) {
        var midAB, midBC, midCA;
        // if end of subds, do the last triangle
        if (count === 0) {
            doTriangle(a, b, c);
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
        }
    }

    for (var i = 0; i < vertices.length) {
        divideTriangle(startingTriangleVerts[0], startingTriangleVerts[1], startingTriangleVerts[2], subdivisions);
    }


    var vertices = new Float32Array(pointArray);

    // configure webgl
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(1.0, 1.0, 1.0, 1.0);
    gl.enable(gl.DEPTH_TEST);

    // load shaders
    var program = initShaders(gl, 'vertex-shader', 'fragment-shader');

    gl.useProgram(program);

    // load data into the GPU
    var bufferId = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, bufferId);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(pointArray), gl.STATIC_DRAW);

    // associate out shader variables with our data buffer
    var vPosition = gl.getAttribLocation(program, 'vPosition');
    gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

    render();

};

function render() {

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLES, 0, pointArray.length);

}