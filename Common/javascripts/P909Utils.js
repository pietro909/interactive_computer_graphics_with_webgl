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
        for (s = 0; s < side - 1; s += 1) {
          vertices.push(center);
          tri = 2;
          while (tri--) {
            _lastPoint = this.rotatePoint(lastPoint, rotation, false);
            vertices.push(_lastPoint);
            lastPoint = _lastPoint;
          }
        }
      } else {
        for (s = 0; s < side; s += 1) {
          _lastPoint = this.rotatePoint(lastPoint, rotation, false);
          vertices.push(_lastPoint);
          lastPoint = _lastPoint;
        }
      }
      return vertices;
    },
    VertexObject: function (points, width, color) {
      this.points = [];
      for (var p = 0; p < points.length; p += 1) {
        this.points.push(points[p]);
      }
      this.width = (width !== undefined) ? width : 1;
      this.color = (color !== undefined) ? color : vec4(1.0, 0.0, 0.0, 1.0);
    },

    drawBuffer: function (gl, currentShape, start, end) {
      //console.log('drawBuffer: ', gl, currentShape, start, end);
      switch (CURRENT_SHAPE) {
        case 'lines' :
          gl.drawArrays(gl.LINES, start, end);
          break;
        case 'line_strip' :
          gl.drawArrays(gl.LINE_STRIP, start, end);
          break;
        case 'line_loop' :
          gl.drawArrays(gl.LINE_LOOP, start, end);
          break;
        case 'triangles':
          gl.drawArrays(gl.TRIANGLES, start, end);
          break;
        case 'triangle_fan':
          gl.drawArrays(gl.TRIANGLE_FAN, start, end);
          break;
        case 'triangle_loop':
          gl.drawArrays(gl.TRIANGLE_LOOP, start, end);
          break;
        default :
          console.error('default!!!');
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