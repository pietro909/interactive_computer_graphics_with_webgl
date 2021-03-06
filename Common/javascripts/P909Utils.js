var P909Utils = (function () {
  'use strict';

  return {
    rotatePoint : function (vector, _angle, twist) {
      var
        a = vector[0], b = vector[1],
        TWIST = twist ? true : false,
        distance = TWIST ? Math.sqrt(Math.pow(a, 2) + Math.pow(b, 2)) : 1,
        angle = _angle * distance,
        a1 = a * Math.cos(angle) - b * Math.sin(angle),
        b1 = a * Math.sin(angle) + b * Math.cos(angle);

      return (vec2(a1, b1));
    },
    makePolygon : function (radius, side) {
      var
        s, tri, _lastPoint,
        lastPoint = vec2(0, radius),
        rotationDeg = 360 / side,
        rotation = rotationDeg * (Math.PI / 180),
        center = vec2(0, 0),
        vertices = [];

      if (side > 3) {
          for (s = 0; s < side; s += 1) {
              vertices.push(center);
/*	      
              tri = 2;
              while (tri--) {
		  _lastPoint = this.rotatePoint(lastPoint, rotation, false);
		  vertices.push(_lastPoint);
		  lastPoint = _lastPoint;
              }
*/
	      
	      vertices.push(lastPoint);
	      _lastPoint = this.rotatePoint(lastPoint, rotation, false);
	      vertices.push(_lastPoint);
	      lastPoint = _lastPoint;
	      console.log('vertices -> '+vertices.length);
        }
      } else {
        for (s = 0; s < side; s += 1) {
          _lastPoint = this.rotatePoint(lastPoint, rotation, false);
          vertices.push(_lastPoint);
          lastPoint = _lastPoint;
        }
      }
      //return vertices;
      return(
        new P909Utils.VertexObject(
          //[vec2(-0.5, -0.5), vec2(0.5, -0.5), vec2(0, 0.5)],
          vertices,
          1,
          colors
          vec4(1.0, 1.0, 0.0, 1.0)
        )
      );
    },
    VertexObject: function (points, width, color, shape) {
      this.points = [];
      for (var p = 0; p < points.length; p += 1) {
        this.points.push(points[p]);
      }
      this.width = (width !== undefined) ? width : 1;
      this.color = (color !== undefined) ? color : vec4(1.0, 0.0, 0.0, 1.0);
      this.shape = (shape !== undefined) ? shape : 'points'
    },
      tessellatePolygon: function(vertices, subdivisionLevel) {
	  var  result, tessellatedVertices = [];
	  console.log('tessellating vertices ' + vertices.length);
	  for (var v = 0; v < vertices.length; v += 3) {
	      result = this.divideTriangle(
		  vertices[v],vertices[v+1],vertices[v+2],subdivisionLevel);
		  console.log('result: ',result);
	      tessellatedVertices = tessellatedVertices.concat(result);
	      
	  }

	  return tessellatedVertices;
      }
      ,
      divideTriangle: function(a, b, c, count, _accumulator) {
	  console.log(' _acc is ', _accumulator);
          var triangles,midAB, midBC, midCA, accumulator = _accumulator || []; 
	  //console.log('divide '+count);
	  //console.log('  accumulator is ', accumulator);
        // if end of subds, do the last triangle
          if (count === 0) {
	      // doTriangle(a, b, c);
	      return(accumulator.concat([a,b,c]));
        } else {
            count -= 1;
            // divide triangle
            midAB = mix(a, b, 0.5);
            midBC = mix(b, c, 0.5);
            midCA = mix(c, a, 0.5);
            // take just the three outer triangles
	    var currentTriangle;
	    triangles = [
		[a,midAB,midCA],
		[c, midCA, midBC, count],
		[b, midBC, midAB, count]
	    ];
	    while (triangles.length > 0) {
		currentTriangle = triangles.pop();
		accumulator = this.divideTriangle(currentTriangle[0],currentTriangle[1],currentTriangle[2], count, accumulator);
	    }
	    return accumulator;
        }
    },
    drawBuffer: function (gl, currentShape, start, end) {
      //console.log('drawBuffer: ', gl, currentShape, start, end);
      switch (currentShape) {
        case 'POINTS' :
          gl.drawArrays(gl.POINTS, start, end);
          break;
        case 'LINES' :
          gl.drawArrays(gl.LINES, start, end);
          break;
        case 'LINE_STRIP' :
          gl.drawArrays(gl.LINE_STRIP, start, end);
          break;
        case 'LINE_LOOP' :
          gl.drawArrays(gl.LINE_LOOP, start, end);
          break;
        case 'TRIANGLES':
          gl.drawArrays(gl.TRIANGLES, start, end);
          break;
        case 'TRIANGLE_FAN':
          gl.drawArrays(gl.TRIANGLE_FAN, start, end);
          break;
        case 'TRIANGLE_LOOP':
          gl.drawArrays(gl.TRIANGLE_LOOP, start, end);
          break;
        default :
          console.error('default!');
          gl.drawArrays(gl.POINTS, start, end);
      }
    },

    printVec2: function (vec) {
      return vec[0] + ',' + vec[1];
    },

    printCoords: function (x, y) {
      return x + ',' + y;
    },

    /**
     * Flatten arrays and count elements
     * @param array {Array} of VertexObject
     * @returns {number} the number of items
     */
    countElements: function (array) {
      var total = 0;
      for (var i = 0; i < array.length; i += 1) {
        if (array[i].points !== undefined) {
          total += array[i].points.length;
        } else {
          total += array[i].length;
        }
      }
      return total;
    },

    /**
     * Automagically convert coordinates from DOM to WebGL context.
     * @param mouseX {number} the mouse X coordinate
     * @param mouseY {number} the mouse Y coordinate
     * @param canvas {HTMLElement} the canvas being used
     * @returns {{x: number, y: number}}
     */
    convertCoords: function (mouseX, mouseY, canvas) {
      return {
        x: Math.floor(((mouseX / canvas.width * 2) - 1) * 1000) / 1000,
        y: Math.floor((((canvas.height - mouseY) / canvas.height * 2) - 1) * 1000) / 1000
      };
    }
  };

})();
