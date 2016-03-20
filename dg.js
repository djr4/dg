/* 
	dynamic geometry v1.0.2 (dg.js)
	Djordje Rakonjac
		rakonjac.djordje@gmail.com
	Mentor: Filip Maric
		filip@matf.bg.ac.rs
	Faculty of Mathematics, University of Belgrade, December, 2015
*/

!function() {
 
	var dg = {
		version: "1.0.2"
	};
	
	var dg_document = this.document;
	var dg_canvas_context;
	var dg_canvas_width, dg_canvas_height;
	var dg_canvas_element;

        var POINT = 1;
        var VECTOR = 2;
        var MIDPOINT = 3;
        var LINE = 4;
        var SEGMENT = 5;
        var PERPENDICULAR = 6;
        var PERPENDICULAR_BISECTOR = 7;
        var ANGLE_BISECTOR = 8;
        var PARALLEL = 9;
        var CIRCLE = 10;
        var TANGENT = 11;
        var POLYGON = 12;
        var FUNCTION = 13;
        var INTERSECTION = 14;
        var ANGLE = 15;
        var MAP_POINT = 16;
        var MAP_POINTS = 17;
        var TRANSLATE_POINT = 18;
	
	function dg_abs(x) {
		return x >= 0 ? x : -x;
	}
	function dg_max(d) {
		var max = d[0];
		for(var i = 1; i < d.length; i++)
			if(d[i] > max)
				max = d[i];
		return max;
	}
	function dg_min(d) {
		var min = d[0];
		for(var i = 1; i < d.length; i++) 
			if(d[i] < min)
				min = d[i];
		return min;
	}
	function dg_rotate(d, theta) {
		var x = d[0];
		var y = d[1];
		
		return [ x * Math.cos(theta) - y * Math.sin(theta), x * Math.sin(theta) + y * Math.cos(theta)];
	}
	function dg_square(d) {
		for(var i = 0 ; i < d.length; i++) {
			d[i] = d[i] * d[i];
		}
		return d;
	}
	function dg_centroid(d) {
		/* d - array of Points */
		var p0 = 0;
		var p1 = 0;
		for(var i = 0; i < d.length; i++) {
			p0 += d[i].x();
			p1 += d[i].y();
		}
		return new dg.geom.Point([p0 / d.length, p1 / d.length]);
	}
	dg.abs = dg_abs;
	dg.max = dg_max;
	dg.min = dg_min;
	dg.rotate = dg_rotate;
	dg.square = dg_square;
	dg.centroid = dg_centroid;
	
	function dg_intersect_circles(c0, c1) {
		/* c0, c1 - circles d < |r0 + r1| assumption for 2 point intersection */
		var r0 = c0._p0.dist(c0._p1);
		var r1 = c1._p0.dist(c1._p1);
		var d = c0._p0.dist(c1._p0);
		if(d < r0 + r1) {
			var a = (Math.pow(r0, 2) - Math.pow(r1,2) + Math.pow(d, 2)) / (2 * d);
			var h = Math.sqrt(Math.pow(r0, 2) - Math.pow(a, 2));
			
			var x2 = c0._p0.x() + a * (c1._p0.x() - c0._p0.x()) / d;
			var y2 = c0._p0.y() + a * (c1._p0.y() - c0._p0.y()) / d;
			
			var x3 = x2 + h * (c1._p0.y() - c0._p0.y()) / d;
			var x3p = x2 - h * (c1._p0.y() - c0._p0.y()) / d;
			var y3 = y2 - h * (c1._p0.x() - c0._p0.x()) / d;
			var y3p = y2 + h * (c1._p0.x() - c0._p0.x()) / d;
		}
		
		return [new dg.geom.Point([x3, y3]), new dg.geom.Point([x3p, y3p])];
	}

	/* geometry constructors */
	dg.Angle = function() {
		if(arguments.length > 2) {
			var theta = new dg.geom.Angle(arguments[0], arguments[1], arguments[2]);
		} 
		dg.geom.objects.push(theta);
		dg_repaint();
		return theta;		
	}
	dg.Point = function(d) {
		var p = new dg.geom.Point(d);
		dg.geom.objects.push(p);
		dg_repaint();
		return p;
	}
	
	dg.Midpoint = function() {
		if(arguments.length == 1) {
			var p = new dg.geom.Midpoint(arguments[0]);
		} else {
			var p = new dg.geom.Midpoint(arguments[0], arguments[1]);
		}
		dg.geom.objects.push(p);
		dg_repaint();
		return p;
	}
	
	dg.Line = function(p0, p1) {
		var l = new dg.geom.Line(p0, p1);
		dg.geom.objects.push(l);
		dg_repaint();
		return l;
	}
	
	dg.AngleBisector = function(p0, p1, p2) {
		var a = new dg.geom.AngleBisector(p0,p1,p2);
		dg.geom.objects.push(a);
		dg_repaint();
		return a;
	}
	
	dg.PerpendicularLine = function(p, l) {
		var l = new dg.geom.PerpendicularLine(p, l);
		dg.geom.objects.push(l);
		dg_repaint();
		return l;
	}
	
	dg.PerpendicularBisector = function() {
		if(arguments.length > 1) {
			var l = new dg.geom.PerpendicularBisector(arguments[0], arguments[1]);
		} else {
			var l = new dg.geom.PerpendicularBisector(arguments[0]);			
		}
		dg.geom.objects.push(l);
		dg_repaint();
		return l;
	}

	dg.ParallelLine = function(p, l) {
		var l = new dg.geom.ParallelLine(p, l);
		dg.geom.objects.push(l);
		dg_repaint();
		return l;
	}
	
	dg.Segment = function(p0, p1) {
		var s = new dg.geom.Segment(p0, p1);
		dg.geom.objects.push(s);
		dg_repaint();
		return s;
	}
	
	dg.Circle = function(p0, p1) {
		var c = new dg.geom.Circle(p0, p1);
		dg.geom.objects.push(c);
		dg_repaint();
		return c;
	}
	
	dg.Tangent = function(p, c) {
		var t = new dg.geom.Tangent(p, c);
		dg.geom.objects.push(t);
		dg_repaint();
		return t;
	}
	dg.Polygon = function() {
		if(arguments.length > 1) {
			var p = new dg.geom.Polygon(arguments[0], arguments[1]);
			dg.geom.objects.push(p);
			dg_repaint();
		} else {
			var p = new dg.geom.Polygon(arguments[0]);
			dg.geom.objects.push(p);
			dg_repaint();
		}
		return p;
	}
	dg.Function = function() { 
		if(arguments.length == 1) {
			var f = new dg.f.Function(arguments[0]);
		} else if(arguments.length == 2) {
			var f = new dg.f.Function(arguments[0], arguments[1]);
		} else
			var f = new dg.f.Function(function(x,f) { f = 0; });
		
		dg.geom.objects.push(f);
		dg_repaint();
		return f; 
	}
	
	dg.Intersect = function() {
		if(arguments.length > 2)
			var i = new dg.geom.Intersection(arguments[0], arguments[1], arguments[2]);
		else
			var i = new dg.geom.Intersection(arguments[0], arguments[1]);			
		dg.geom.objects.push(i);
		dg_repaint();
		if(i._intersections.length > 1)
			return i._intersections;
		else
			return i._intersections[0];
	}

        dg.MapPoint = function(p, f) {
	        var mp = new dg.geom.MapPoint(p, f);
		dg.geom.objects.push(mp);
		dg_repaint();
		return mp;
        }

        dg.MapPoints = function(ps, f) {
	        var mp = new dg.geom.MapPoints(ps, f);
		dg.geom.objects.push(mp);
		dg_repaint();
		return mp;
        }
    
        dg.TranslatePoint = function(p, v1, v2) {
  	        var mp = new dg.geom.TranslatePoint(p, v1, v2);
		dg.geom.objects.push(mp);
		dg_repaint();
		return mp;
        }
    
	function dg_count_objects(type) {
		k = 0;
		for(var i = 0; i < dg.geom.objects.length; i++) 
			if(dg.geom.objects[i]._type === type)
				k++;
		return k;
	}
	
	/* dg axes */
	dg.axes = {};
	dg.axes.objects = [];
	dg.Axes = function(o) {
		var axes = new dg.axes.Axes(new dg.geom.Vector(o));
		dg.axes.objects.push(axes);
		dg_draw_axes();
		return axes;
	}
	function dg_draw_axes() {
		if(dg.axes.objects.length > 0) {
			dg.axes.objects[0].draw();
		}
	}
	dg.axes.Axis = function(o, d, r) {
		this._o = o;
		this._u = [50, 100];
		this._cu = this._u[0];
		this._dmin = d[0];
		this._dmax = d[1];
		this._tick = 40;
		this._ticks = [];
		this._calcTicks(40);
		
		return this;
	}

	dg.axes.Axis.prototype.max_ticks = function(l) {
		if(l === "x") {
			return dg_canvas_width / this._u[0];
		} else if(l === "y"){
			return dg_canvas_height / this._u[0];
		}
	}	
	dg.axes.Axis.prototype.min_ticks = function(l) {
		if(l === "x") {
			return dg_canvas_width / this._u[1];
		} else if(l === "y"){
			return dg_canvas_height / this._u[1];
		}
	}
	dg.axes.Axis.prototype.label = function() {
		if(arguments.length === 0) 
			return this._label;
		else {
			this._label = arguments[0];
		}
	}
	dg.axes.Axis.prototype.umin = function() {
		if(arguments.length === 0)
			return this._u[0];
		else {
			this._u[0] = arguments[0];
			return this;
		}
	}
	dg.axes.Axis.prototype.umax = function() {
		if(arguments.length === 0)
			return this._u[1];
		else {
			this._u[1] = arguments[0];
			return this;
		}
	}

	dg.axes.Axis.prototype.u = function() { 
		if(arguments.length === 0)
			return this._u;
		else
			return this;
	}
	dg.axes.Axis.prototype.cu = function() {
		if(arguments.length === 0)
			return this._cu;
		else {
			this._cu = arguments[0];
			return this;
		}
	}
	dg.axes.Axis.prototype._calcDomain = function(l) {
		if(l === "x") {
			this._dmin = - (this._o.x() / this._cu);
			this._dmax = (dg_canvas_width - this._o.x()) / this._cu;
		} else if(l === "y") {
			this._dmin = -(dg_canvas_height - this._o.y()) / this._cu;
			this._dmax = this._o.y() / this._cu;
		}
	}
	dg.axes.Axis.prototype._calcTicks = function(n) {
		var mul = [0, 0];
		var tick = 1;
	
		for(var i = -n; i < 0; i++) {
			mul[0]--;
			if(mul[0] == -1)
				tick = .5;
			else if(mul[0] == -2)
				tick = .2;
			else if (mul[0] < -2){
				if(mul[1] == 2) {					
					tick = tick * 2 / 5;
					mul[1] = 0;
				} else {
					mul[1]++;
					tick *= .5;
				}					
			} 
			this._ticks.push(tick);
		}
		this._ticks.reverse();
		this._ticks.push(1);
		mul[0] = 0;
		mul[1] = 0;
		tick = 1;
		for(var i = n; i < 2*n - 1; i++) {	
			mul[0]++;
			if(mul[0] == 1)
				tick = 2;
			else if(mul[0] == 2)
				tick = 5;
			else if (mul[0] > 2){
				if(mul[1] == 2) {					
					tick = tick/2 * 5;
					mul[1] = 0;
				} else {
					mul[1]++;
					tick *= 2;
				}					
			}
			this._ticks.push(tick);
		}
	}
	dg.axes.Axis.prototype._drawTicks = function(l) { 
		var precision;
		if(this._ticks[this._tick] < 1)
			precision = (this._ticks[this._tick] + " ").split(".")[1].length - 1;
		else
			precision = 1;
		
		if(l === "x") {
			this._calcDomain("x");
			
			if((this._dmax - this._dmin) / this._ticks[this._tick] < this.min_ticks("x")) {
				this._tick--;
			}
			else if((this._dmax - this._dmin) / this._ticks[this._tick] > this.max_ticks("x")) {
				this._tick++;
			}
			
			var l = Math.floor(this._dmin);
			var r = Math.ceil(this._dmax) ;
			var i , i1;

			if(l > 0 && r > 0) {
				i = Math.floor(this._dmin / this._ticks[this._tick]) * this._ticks[this._tick];
			} else if (l < 0 && r < 0) {
				i1 = Math.ceil(this._dmax / this._ticks[this._tick]) * this._ticks[this._tick];
			} else {
				i =  this._ticks[this._tick];
				i1 =  -this._ticks[this._tick];
			}
			dg_draw_label([this._o.x() + 8  , this._o.y() + 15] , 0 , "#303030", "11 px arial");	
			while(i < r) {
					
				dg_draw_label([this._o.x() + i * this._cu  , this._o.y() + 15] , Math.round(i * Math.pow(10, precision))/Math.pow(10, precision) , "#303030", "12 px arial");
				dg_draw_segment([this._o.x() + i * this._cu, this._o.y()], [this._o.x() + i * this._cu, this._o.y() + 4], "#303030", 1);
				
				i+= this._ticks[this._tick];
			}
			
			dg_draw_label([this._o.x() - 15  , this._o.y() - 8] , 0 , "#303030", "11 px arial");	
			while(i1 > l) {
				dg_draw_label([this._o.x() + i1 * this._cu  , this._o.y() + 15] , Math.round(i1 * Math.pow(10, precision))/Math.pow(10, precision) , "#303030", "12 px arial");
				dg_draw_segment([this._o.x() + i1 * this._cu, this._o.y()], [this._o.x() + i1 * this._cu, this._o.y() + 4], "#303030", 1);
				
				i1-= this._ticks[this._tick];
			}
				
		} else if(l === "y") {
			this._calcDomain("y");
			
			if((this._dmax - this._dmin) / this._ticks[this._tick] < this.min_ticks("y")) {
				this._tick--;
			}
			else if((this._dmax - this._dmin) / this._ticks[this._tick] > this.max_ticks("y")) {
				this._tick++;
			}

			var l = Math.floor(this._dmin);
			var r = Math.ceil(this._dmax) ;
			var i , i1;

			if(l > 0 && r > 0) {
				i = Math.floor(this._dmin / this._ticks[this._tick]) * this._ticks[this._tick];
			} else if (l < 0 && r < 0) {
				i1 = Math.ceil(this._dmax / this._ticks[this._tick]) * this._ticks[this._tick];
			} else {
				i =  this._ticks[this._tick];
				i1 =  -this._ticks[this._tick];
			}
			
			while(i < r) {
				dg_draw_label([this._o.x() - 15 - 3 * precision, this._o.y() - i * this._cu] , Math.round(i * Math.pow(10, precision))/Math.pow(10, precision) , "#303030", "12 px arial");
				dg_draw_segment([this._o.x(), this._o.y() - i * this._cu], [this._o.x() - 4, this._o.y() - i * this._cu], "#303030",1);
				
				i+= this._ticks[this._tick];
			}
			while(i1 > l) {
				dg_draw_label([this._o.x() - 15 - 3 * precision, this._o.y() - i1 * this._cu] , Math.round(i1 * Math.pow(10, precision))/Math.pow(10, precision) , "#303030", "12 px arial");
				dg_draw_segment([this._o.x(), this._o.y() - i1 * this._cu], [this._o.x() - 4, this._o.y() - i1 * this._cu], "#303030",1);
				
				i1-= this._ticks[this._tick];				
			}
		
		}
	}
	dg.axes.Axis.prototype.draw = function(a) {
		if(a === "x") {
			dg_draw_line([0, this._o.y()], [1, this._o.y()], "#303030", 1);
			this._drawTicks("x");
		} else if(a === "y") {
			dg_draw_line([this._o.x(), 0], [this._o.x(), 1], "#303030", 1);
			this._drawTicks("y");
		}
		
	}
	
	dg.axes.Axes = function(o) {
		this._o = o;
		this._xaxis = new dg.axes.Axis(o, [-4.3, 23.02], [0, dg_canvas_width]);
		this._yaxis = new dg.axes.Axis(o, [-5.98, 6.3], [0, dg_canvas_height]);
		this._hide = false; 
		
		return this;
	}
	dg.axes.Axes.prototype.hide = function(b) {
		this._hide = b;
		return this;
	}
	dg.axes.Axes.prototype.draw = function() {
		if(!this._hide) {
			this._xaxis.draw("x");
			this._yaxis.draw("y");
		} else {
			this._xaxis._calcDomain("x");
			this._yaxis._calcDomain("y");
		}
	}
	/* generating random color functions */	
	dg.color = {};
	dg.color.rand = function() { 
		var r = Math.floor(Math.random() * 255);
		var g = Math.floor(Math.random() * 255);
		var b = Math.floor(Math.random() * 255);
			
		return "rgb(" + r + "," + g + "," + b + ")";
	}

	dg.geom = {}; 
	dg.geom.objects = [];

	/* canvas pixel -> custom point mapping */
	dg.geom.transform = function(g) {
		var x = dg.axes.objects[0]._xaxis;
		var y = dg.axes.objects[0]._yaxis;
			
		return [x._cu * g[0] + x._o.x(), -(y._cu * g[1]) + y._o.y()];
	}
	dg.geom.transform_inverse = function(g) {
		var x = dg.axes.objects[0]._xaxis;
		var y = dg.axes.objects[0]._yaxis;

		return [(g[0] - x._o.x()) / x._cu , -(g[1] - y._o.y()) / y._cu];		
	}
	
	dg.geom.transform_scalar = function(s) {
		return dg.axes.objects[0]._xaxis._cu * s;
	}

	/* drawing functions */
	function dg_repaint() {
		dg_clear_canvas();
		dg_draw_axes();
		dg_draw_objects();
	}

	function dg_draw_objects() {
		/* prioratize points */
		var points_pos = [];
		if(dg.geom.objects.length > 0) {
	
			for(var i = dg.geom.objects.length - 1; i > -1; i--) {
			        if(typeof dg.geom.objects[i].isIntersection === 'function' ||
   		                   typeof dg.geom.objects[i].isPoint === 'function') {
					
					points_pos.push(i);
					continue;
				}
				if(dg.geom.objects[i]._hide === false) {
					dg.geom.objects[i].draw();
				}
			}
			for(var i = points_pos.length - 1; i > -1; i--) {
				if(dg.geom.objects[i]._hide === false) {
					dg.geom.objects[points_pos[i]].draw();
				}
			}
		}
	}

	function dg_clear_canvas() {
		dg_canvas_context.fillStyle = "#ffffff";
		dg_canvas_context.rect(0, 0, dg_canvas_width, dg_canvas_height);
		dg_canvas_context.fill();
	}

	function dg_draw_label(p, t, s, f) {
		dg_canvas_context.fillStyle = s;
		dg_canvas_context.font = f;
		dg_canvas_context.textAlign = "center";
		dg_canvas_context.textBaseline = "middle";
		dg_canvas_context.fillText(t, p[0],p[1]);
	}
	function dg_draw_segment(d0, d1, style, size) {
		dg_canvas_context.strokeStyle = style;
		dg_canvas_context.lineWidth = size;
		dg_canvas_context.beginPath();
		dg_canvas_context.moveTo(d0[0], d0[1]);
		dg_canvas_context.lineTo(d1[0], d1[1]);
		dg_canvas_context.stroke();
	}
	function dg_draw_polygon(d, ss, sf, ps) { 
		dg_canvas_context.fillStyle = sf;
		dg_canvas_context.strokeStyle = ss;
		dg_canvas_context.lineWidth = ps;
		dg_canvas_context.beginPath();
		dg_canvas_context.moveTo(d[0][0], d[0][1]);
		for(var i = 1; i < d.length; i++) {
			dg_canvas_context.lineTo(d[i][0], d[i][1]);
		}
		dg_canvas_context.lineTo(d[0][0], d[0][1]);
		dg_canvas_context.closePath();
		dg_canvas_context.fill();
		dg_canvas_context.stroke();
	}
	function dg_draw_line(d0, d1, style, size) {
		dg_canvas_context.strokeStyle = style;
		dg_canvas_context.lineWidth = size;
		dg_canvas_context.beginPath();
		
		var t = dg.max([dg_canvas_width, dg_canvas_height]) * Math.sqrt(2);
		
		var p0 = (d1[0] - d0[0]);
		var p1 = (d1[1] - d0[1]);
		
		var p = new dg.geom.Vector([p0,p1]);
		
		var u = new dg.geom.Vector(d0).add(p.mul(t));
		var v = new dg.geom.Vector(d0).add(p.mul(-t));

		dg_canvas_context.moveTo(u.x(), u.y());
		dg_canvas_context.lineTo(v.x(), v.y());
		dg_canvas_context.stroke();
		
	}
	function dg_draw_circle(p, r, style, size) {
		dg_canvas_context.strokeStyle = style;
		dg_canvas_context.beginPath();
		dg_canvas_context.arc(p[0], p[1], r, 0, 2 * Math.PI, true);
		dg_canvas_context.lineWidth = size;
		dg_canvas_context.stroke();
	}
	function dg_draw_arc_fill(p, r, theta0, theta1, style, stroke) {
		dg_canvas_context.fillStyle = style;
		dg_canvas_context.beginPath();
		dg_canvas_context.arc(p[1][0], p[1][1], r, theta0, theta1, true);
		dg_canvas_context.lineWidth = 1;
		dg_canvas_context.strokeStyle = stroke;
		dg_canvas_context.stroke();
		dg_canvas_context.fill();
		dg_canvas_context.closePath();
		
		dg_canvas_context.beginPath();
		dg_canvas_context.moveTo(p[0][0], p[0][1]);
		dg_canvas_context.lineTo(p[1][0], p[1][1]);
		dg_canvas_context.lineTo(p[2][0], p[2][1]);
		dg_canvas_context.stroke();
		dg_canvas_context.fill();

	}
	
	function dg_draw_circle_fill(p, r, style, size) {
		dg_canvas_context.fillStyle = style;
		dg_canvas_context.beginPath();
		dg_canvas_context.arc(p[0], p[1], r, 0, 2 * Math.PI, true);
		dg_canvas_context.lineWidth = size;
		dg_canvas_context.fill();
	}
	/* dg geom dependency */
	dg.geom.Dependency = function() {
		this._dep = [];
	}
	dg.geom.Dependency.prototype.push = function(o) {
		this._dep.push(o);
	}
	dg.geom.Dependency.prototype.get = function() {
		if(arguments.length == 0)
			return this._dep;
		else
			return this._dep[arguments[0]];
	}
	dg.geom.Dependency.prototype.length = function() {
		return this._dep.length;
	}
	dg.geom.Dependency.prototype.recalc = function() {
		for(var i = 0; i < this._dep.length; i++)
			this._dep[i].recalc();
		dg_repaint();
	}

	/* dg.geom namespace */
	dg.geom.Properties = function() {
		
	}
	dg.geom.Properties.prototype.color = function(c) {
		this._color = c;
		dg_repaint();
		return this;
	}
	dg.geom.Properties.prototype.stroke = function(s) { 
		this._stroke = s;
		dg_repaint();
		return this;
	}
	dg.geom.Properties.prototype.fill = function(f) {
		this._fill = f;
		dg_repaint();
		return this;
	}
	dg.geom.Properties.prototype.size = function(s) {
		this._size = s;
		dg_repaint();
		return this;
	}
	dg.geom.Properties.prototype.free = function(f) {
		this._free = f;
		dg_repaint();
		return this;
	}

	dg.geom.Properties.prototype.hide = function() {
		this._hide = true;
		dg_repaint();
		return this;
	}
	dg.geom.Properties.prototype.show = function() {
		this._hide = false;
		dg_repaint();
		return this;
	}

    
	dg.geom.Angle = function() {
		this._d = new dg.geom.Dependency();
		this._r = .6;
		this._stroke = "#006600";
		this._hide = false;
		this._fill = "rgba(0,100,0,0.2)";
		if(arguments.length > 2) {
			this._p0 = arguments[0];
			this._p1 = arguments[1];
			this._p2 = arguments[2];
			
			var u = new dg.geom.Vector([this._p0.x() - this._p1.x(), this._p0.y() - this._p1.y()]);
			var v = new dg.geom.Vector([this._p2.x() - this._p1.x(), this._p2.y() - this._p1.y()]);
			this._angle = Math.acos( u.dot(v) /( u.norm() * v.norm() ) );

			this._sint1 = u.cross(v) / ( u.norm() * v.norm() );
			var u0 = new dg.geom.Vector([1, 0]);
			this._sa = Math.acos(u.dot(u0) / (u.norm()*u0.norm())) - Math.acos( u.dot(v) /( u.norm() * v.norm() ) );
			this._ea = Math.acos( u.dot(v) /( u.norm() * v.norm() ) );		
			if(this._sint1 > 0) {
				this._sa = Math.acos(u.dot(u0) / (u.norm()*u0.norm()));
			} 
			if(u.cross(u0) > 0 && this._sint1 < 0) {
				this._sa = -Math.acos(u.dot(u0) / (u.norm()*u0.norm())) - Math.acos( u.dot(v) /( u.norm() * v.norm() ) );
			
			} else if(u.cross(u0) > 0 && this._sint1 > 0) {
				this._sa = -Math.acos(u.dot(u0) / (u.norm()*u0.norm()));
				
			}

			var o = u.mul(1/u.norm()).add(v.mul(1/v.norm()));
			o = o.mul(.5);

			/* add dependencies */
			this._p0._d.push(this);
			this._p1._d.push(this);
			this._p2._d.push(this);
			
			var intersection = new dg.geom.Intersection(new dg.geom.Line(this._p0, this._p1), new dg.geom.Line(this._p1, this._p2)).get(0);			
			this._pos = new dg.geom.Point([intersection.x() + o.x() , intersection.y() + o.y() ]);
			
		}
		
		this._intersection = intersection;
		this._type = ANGLE;
		
		return this;
	}
	dg.geom.Angle.prototype = Object.create(dg.geom.Properties.prototype);
	dg.geom.Angle.prototype.constructor = dg.geom.Angle;
	dg.geom.Angle.prototype.recalc = function() {

		var u = new dg.geom.Vector([this._p0.x() - this._p1.x(), this._p0.y() - this._p1.y()]);
		var v = new dg.geom.Vector([this._p2.x() - this._p1.x(), this._p2.y() - this._p1.y()]);

		var intersection = new dg.geom.Intersection(new dg.geom.Line(this._p0, this._p1), new dg.geom.Line(this._p1, this._p2)).get(0);
		
		this._intersection = intersection;
		this._angle = Math.acos( u.dot(v) /( u.norm() * v.norm() ) );

		this._sint1 = u.cross(v) / ( u.norm() * v.norm() );
		var u0 = new dg.geom.Vector([1, 0]);
		this._sa = Math.acos(u.dot(u0) / (u.norm()*u0.norm())) - Math.acos( u.dot(v) /( u.norm() * v.norm() ) );
		this._ea = Math.acos( u.dot(v) /( u.norm() * v.norm() ) );		
		if(this._sint1 > 0) {
			this._sa = Math.acos(u.dot(u0) / (u.norm()*u0.norm()));
		} 
		if(u.cross(u0) > 0 && this._sint1 < 0) {
			this._sa = -Math.acos(u.dot(u0) / (u.norm()*u0.norm())) - Math.acos( u.dot(v) /( u.norm() * v.norm() ) );
		
		} else if(u.cross(u0) > 0 && this._sint1 > 0) {
			this._sa = -Math.acos(u.dot(u0) / (u.norm()*u0.norm()));
			
		}

		var o = u.mul(1/u.norm()).add(v.mul(1/v.norm()));
		o = o.mul(.5);
			
		this._pos = new dg.geom.Point([intersection.x() + o.x() , intersection.y() + o.y() ]);
	}
	dg.geom.Angle.prototype.deg = function() {
		return this._angle * 180 / Math.PI;
	}
	dg.geom.Angle.prototype.draw = function() {
		var pc = dg.geom.transform([this._pos.x(), this._pos.y()]);
		var intersection = dg.geom.transform(this._intersection.xy());
		var r = dg.geom.transform_scalar(this._r);
		
		var p0 = new dg.geom.Vector([this._p0.x() - this._p1.x(), this._p0.y() - this._p1.y() ]);
		p0 = p0.mul(this._r/ p0.norm());
		p0 = p0.translate(this._intersection);
		
		var p2 = new dg.geom.Vector([this._p2.x() - this._p1.x(), this._p2.y() - this._p1.y() ]);
		p2 = p2.mul(this._r/ p2.norm());
		p2 = p2.translate(this._intersection);
		
		p0 = dg.geom.transform(p0.xy());
		p2 = dg.geom.transform(p2.xy());
		
		var points = [ p0, intersection, p2  ];
		
		dg_draw_arc_fill(points, r, -this._sa, -this._sa -this._ea , this._fill, this._stroke);
		dg_draw_label(pc , this.deg().toFixed(0) + "°" , this._stroke, "12px bold arial");
	}
	dg.geom.Vector = function(d) {
		this._x = d[0];
		this._y = d[1];
		this._type = VECTOR;
		this._label = "u" + dg_count_objects(2);
		return this;
	}
	dg.geom.Vector.prototype.str = function() {
		return this._label + ": (" + this._x + ", " + this._y + ")";
	}
	dg.geom.Vector.prototype.translate = function(p) {
		this._x += p.x();
		this._y += p.y();
		return this;
	}
	dg.geom.Vector.prototype.dot = function(v) {
		return this._x * v.x() + this._y * v.y();
	}
	dg.geom.Vector.prototype.cross = function(v) { 
		return this._x * v.y() - v.x() * this._y;
	}
	dg.geom.Vector.prototype.norm = function() {
		return Math.sqrt(this.dot(this));
	}
	dg.geom.Vector.prototype.add = function(u) {
		var u0 = this._x + u.x();
		var u1 = this._y + u.y();
		
		return new dg.geom.Vector([u0,u1]);
	}
	dg.geom.Vector.prototype.mul = function(t) {
		return new dg.geom.Vector([this._x * t, this._y * t]);
	}
	dg.geom.Vector.prototype.label = function() {
		if(arguments.length === 0)
			return this._label;
		else {
			this._label = arguments[0];
			return this;
		}
	}
	dg.geom.Vector.prototype.xy = function () {
		return [ this._x, this._y ];
	}
	dg.geom.Vector.prototype.x = function() {
		if(arguments.length === 0)
			return this._x;
		else {
			this._x = arguments[0];
			return this;
		}
	}
	dg.geom.Vector.prototype.y = function() {
		if(arguments.length === 0)
			return this._y;
		else {
			this._y = arguments[0];
			return this;
		}
	}

    dg.geom.Point = function(d) {
		this._x = d[0];
		this._y = d[1];
		this._type = POINT;
		this._label = "A" + dg_count_objects(1);
		this._free = true;
		this._hide = false;
		this._color = "#0000ff";
		this._size = 4;
		this._stroke = "#202020";
		this._d = new dg.geom.Dependency();
		this._events = {};
		return this;
	}
	dg.geom.Point.prototype = Object.create(dg.geom.Properties.prototype);
	dg.geom.Point.prototype.constructor = dg.geom.Point;
	
	dg.geom.Point.prototype.dist = function(p) {
		return Math.sqrt( Math.pow(p.x() - this._x, 2) + Math.pow(p.y() - this._y , 2) );
	}
	dg.geom.Point.prototype.xy = function() {
		return [ this._x, this._y ];
	}
        dg.geom.Point.prototype.draw = function() {
		if (this._hide) return;

 		if(this._d.length() > 0) {
			for(var i = 0; i < this._d.length(); i++)
				this._d.get(i).recalc();
		}
		
		if(this._free === false)
			dg_canvas_context.fillStyle = "#444444";
		else
			dg_canvas_context.fillStyle = this._color;

		dg_canvas_context.strokeStyle = this._stroke;
		dg_canvas_context.beginPath();
		var p = dg.geom.transform([this._x, this._y]);
		dg_canvas_context.arc(p[0], p[1], this._size, 0, 2 * Math.PI, true);
		dg_canvas_context.lineWidth = 1;
		dg_canvas_context.fill();
		dg_canvas_context.stroke();
		
		dg_canvas_context.font = "12px lighter arial";
		dg_canvas_context.fillText(this._label, p[0] + this._size + 8, p[1] - 8 - this._size);
	}
	dg.geom.Point.prototype.translate = function(p) {
		this._x += p.x();
		this._y += p.y();
		return this;
	}
	dg.geom.Point.prototype.rotate = function() {
		if(arguments.length == 1) {
			var theta = arguments[0];
			var rot = dg.rotate([ this._x, this._y ], theta);
		
			this._x = rot[0];
			this._y = rot[1];			
		} else if(arguments.length == 2) {
			var p = arguments[0];
			var theta = arguments[1];
			var rot = dg.rotate([ this._x - p.x(), this._y - p.y()], theta);
		
			this._x = rot[0] + p.x();
			this._y = rot[1] + p.y();
		}
		
		return this;
	}
	dg.geom.Point.prototype.addEvent = function(en, callback) {
		if(en == "moved") {
			this._events["moved"] = { dg_object: this, dispatch: callback };
		}
		if(en == "click") {
			this._events['click'] = { dg_object: this, dispatch: callback };
		}
		return this;
	}
	dg.geom.Point.prototype.isPoint = function() {
		return true;
	}
	dg.geom.Point.prototype.x = function() {
		if(arguments.length === 0)
			return this._x;
		else {
			this._x = arguments[0];
			if(this._events['moved'] != undefined) {					
				this._events['moved'].dispatch();
			}

			return this;
		}
	}
	dg.geom.Point.prototype.y = function() {
		if(arguments.length === 0)
			return this._y;
		else {
			this._y = arguments[0];
			if(this._events['moved'] != undefined) {
				this._events['moved'].dispatch();	
			}				
	
			return this;
		}
	}
	dg.geom.Point.prototype.setX = function(x) {
		this._x = x;
		if(this._events['moved'] != undefined)
			this._events['moved'].dispatch();		
		dg_repaint();
		return this;
	}
	dg.geom.Point.prototype.setY = function(y) {
		this._y = y;
		if(this._events['moved'] != undefined)
			this._events['moved'].dispatch();		
		dg_repaint();
		return this;
	}
	dg.geom.Point.prototype.label = function() {
		if(arguments.length === 0)
			return this._label;
		else {
			this._label = arguments[0];
			dg_repaint();
			return this;
		}
	}

    dg.geom.TranslatePoint = function(p, v1, v2) {
	this._d = new dg.geom.Dependency();
	this._p = p;
	this._v1 = v1;
	this._v2 = v2;
	this._type = TRANSLATE_POINT;
	var tp = dg.geom.Point.call(this, [p.x() + v2.x() - v1.x(), p.y() + v2.y() - v1.y()] );
	this._p._d.push(tp);
	this._v1._d.push(tp);
	this._v2._d.push(tp);
	this._free = 0;
	return this;
    }
    dg.geom.TranslatePoint.prototype = Object.create(dg.geom.Point.prototype);
    dg.geom.TranslatePoint.constructor = dg.geom.TranslatePoint;
    dg.geom.TranslatePoint.prototype.recalc = function() {
	var p = this._p.xy();
	var v1 = this._v1.xy();
	var v2 = this._v2.xy();
	var tp = [p[0] + v2[0] - v1[0], p[1] + v2[1] - v1[1]];
	this._x = tp[0];
	this._y = tp[1];
	/* if geom dependent on mapped point recalculate */
	if(this._d.length() > 0) {
	    for(var i = 0; i < this._d.length(); i++)
		this._d.get(i).recalc();
	}
    }
    
    dg.geom.MapPoint = function(p, f) {
   	this._d = new dg.geom.Dependency();
	this._p = p;
	this._f = f;
    	this._type = MAP_POINT;
	var fp = dg.geom.Point.call(this, [0, 0]);
	this._p._d.push(fp);
	this._free = 0;
	return this;
    }

    dg.geom.MapPoint.prototype = Object.create(dg.geom.Point.prototype);
    dg.geom.MapPoint.prototype.constructor = dg.geom.MapPoint;
    dg.geom.MapPoint.prototype.recalc = function() {
	var v = this._f(this._p.xy());
	this._x = v[0];
	this._y = v[1];
	/* if geom dependent on mapped point recalculate */
	if(this._d.length() > 0) {
	    for(var i = 0; i < this._d.length(); i++)
		this._d.get(i).recalc();
	}
    }


    dg.geom.MapPoints = function(ps, f) {
   	this._d = new dg.geom.Dependency();
	this._ps = ps;
	this._f = f;
    	this._type = MAP_POINTS;
	var fp = dg.geom.Point.call(this, [0, 0]);
	for (var i = 0; i < ps.length; i++)
	    this._ps[i]._d.push(fp);
	this._free = 0;
	return this;
    }

    dg.geom.MapPoints.prototype = Object.create(dg.geom.Point.prototype);
    dg.geom.MapPoints.prototype.constructor = dg.geom.MapPoints;
    dg.geom.MapPoints.prototype.recalc = function() {
	var args = [];
	for (var i = 0; i < this._ps.length; i++)
	    args[i] = this._ps[i].xy();
	var v = this._f.apply(null, args);
	this._x = v[0];
	this._y = v[1];
	/* if geom dependent on mapped point recalculate */
	if(this._d.length() > 0) {
	    for(var i = 0; i < this._d.length(); i++)
		this._d.get(i).recalc();
	}
    }

    
	dg.geom.Midpoint = function() {
		this._d = new dg.geom.Dependency();
		if(arguments.length == 1) {
			this._p0 = arguments[0]._p0;
			this._p1 = arguments[0]._p1;
		} else {
			this._p0 = arguments[0];
			this._p1 = arguments[1];
		}
		
		var centroid = dg.centroid([this._p0, this._p1]);
		
		var mp = dg.geom.Point.call(this, centroid.xy());
		
		this._p0._d.push(mp);
		this._p1._d.push(mp);
		
		this._type = MIDPOINT;
		this._free = false;
		return this;
	}
	dg.geom.Midpoint.prototype = Object.create(dg.geom.Point.prototype);
	dg.geom.Midpoint.prototype.constructor = dg.geom.Midpoint;
	dg.geom.Midpoint.prototype.recalc = function() { 
		var centroid = dg.centroid([this._p0, this._p1]);
		
		this.x( centroid.x() );
		this.y( centroid.y() );

		/* if geom dependent on midpoint recalculate */
		if(this._d.length() > 0) {
			for(var i = 0; i < this._d.length(); i++)
				this._d.get(i).recalc();
		}
	}
	
	dg.geom.Line = function(p0, p1) {
		this._hide = false;
		this._size = 1;
		this._d = new dg.geom.Dependency();
		this._p0 = p0;
		this._p1 = p1;
		this._type = LINE;
		this._color = "#202020";
		return this;
	}
	dg.geom.Line.prototype = Object.create(dg.geom.Properties.prototype);
	dg.geom.Line.prototype.constructor = dg.geom.Line;

	dg.geom.Line.prototype.isLine = function() {
		return true;
	}
	dg.geom.Line.prototype.p0 = function() { 
		return this._p0;
	}
	dg.geom.Line.prototype.p1 = function() {
		return this._p1;
	}

	dg.geom.Line.prototype.recalc = function() {}
	
	dg.geom.Line.prototype.draw = function() { 
	    if (this._hide) return;
		var p0 = dg.geom.transform([this._p0.x(), this._p0.y()]);
		var p1 = dg.geom.transform([this._p1.x(), this._p1.y()]);

		dg_draw_line(p0, p1, this._color, this._size);
	}

	dg.geom.Segment = function(p0, p1) {
		this._d = new dg.geom.Dependency();
		this._p0 = p0;
		this._p1 = p1;
		this._type = SEGMENT;
		this._color = "#202020";
		this._hide = false;
		this._size = 1;
		this._attached = [];

		this._p0._d.push(this);
		this._p1._d.push(this);

		return this;
	}
	dg.geom.Segment.prototype = Object.create(dg.geom.Line.prototype);
	dg.geom.Segment.prototype.constructor = dg.geom.Segment;
	dg.geom.Segment.prototype.isSegment = function() {
		return true;
	}
	dg.geom.Segment.prototype.attach = function(g) {
		g.free(false);
		this._attached.push({geom: g, d: this._p0.dist(g) ,dist: this._p0.dist(this._p1) , ratio: this._p0.dist(g) / this._p1.dist(g) });

		return this;
	}	
	dg.geom.Segment.prototype.recalc = function() {
		if(this._attached.length > 0) {
			for(var i = 0; i < this._attached.length; i++) {
				var g = this._attached[i];
	
				var dist = g.d;
				var v = new dg.geom.Vector([ this._p1.x() - this._p0.x(), this._p1.y() - this._p0.y() ]);
				v = v.mul(1/ v.norm());
				v = v.mul( dist * (this._p0.dist(this._p1) / g.dist) );
				g.geom.x( this._p0.x() + v.x() );
				g.geom.y( this._p0.y() + v.y() );
				
				g.dist = this._p0.dist(this._p1);
				g.d = this._p0.dist(g.geom);
			}
		}		
	}

	dg.geom.Segment.prototype.draw = function() { 
		var c = this._color;
		if(arguments.length > 0)
			c = arguments[0];
		var p0 = dg.geom.transform([this._p0.x(), this._p0.y()]);
		var p1 = dg.geom.transform([this._p1.x(), this._p1.y()]);

		dg_draw_segment(p0, p1, c, this._size);
	}
	
	dg.geom.PerpendicularLine = function(p, l) {
		this._d = new dg.geom.Dependency();
		this._p = p;
		this._l = l;
		
		var p0 = new dg.geom.Point([ this._l._p1.x() - this._l._p0.x(), this._l._p1.y() - this._l._p0.y() ]);
		var v = new dg.geom.Vector([ -p0.y(), p0.x() ]);
		v = v.translate(new dg.geom.Point([ this._p.x(), this._p.y() ]));
		
		var pl = dg.geom.Line.call(this, this._p, new dg.geom.Point( v.xy() ), 7);

		this._p._d.push(pl);
		this._l._p0._d.push(pl);
		this._l._p1._d.push(pl);
		this._l._d.push(pl);
		this._type = PERPENDICULAR;
		
		return this;
	}
	dg.geom.PerpendicularLine.prototype = Object.create(dg.geom.Line.prototype);
	dg.geom.PerpendicularLine.prototype.constructor = dg.geom.PerpendicularLine;
	dg.geom.PerpendicularLine.prototype.recalc = function() {
		var p0 = new dg.geom.Point([ this._l._p1.x() - this._l._p0.x(), this._l._p1.y() - this._l._p0.y() ]);
		var v = new dg.geom.Vector([ -p0.y(), p0.x() ]);
		v = v.translate(new dg.geom.Point([ this._p.x(), this._p.y() ]));

		this._p1 = new dg.geom.Point(v.xy());
		/* if geom dependent on perpendicular line recalculate */
		if(this._d.length() > 0) {
			for(var i = 0; i < this._d.length(); i++)
				this._d.get(i).recalc();
		}
	}
	dg.geom.PerpendicularBisector = function() {
		this._d = new dg.geom.Dependency();
		if(arguments.length > 1) {
			this._p = new dg.geom.Midpoint(arguments[0], arguments[1]);
			this._l = new dg.geom.Segment(arguments[0], arguments[1]);
			
		} else {
			this._l = arguments[0];
			this._p = new dg.geom.Midpoint(this._l._p0, this._l._p1);
		}
		
		pl = dg.geom.PerpendicularLine.call(this, this._p, this._l);
		this._type = PERPENDICULAR_BISECTOR;

		this._l._d.push(pl);
		this._p._d.push(pl);

		return this;
	}
	dg.geom.PerpendicularBisector.prototype = Object.create(dg.geom.PerpendicularLine.prototype);
	dg.geom.PerpendicularBisector.prototype.constructor = dg.geom.PerpendicularBisector;
	dg.geom.PerpendicularBisector.prototype.recalc = function() {
		var p0 = new dg.geom.Point([ this._l._p1.x() - this._l._p0.x(), this._l._p1.y() - this._l._p0.y() ]);
		var v = new dg.geom.Vector([ -p0.y(), p0.x() ]);
		v = v.translate(new dg.geom.Point([ this._p.x(), this._p.y() ]));

		this._p1 = new dg.geom.Point(v.xy());
		/* if geom dependent on perpendicular line recalculate */
		if(this._d.length() > 0) {
			for(var i = 0; i < this._d.length(); i++)
				this._d.get(i).recalc();
		}		
	}
	dg.geom.AngleBisector = function(p0,p1,p2) {
		this._d = new dg.geom.Dependency();
		this._pl = p0;
		this._pc = p1;
		this._pr = p2;
		var theta = new dg.geom.Angle(p0, p1, p2);
		var prot = new dg.geom.Vector(dg.rotate([p0.x() - p1.x(), p0.y() - p1.y()], -theta._angle));
		prot = prot.add(new dg.geom.Vector([p1.x(), p1.y()]));
		var pc = dg.centroid([p0, prot]);
		
		var l = dg.geom.Line.call(this, p1, pc);
		
		this._pl._d.push(l);
		this._pc._d.push(l);
		this._pr._d.push(l);

		this._type = ANGLE_BISECTOR;
		
		return this;
	}
	dg.geom.AngleBisector.prototype = Object.create(dg.geom.Line.prototype);
	dg.geom.AngleBisector.prototype.constructor = dg.geom.AngleBisector;
	dg.geom.AngleBisector.prototype.recalc = function() {
		
		var theta = new dg.geom.Angle(this._pl, this._pc, this._pr);
		var prot = new dg.geom.Vector(dg.rotate([this._pl.x() - this._pc.x(), this._pl.y() - this._pc.y()], -theta._angle));
		prot = prot.add(new dg.geom.Vector([this._pc.x(), this._pc.y()]));
		var pc = dg.centroid([this._pl, prot]);
		
		this._p1 = pc;

		/* if geom dependent on anglebisector line recalculate */
		if(this._d.length() > 0) {
			for(var i = 0; i < this._d.length(); i++)
				this._d.get(i).recalc();
		}		
	}
	dg.geom.ParallelLine = function(p, l) {
		this._d = new dg.geom.Dependency();
		this._p = p;
		this._l = l;
				
		var p0 = new dg.geom.Point([ this._l._p1.x() - this._l._p0.x(), this._l._p1.y() - this._l._p0.y() ]);
		var v = new dg.geom.Vector([ p0.x(), p0.y() ]);
		v = v.translate(new dg.geom.Point([ this._p.x(), this._p.y() ]));
		
		var pl = dg.geom.Line.call(this, p, new dg.geom.Point( v.xy() ), 9);
		
		this._type = PARALLEL;
		this._p._d.push(pl);
		this._l._d.push(pl);
		
		return this;
	}
	dg.geom.ParallelLine.prototype = Object.create(dg.geom.Line.prototype);
	dg.geom.ParallelLine.prototype.constructor = dg.geom.ParallelLine;
	dg.geom.ParallelLine.prototype.recalc = function() {
		var p0 = new dg.geom.Point([ this._l._p1.x() - this._l._p0.x(), this._l._p1.y() - this._l._p0.y() ]);
		var v = new dg.geom.Vector([ p0.x(), p0.y() ]);
		v = v.translate(new dg.geom.Point([ this._p.x(), this._p.y() ]));
		
		this._p1 = new dg.geom.Point(v.xy());
		/* if geom dependent on parallel line recalculate */
		if(this._d.length() > 0) {
			for(var i = 0; i < this._d.length(); i++)
				this._d.get(i).recalc();
		}
	}
	
	dg.geom.Circle = function(p0, p1) {
		this._d = new dg.geom.Dependency();
		this._p0 = p0;
		this._p1 = p1;
		this._r = this._p0.dist(this._p1);
		this._type = CIRCLE;
		this._color = "#202020";
		this._size = 1;
		this._hide = false;
		
		this._p0._d.push(this);
		this._p1._d.push(this);
		
		return this;
	}
	dg.geom.Circle.prototype = Object.create(dg.geom.Properties.prototype);
	dg.geom.Circle.prototype.constructor = dg.geom.Circle;

	dg.geom.Circle.prototype.isCircle = function() {
		return true;
	}
	dg.geom.Circle.prototype.recalc = function() {
		this._r = this._p0.dist(this._p1);
		
		/* if geom dependent on circle recalculate */
		if(this._d.length() > 0) {
			for(var i = 0; i < this._d.length(); i++)
				this._d.get(i).recalc();
		}	
	}
	dg.geom.Circle.prototype.draw = function() { 
		var p = dg.geom.transform([this._p0.x(), this._p0.y()]);
		var r = dg.geom.transform_scalar(this._r);
		
		dg_draw_circle(p, r, this._color, this._size);
	}
	
	dg.geom.Tangent = function(p, c) {
		this._d = new dg.geom.Dependency();
		this._p = p;
		this._c = c;
		this._mp = new dg.geom.Midpoint(p, c._p0);
		this._c0 = new dg.geom.Circle(this._mp, c._p0);

		var intersections = dg_intersect_circles(this._c0, this._c);
		
		this._t0 = new dg.geom.Line(this._p, intersections[0]);
		this._t1 = new dg.geom.Line(this._p, intersections[1]);
		
		
		this._p._d.push(this);
		this._c._p0._d.push(this);
		this._c._p1._d.push(this);
		this._type = TANGENT;
		this._hide = false;
		this._t0._color = "#202020";
		this._t1._color = "#202020";
		this._t0._size = 1;
		this._t0._size = 1;		

		return this;
	}
	dg.geom.Tangent.prototype = Object.create(dg.geom.Properties.prototype);
	dg.geom.Tangent.prototype.constructor = dg.geom.Tanget;
	dg.geom.Tangent.prototype.isTangent = function() { 
		return true;
	}
	dg.geom.Tangent.prototype.recalc = function() { 
		this._mp = new dg.geom.Midpoint(this._p, this._c._p0);
		this._c0 = new dg.geom.Circle(this._mp, this._c._p0);

		var intersections = dg_intersect_circles(this._c0, this._c);
		
		this._t0._p1 = intersections[0];
		this._t1._p1 = intersections[1];
		
		/* if geom dependent on tangent lines recalculate */
		if(this._d.length() > 0) {
			for(var i = 0; i < this._d.length(); i++)
				this._d.get(i).recalc();
		}	
	}
	dg.geom.Tangent.prototype.draw = function() { 
		this._t0.draw();
		this._t1.draw();
	}
	
	dg.geom.Polygon = function() {
		this._d = new dg.geom.Dependency();
		this._points = [];
		this._n = 0;
		this._hide = false;
		this._size = 1;
		if(arguments.length > 1) {
			this._n = arguments[1];
			/* regular polygons */
			this._points.push(arguments[0][0]);
			this._points.push(arguments[0][1]);
			var n = arguments[1];
	
			var dist = this._points[0].dist(this._points[1]);

			for(var i = 1; i < n - 1; i++) {
				var p0 = new dg.geom.Vector(this._points[i].xy()).add(new dg.geom.Point([-this._points[i-1].x(), -this._points[i-1].y()]));
				var rotated = dg.rotate(p0.xy(), (2 * Math.PI) / n );
				var p1 = new dg.geom.Vector(rotated).add(new dg.geom.Point([this._points[i].x(), this._points[i].y()]));
				p1.add(new dg.geom.Point([ dist * Math.cos((2 * Math.PI) / n), dist * Math.sin((2 * Math.PI) / n )]));
				var tp = new dg.Point(p1.xy());
				tp.free(false);
				this._points.push(tp);
				
			}
			
			this._points[0]._d.push(this);
			this._points[1]._d.push(this);
		} else {
			for(var i = 0; i < arguments[0].length; i++) {
				this._points.push(arguments[0][i]);
			}
			
		}
		this._type = POLYGON;
		this._fill = "rgba(255,0,0,0.2)";
		this._stroke = "#993300";
		
		return this;
	}
	dg.geom.Polygon.prototype = Object.create(dg.geom.Properties.prototype);
	dg.geom.Polygon.prototype.constructor = dg.geom.Polygon;

	dg.geom.Polygon.prototype.isPolygon = function() {
		return true;
	}
	dg.geom.Polygon.prototype.recalc = function() { 
		if(this._n > 0) {
			var dist = this._points[0].dist(this._points[1]);

			for(var i = 1; i < this._n - 1; i++) {
				var p0 = new dg.geom.Vector(this._points[i].xy()).add(new dg.geom.Point([-this._points[i-1].x(), -this._points[i-1].y()]));
				var rotated = dg.rotate(p0.xy(), (2 * Math.PI) / this._n );
				var p1 = new dg.geom.Vector(rotated).add(new dg.geom.Point([this._points[i].x(), this._points[i].y()]));
				p1.add(new dg.geom.Point([ dist * Math.cos((2 * Math.PI) / this._n), dist * Math.sin((2 * Math.PI) / this._n )]));
				this._points[i+1].x(p1.x()).y(p1.y());
				
			}
		}
		/* if geom dependent on polygon recalculate */
		if(this._d.length() > 0) {
			for(var i = 0; i < this._d.length(); i++)
				this._d.get(i).recalc();
		}			
	}
	dg.geom.Polygon.prototype.draw = function() {
		var p = [];
		for(var i = 0; i < this._points.length; i++) {
			p.push(dg.geom.transform([this._points[i].x(), this._points[i].y()]));
		}
			
		dg_draw_polygon(p, this._stroke, this._fill, this._size);

	}
	
	/* dg functions */
	dg.f = {};
	dg.f.Function = function() {
		this._color = "#303030";
		this._size = 1;
		this._hide = false;
		if(arguments.length > 0) {
			this._f = arguments[0];
		} else 
			this._f = function() { return 0; };

		if(arguments.length > 1) {			
			this._style = arguments[1];
		}
		this._step = 0.01;
		this._type = FUNCTION;
		return this;
	}
	dg.f.Function.prototype = Object.create(dg.geom.Properties.prototype);
	dg.f.Function.prototype.constructor = dg.f.Function;
	dg.f.Function.prototype.isFunction = function() {
		return true;
	}
	dg.f.Function.prototype.setF = function(f) {
		this._f = f;
		this.draw();
		dg_repaint();
		return this;
	}
	dg.f.Function.prototype.step = function(s) {
		this._step = s;
		return this;
	}
	dg.f.Function.prototype.f = function(x) {
		return this._f(x);
	}
	dg.f.Function.prototype.draw = function() { 
		var axes = dg.axes.objects[0];
		var xmin = axes._xaxis._dmin;
		var xmax = axes._xaxis._dmax;
		var ymin = axes._yaxis._dmin;
		var ymax = axes._yaxis._dmax;
		
		var i = xmin;
		var p0 = dg.geom.transform([i, this.f(i)]);
		var p1;
		
		while(i < xmax) {
			p1 = dg.geom.transform([i + this._step, this.f(i + this._step)]);
			if(this.f(i) < ymax + this._step && this.f(i+this._step) > ymin - this._step)
				dg_draw_segment(p0, p1, this._color, this._size);
			
			p0 = p1;
			i+= this._step;
		}
	}

	/* dg.geom.Intersection */
	/* ll -- line line intersection */
	dg.geom.Intersection = function() {
		this._intersections = [];
		this._g0 = arguments[0];
		this._g1 = arguments[1];
		this._eps = 0.001;
		this._type = INTERSECTION;
		
		if(typeof this._g0.isFunction !== 'function' && typeof this._g0.isFunction !== 'function') {
			/* add dependencies */
			this._g0._p0._d.push(this);
			this._g0._p1._d.push(this);
			this._g1._p0._d.push(this);
			this._g1._p1._d.push(this);
		}
		
		
		if(typeof this._g0.isLine === 'function' && typeof this._g1.isLine === 'function') {
			this.ll();

		}
		if(typeof this._g0.isCircle === 'function' && typeof this._g1.isCircle === 'function') {
			this.cc();
		}
		if(typeof this._g0.isFunction === 'function' && typeof this._g1.isFunction === 'function') {
			this._root0 = dg.axes.objects[0]._xaxis._dmin;
			this._root1 = dg.axes.objects[0]._xaxis._dmax;
			
			if(arguments.length > 2) {
				this._root0 = arguments[2][0];
				this._root1 = arguments[2][1];
			}
				
			this.ff();
		}
		if(typeof this._g0.isLine === 'function' && typeof this._g1.isCircle === 'function') {
			this.lc();
		}
		
		return this;
	}
	dg.geom.Intersection.prototype.isIntersection = function() {
		return true;
	}

	dg.geom.Intersection.prototype.recalc = function() {
		var t0 = this._g0._type;
		var t1 = this._g1._type;
		if(typeof this._g0.isLine === 'function' && typeof this._g1.isLine === 'function') {
			this.recalc_ll();
		} else if(typeof this._g0.isCircle === 'function' && typeof this._g1.isCircle === 'function') {
			this.recalc_cc();
		} else if(typeof this._g0.isFunction === 'function' && typeof this._g1.isFunction === 'function') {
			this.recalc_ff();
		} else if(typeof this._g0.isLine === 'function' && typeof this._g1.isCircle === 'function') {
			this.recalc_lc();
		}
	}
	dg.geom.Intersection.prototype.draw = function() {
		for(var i = 0; i < this._intersections.length; i++) {
			this._intersections[i].draw();
		}

	}
	dg.geom.Intersection.prototype.get = function(i) {
		return this._intersections[i];
	}
	dg.geom.Intersection.prototype.lc = function() {
		var p = this._g0;
		var c = this._g1;
		
		var r = c._p0.dist(c._p1);
		var pl = new dg.geom.PerpendicularLine(c._p0, p);
		var f0 = new dg.geom.Intersection(pl, p);
		var d = f0.get(0).dist(c._p0);

		var v = new dg.geom.Vector(p._p0.xy());
		v = v.add(new dg.geom.Point([-p._p1.x(), -p._p1.y()]));
		v = v.mul(1/(v.norm()));

		var a = Math.sqrt(Math.pow(r, 2) - Math.pow(d, 2));
		if(d < r && dg.abs(d-r) > this._eps) {
			/* intersects circle at two points */
			var f1 = new dg.geom.Point(v.mul(a).add(f0.get(0)).xy());
			var f2 = new dg.geom.Point(v.mul(-a).add(f0.get(0)).xy());
			f1._free = false;
			f2._free = false;
			f1._label = "P0";
			f2._label = "P1";
			
			this._intersections.push(f1);
			this._intersections.push(f2);
		} else if(dg.abs(d-r) < this._eps) {
			/* one point intersection */
			f0.get(0)._free = false;
			this._intersections.push(f0.get(0));
		} else {
			this._intersections = [];
		}
	}
	dg.geom.Intersection.prototype.recalc_lc = function() {
		var p = this._g0;
		var c = this._g1;
		
		var r = c._p0.dist(c._p1);
		var pl = new dg.geom.PerpendicularLine(c._p0, p);
		var f0 = new dg.geom.Intersection(pl, p);
		var d = f0.get(0).dist(c._p0);

		var v = new dg.geom.Vector(p._p0.xy());
		v = v.add(new dg.geom.Point([-p._p1.x(), -p._p1.y()]));
		v = v.mul(1/(v.norm()));

		var a = Math.sqrt(Math.pow(r, 2) - Math.pow(d, 2));
		if(d < r && dg.abs(d-r) > this._eps) {
			/* intersects circle at two points */
			if(this._intersections.length < 2) {
				this._intersections = [];
				var f1 = new dg.geom.Point(v.mul(a).add(f0.get(0)).xy());
				var f2 = new dg.geom.Point(v.mul(-a).add(f0.get(0)).xy());
				f1._free = false;
				f2._free = false;
				f1._label = "P0";
				f2._label = "P1";
				this._intersections.push(f1);
				this._intersections.push(f2);				
			} else {
				this._intersections[0].x(v.mul(a).add(f0.get(0)).x()).y(v.mul(a).add(f0.get(0)).y());
				this._intersections[1].x(v.mul(-a).add(f0.get(0)).x()).y(v.mul(-a).add(f0.get(0)).y());
			}
		} else if(dg.abs(d-r) < this._eps) {
			/* one point intersection */
			this._intersections[0].x(f0.get(0).x()).y(f0.get(0).y());
		} else {
			this._intersections = [];
		}		
	}
	dg.geom.Intersection.prototype.ff = function() {
		var i = dg.min([this._root0, this._root1]);
		var f0 = this._g0;
		var f1 = this._g1;

		this._intersections = [];
		var c = 0;
		var step = f0._step / 10.0;
		while(i < dg.max([this._root0, this._root1])) {
			if(dg.abs(f0.f(i) - f1.f(i)) < this._eps) {
				var p = new dg.geom.Point([i, f0.f(i)]);
				p._free = false;
				p._label = "P" + c;
				c++;
				this._intersections.push(p);
				i+= step;
			}
			i+= step;
		}

		return this._intersections;
	}
	dg.geom.Intersection.prototype.cc = function() {
		var points = dg_intersect_circles(this._g0, this._g1);
		points[0]._free = false;
		points[1]._free = false;
		
		this._intersections = [];
		this._intersections.push(points[0]);
		this._intersections.push(points[1]);
		
		return this._intersections;		
	}
	dg.geom.Intersection.prototype.recalc_cc = function() {
		/* c0, c1 - circles d < |r0 + r1| assumption for 2 point intersection */
		var points = dg_intersect_circles(this._g0, this._g1);	

		this._intersections[0].x(points[0].x()).y(points[0].y());
		this._intersections[1].x(points[1].x()).y(points[1].y());
	}
	dg.geom.Intersection.prototype.ll = function() { 
		// assuming k1 * k2 !== -1 
		var k1 = (this._g0._p1.y() - this._g0._p0.y())/(this._g0._p1.x() - this._g0._p0.x());
		var k2 = (this._g1._p1.y() - this._g1._p0.y())/(this._g1._p1.x() - this._g1._p0.x());
		var n1 = -this._g0._p0.x() * k1 + this._g0._p0.y();
		var n2 = -this._g1._p0.x() * k2 + this._g1._p0.y();
		

		var x = (n2 - n1) / (k1 - k2);
		var y = k1 * x + n1;
		
		if(this._g0._p1.x() - this._g0._p0.x() == 0) {
			x = this._g0._p1.x();
			y = k2 * x + n2;
		} else if(this._g1._p1.x() - this._g1._p0.x() == 0) {
			x = this._g1._p1.x();
			y = k1 * x + n1;
		}
		
		var p = new dg.geom.Point([x, y]);
		p._free = false;
		
		this._intersections = [];
		this._intersections.push(p);
		
		return this._intersections[0];
	}
	dg.geom.Intersection.prototype.recalc_ll = function() {
		var k1 = (this._g0._p1.y() - this._g0._p0.y())/(this._g0._p1.x() - this._g0._p0.x());
		var k2 = (this._g1._p1.y() - this._g1._p0.y())/(this._g1._p1.x() - this._g1._p0.x());
		var n1 = -this._g0._p0.x() * k1 + this._g0._p0.y();
		var n2 = -this._g1._p0.x() * k2 + this._g1._p0.y();
		
		var x = (n2 - n1) / (k1 - k2);
		var y = k1 * x + n1;

		if(this._g0._p1.x() - this._g0._p0.x() == 0) {
			x = this._g0._p1.x();
			y = k2 * x + n2;
		} else if(this._g1._p1.x() - this._g1._p0.x() == 0) {
			x = this._g1._p1.x();
			y = k1 * x + n1;
		}
		
		this._intersections[0].x(x).y(y);		
	}
	dg.geom.Intersection.prototype.hide = function() {
		for (i = 0; i < this._intersections.length; i++)
			this._intersections[i].hide();
	}


	dg.canvas = {};

	dg.canvas.Canvas = function (elName, opts) {
		if(dg_document.getElementById(elName) !== null) {
			this._ce = dg_document.getElementById(elName);
			this._ce.width = opts.width;
			this._ce.height = opts.height;

			dg_canvas_element = this._ce;
			this._cw = dg_canvas_width = this._ce.getAttribute("width");
			this._ch = dg_canvas_height = this._ce.getAttribute("height");
			this._cc = dg_canvas_context = this._ce.getContext("2d");
			
			dg_canvas_context.lineWidth = 1;
			
			if(opts.border)
				this._ce.style.border = opts.border;
	
			this._ce.style.cursor = "crosshair";
			/* events */
			this._events = new dg.event.Events(this._ce);
		
			return this;
		}
	}
	dg.canvas.Canvas.prototype.width = function() {
		return this._cw;
	}
	dg.canvas.Canvas.prototype.height = function() {
		return this._ch;
	}
	dg.canvas.Canvas.prototype.canvasNode = function() {
		return this._ce;
	}
	dg.Canvas = function() {
		if(arguments.length > 1) {
			if(!arguments[1].width && !arguments[1].height) {
				arguments[1].width = 800;
				arguments[1].height = 600;
			}
			var canvas = new dg.canvas.Canvas(arguments[0], arguments[1]);
		} else {
			var canvas = new dg.canvas.Canvas(arguments[0], { border: "none", width: 800, height: 600 });
		}
		return canvas;
	}
	/* dg events */
	dg.event = {};
	dg.event.Events = function(elem) {
		this._el = elem;
		this._md = false;
		this._mu = true;
		this._g = false;

		this._v = new dg.geom.Vector(new dg.geom.Point([0,0]));
		this._el.addEventListener('mousemove', this.mouse_move, false);
		this._el.addEventListener('mousedown', this.mouse_down, false);
		this._el.addEventListener('mouseup', this.mouse_up, false);
		this._el.addEventListener("mousewheel", this.mouse_wheel, false);
		this._el.addEventListener("DOMMouseScroll", this.mouse_wheel_ff, false);		
	}
	dg.event.Events.prototype.mouse_down = function(e) {
		this._mu = false;
		this._md = true;
		this._g = false;

			var pos = dg_get_mouse_pos(e);
			this._v = new dg.geom.Vector(dg.geom.transform_inverse([pos.x,pos.y]));
			
			for(var i = 0; i < dg.geom.objects.length; i++) {
				
				if(dg.geom.objects[i]._type === POINT && dg.geom.objects[i]._free === true) {
					var geom = dg.geom.transform(dg.geom.objects[i].xy());
					if(new dg.geom.Point(geom).dist(new dg.geom.Point([pos.x, pos.y])) < 15) {
		
						/* set object to manipulate */
						this._g = dg.geom.objects[i];
						/* dispatch if click event registered */
						if(this._g._events['click'] != undefined)
							this._g._events['click'].dispatch();		
						/* object found within range exit loop */						
						break;
					}
					
				}

			}			
		
	}
	dg.event.Events.prototype.mouse_up = function(e) {
		this._md = false;
		this._g = false;
		this._gselected = false; 
		this._mu = true;
		dg_canvas_element.style.cursor = "crosshair";
		dg_repaint();
	}
	dg.event.Events.prototype.mouse_move = function(e) {
		var pos = dg_get_mouse_pos(e);
		this._pos = pos;
		var that = this;
		/*  */
		if(this._md === undefined) { 
			this._md = false;
			this._g = false; 
			this._ti = setInterval(object_drag, 150);
		}

		function object_drag() { 
			if( (that._md === true && typeof that._g === 'object') ) { 
				// repaint every 150ms 
				dg_repaint();
			}
		}
		if(this._md === true && typeof this._g === 'object') {
				dg_canvas_element.style.cursor = "pointer";
				/* clicked and point geometry selected */
				var gpos = dg.geom.transform_inverse([this._pos.x, this._pos.y]);
			
				this._g.x(gpos[0]);
				this._g.y(gpos[1]);
				/* recalculate dependent geom objects */
			
				this._g._d.recalc();
		} else if(this._md === false && typeof this._g !== 'object') { 
			for(var i = 0; i < dg.geom.objects.length; i++) {

				if(dg.geom.objects[i]._type === POINT && dg.geom.objects[i]._free === true) {
					var geom = dg.geom.transform(dg.geom.objects[i].xy());
					if(new dg.geom.Point(geom).dist(new dg.geom.Point([pos.x, pos.y])) < 11 + dg.geom.objects[i]._size) {
					
					
						dg_draw_circle_fill(geom, 2 + dg.geom.objects[i]._size, dg.geom.objects[i]._color, 1);
						
						dg_repaint();
						break; // exit loop
					}
				}

			}
		} 
		
		if(this._md === true && this._g === false) {
			var apos = new dg.geom.Point(dg.geom.transform_inverse([this._pos.x, this._pos.y]));
			var axes = dg.axes.objects[0];
			
			/* axes movement */
			dg_canvas_element.style.cursor = "pointer";
			axes._xaxis._o.x(axes._xaxis._o.x() + this._pos.x - dg.geom.transform(this._v.xy())[0]);
			axes._xaxis._o.y(axes._xaxis._o.y() + this._pos.y - dg.geom.transform(this._v.xy())[1]);
			axes._yaxis._o.x(axes._xaxis._o.x() + this._pos.x - dg.geom.transform(this._v.xy())[0]);
			axes._yaxis._o.y(axes._xaxis._o.y() + this._pos.y - dg.geom.transform(this._v.xy())[1]);
			dg_repaint();
		}
				
	};
	dg.event.Events.prototype.mouse_wheel = function(e) {
		var d = dg_get_mouse_pos(e);
		var p = new dg.geom.Vector([d.x - dg.axes.objects[0]._xaxis._o.x() , -(d.y - dg.axes.objects[0]._yaxis._o.y())]).mul(0.1);
		var axes = dg.axes.objects[0];
		
		if(e.wheelDelta > 0) { 
			axes._xaxis._cu *= 1.05;
			axes._yaxis._cu *= 1.05;
			axes._xaxis._o.x(axes._xaxis._o.x() - p.x() * .5);
			axes._yaxis._o.y(axes._yaxis._o.y() + p.y() * .5);

		} else if(e.wheelDelta < 0) {
			axes._xaxis._cu *= .95;
			axes._yaxis._cu *= .95;
			axes._xaxis._o.x(axes._xaxis._o.x() + p.x() * .5);
			axes._yaxis._o.y(axes._yaxis._o.y() - p.y() * .5);						
		}
		dg_clear_canvas();
		dg_repaint();	
	}
	dg.event.Events.prototype.mouse_wheel_ff = function(e) {
		var d = dg_get_mouse_pos(e);
		var p = new dg.geom.Vector([d.x - dg.axes.objects[0]._xaxis._o.x() , -(d.y - dg.axes.objects[0]._yaxis._o.y())]).mul(0.1);
		var axes = dg.axes.objects[0];
		
		if(e.detail < 0) { 
			axes._xaxis._cu *= 1.05;
			axes._yaxis._cu *= 1.05;
			axes._xaxis._o.x(axes._xaxis._o.x() - p.x() * .5);
			axes._yaxis._o.y(axes._yaxis._o.y() + p.y() * .5);
			
		} else if(e.detail > 0) {
			axes._xaxis._cu *= .95;
			axes._yaxis._cu *= .95;
			axes._xaxis._o.x(axes._xaxis._o.x() + p.x() * .5);
			axes._yaxis._o.y(axes._yaxis._o.y() - p.y() * .5);			
		}
		dg_clear_canvas();
		dg_repaint();
	}
	
	function dg_get_mouse_pos(e) {
		var rect = e.target.getBoundingClientRect();
		return {
			x: e.clientX - rect.left,
			y: e.clientY - rect.top
		}
	}
	
	if (typeof define === "function" && define.amd) define(dg); else if (typeof module === "object" && module.exports) module.exports = dg;
	this.dg = dg;
}();
