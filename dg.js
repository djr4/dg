/* 
	dynamic geometry v1.0.1 (dg.js)
	Djordje Rakonjac
		rakonjac.djordje@gmail.com
	Mentor: Filip Maric
		filip@matf.bg.ac.rs
	Faculty of Mathematics, University of Belgrade, December, 2015
*/

!function() {
 
	var dg = {
		version: "1.0.1"
	};
	
	var dg_document = this.document;
	var dg_canvas_context;
	var dg_canvas_width, dg_canvas_height;
	var dg_canvas_element;
	
	function dg_repaint() {
		dg_clear_canvas();
		dg_draw_axes();
		dg_draw_objects();
	}
	
	function dg_abs(x) {
		return x >= 0 ? x : -x;
	}
	/* min, max */
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
	dg.abs = dg_abs;
	dg.max = dg_max;
	dg.min = dg_min;

	
	function dg_square(d) {
		for(var i = 0 ; i < d.length; i++) {
			d[i] = d[i] * d[i];
		}
		return d;
	}
	
	dg.rotate = dg_rotate;
	dg.square = dg_square;
		
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
	
	dg.LinearScale = function() {
		return new dg.scale.Linear();
	}
	dg.IdentityScale = function() {
		return new dg.scale.Identity();
	}
	
	dg.scale = {};
	
	dg.scale.Identity = function() {
		this.a = 0;
		this.b = 1;
		this.c = 0;
		this.d = 1;		
	}
	dg.scale.Identity.prototype.scale = function(i) {
		return i;
	}

	dg.scale.Linear = function() { return this; }
	dg.scale.Linear.prototype = new dg.scale.Identity();
	dg.scale.Linear.prototype.scale = function(i) {
		var n = (i - this.a) / ( this.b - this.a);
		var o = (this.d - this.c) * n + this.c;
		
		return o;
	}
	dg.scale.Linear.prototype.inverse = function(i) {
		var n = (i - this.c) / (this.d - this.c);
		var o = (this.b - this.a) * n + this.a;
		
		return o;
	}
	dg.scale.Linear.prototype.domain = function(x) {
		this.a = dg.min(x);
		this.b = dg.max(x);
		return this;
	}
	dg.scale.Linear.prototype.range = function(x) {
		this.c = dg.min(x)
		this.d = dg.max(x);
		return this;
	}
	dg.scale.Linear.prototype.normalize = function(i) {
		return (i - this.a) / ( this.b - this.a);
	}
	
	/* draw objects */
	function dg_draw_objects() {
		/* prioratize points */
		var points_pos = [];
		if(dg.geom.objects.length > 0) {
			for(var i = dg.geom.objects.length - 1; i > -1; i--) {
				if(dg.geom.objects[i]._type == 14 || dg.geom.objects[i]._type == 1 || dg.geom.objects[i]._type == 3) {
					points_pos.push(i);
					continue;
				}
				dg.geom.objects[i].draw();
			}
			for(var i = points_pos.length - 1; i > -1; i--) {
				dg.geom.objects[points_pos[i]].draw();
			}
		}
	}

	/* geometry */
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
		return this;
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
				dg_draw_segment([this._o.x() + i * this._cu, this._o.y()], [this._o.x() + i * this._cu, this._o.y() + 4], "#303030");
				
				i+= this._ticks[this._tick];
			}
			
			dg_draw_label([this._o.x() - 15  , this._o.y() - 8] , 0 , "#303030", "11 px arial");	
			while(i1 > l) {
				dg_draw_label([this._o.x() + i1 * this._cu  , this._o.y() + 15] , Math.round(i1 * Math.pow(10, precision))/Math.pow(10, precision) , "#303030", "12 px arial");
				dg_draw_segment([this._o.x() + i1 * this._cu, this._o.y()], [this._o.x() + i1 * this._cu, this._o.y() + 4], "#303030");
				
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
				dg_draw_segment([this._o.x(), this._o.y() - i * this._cu], [this._o.x() - 4, this._o.y() - i * this._cu], "#303030");
				
				i+= this._ticks[this._tick];
			}
			while(i1 > l) {
				dg_draw_label([this._o.x() - 15 - 3 * precision, this._o.y() - i1 * this._cu] , Math.round(i1 * Math.pow(10, precision))/Math.pow(10, precision) , "#303030", "12 px arial");
				dg_draw_segment([this._o.x(), this._o.y() - i1 * this._cu], [this._o.x() - 4, this._o.y() - i1 * this._cu], "#303030");
				
				i1-= this._ticks[this._tick];				
			}
		
		}
	}
	dg.axes.Axis.prototype.draw = function(a) {
		if(a === "x") {
			dg_draw_line([0, this._o.y()], [1, this._o.y()], "#303030");
			this._drawTicks("x");
		} else if(a === "y") {
			dg_draw_line([this._o.x(), 0], [this._o.x(), 1], "#303030");
			this._drawTicks("y");
		}
		
	}
	
	dg.axes.Axes = function(o) {
		this._o = o;
		this._xaxis = new dg.axes.Axis(o, [-4.3, 23.02], [0, dg_canvas_width]);
		this._yaxis = new dg.axes.Axis(o, [-5.98, 6.3], [0, dg_canvas_height]);
		
		return this;
	}
	dg.axes.Axes.prototype.draw = function() { 
		this._xaxis.draw("x");
		this._yaxis.draw("y");
	}
	
	dg.geom = {}; 
	dg.geom.objects = [];

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
	function dg_draw_label(p, t, s, f) {
		dg_canvas_context.fillStyle = s;
		dg_canvas_context.font = f;
		dg_canvas_context.textAlign = "center";
		dg_canvas_context.textBaseline = "middle";
		dg_canvas_context.fillText(t, p[0],p[1]);
	}
	function dg_draw_segment(d0, d1, style) {
		dg_canvas_context.strokeStyle = style;
		dg_canvas_context.beginPath();
		dg_canvas_context.moveTo(d0[0], d0[1]);
		dg_canvas_context.lineTo(d1[0], d1[1]);
		dg_canvas_context.stroke();
	}
	function dg_draw_polygon(d, ss, sf) { 
		dg_canvas_context.fillStyle = sf;
		dg_canvas_context.strokeStyle = ss;
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
	function dg_draw_line(d0, d1, style) {
		dg_canvas_context.strokeStyle = style;
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
	function dg_draw_circle(p, r, style) {
		dg_canvas_context.strokeStyle = style;
		dg_canvas_context.beginPath();
		dg_canvas_context.arc(p[0], p[1], r, 0, 2 * Math.PI, true);
		dg_canvas_context.lineWidth = 1;
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
	
	function dg_draw_circle_fill(p, r, style) {
		dg_canvas_context.fillStyle = style;
		dg_canvas_context.beginPath();
		dg_canvas_context.arc(p[0], p[1], r, 0, 2 * Math.PI, true);
		dg_canvas_context.lineWidth = 1;
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
	
	/* dg.geom.Intersection */
	/* ll -- line line intersection */
	dg.geom.Intersection = function() {
		this._intersections = [];
		this._g0 = arguments[0];
		this._g1 = arguments[1];
		this._eps = 0.001;
		this._type = 14;
		
		var t0 = this._g0._type;
		var t1 = this._g1._type;
		
		if(t0 !== 13 && t1 !== 13) {
			/* add dependencies */
			this._g0._p0._d.push(this);
			this._g0._p1._d.push(this);
			this._g1._p0._d.push(this);
			this._g1._p1._d.push(this);
		}
		
		
		if((t0 == 4 || t0 == 5 || t0 == 6 || t0 == 7 || t0 == 8 || t0 == 9) &&
		(t1 == 4 || t1 == 5 || t1 == 6 || t1 == 7 || t1 == 8 || t1 == 9)) {
			this.ll();

		}
		if(t0 == 10 && t1 == 10) {
			this.cc();
		}
		if(t0 == 13 && t1 == 13) {
			this._root0 = dg.axes.objects[0]._xaxis._dmin;
			this._root1 = dg.axes.objects[0]._xaxis._dmax;
			
			if(arguments.length > 2) {
				this._root0 = arguments[2][0];
				this._root1 = arguments[2][1];
			}
				
			this.ff();
		}
		if((t0 == 4 || t0 == 5) && t1 == 10) {
			this.lc();
		}
		
		return this;
	}

	dg.geom.Intersection.prototype.recalc = function() {
		var t0 = this._g0._type;
		var t1 = this._g1._type;
		if((t0 == 4 || t0 == 5 || t0 == 6 || t0 == 7 || t0 == 8 || t0 == 9) &&
		(t1 == 4 || t1 == 5 || t1 == 6 || t1 == 7 || t1 == 8 || t1 == 9)) {
			this.recalc_ll();
		} else if(t0 == 10 && t1 == 10) {
			this.recalc_cc();
		} else if(t0 == 13 && t1 == 13) {
			this.recalc_ff();
		} else if((t0 == 4 || t0 == 5) && t1 == 10) {
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
	
	dg.geom.Angle = function() {
		this._d = new dg.geom.Dependency();
		this._r = .6;
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
		this._type = 15;
		
		return this;
	}
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
		
		dg_draw_arc_fill(points, r, -this._sa, -this._sa -this._ea , "rgba(0,100,0,0.2)", "#006400");
		dg_draw_label(pc , this.deg().toFixed(0) + "°" , "#006400", "12px bold arial");
	}
	dg.geom.Vector = function(d) {
		this._x = d[0];
		this._y = d[1];
		this._type = 2;
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
		this._type = 1;
		this._label = "A" + dg_count_objects(1);
		this._free = 1;
		this._d = new dg.geom.Dependency();
		return this;
	}

	dg.geom.Point.prototype.free = function(f) {
		this._free = f;
	}
	
	dg.geom.Point.prototype.dist = function(p) {
		return Math.sqrt( Math.pow(p.x() - this._x, 2) + Math.pow(p.y() - this._y , 2) );
	}
	dg.geom.Point.prototype.xy = function() {
		return [ this._x, this._y ];
	}
	dg.geom.Point.prototype.draw = function() {
		/* faster?  */
		if(this._d.length() > 0) {
			for(var i = 0; i < this._d.length(); i++)
				this._d.get(i).recalc();
		}
		if(this._free == false)
			dg_canvas_context.fillStyle="#444444";
		else
			dg_canvas_context.fillStyle="#0000ff";
		dg_canvas_context.strokeStyle = "#202020";
		dg_canvas_context.beginPath();
		var p = dg.geom.transform([this._x, this._y]);
		dg_canvas_context.arc(p[0], p[1], 4, 0, 2 * Math.PI, true);
		dg_canvas_context.lineWidth = 1;
		dg_canvas_context.fill();
		dg_canvas_context.stroke();
		
		dg_canvas_context.font = "12px lighter arial";
		dg_canvas_context.fillText(this._label, p[0] + 12, p[1] - 12);
	}
	dg.geom.Point.prototype.x = function() {
		if(arguments.length === 0)
			return this._x;
		else {
			this._x = arguments[0];
			return this;
		}
	}
	dg.geom.Point.prototype.y = function() {
		if(arguments.length === 0)
			return this._y;
		else {
			this._y = arguments[0];
			return this;
		}
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
		
		this._type = 3;
		this._free = 0;
		return this;
	}
	dg.geom.Midpoint.prototype = Object.create(dg.geom.Point.prototype);
	dg.geom.Midpoint.prototype.constructor = dg.geom.Midpoint;
	dg.geom.Midpoint.prototype.recalc = function() { 
		var centroid = dg.centroid([this._p0, this._p1]);
		
		this._x = centroid.x();
		this._y = centroid.y();
		/* if geom dependent on midpoint recalculate */
		if(this._d.length() > 0) {
			for(var i = 0; i < this._d.length(); i++)
				this._d.get(i).recalc();
		}
			

	}
	
	dg.geom.Segment = function(p0, p1) {
		this._d = new dg.geom.Dependency();
		this._p0 = p0;
		this._p1 = p1;
		this._type = 5;
		
		return this;
	}
	dg.geom.Segment.prototype.recalc = function() {}
	
	dg.geom.Segment.prototype.draw = function() { 
		var c = "#202020";
		if(arguments.length > 0)
			c = arguments[0];
		var p0 = dg.geom.transform([this._p0.x(), this._p0.y()]);
		var p1 = dg.geom.transform([this._p1.x(), this._p1.y()]);

		dg_draw_segment(p0, p1, c);
	}
	
	dg.geom.Line = function(p0, p1) {
		this._d = new dg.geom.Dependency();
		this._p0 = p0;
		this._p1 = p1;
		this._type = 4;

		return this;
	}
	dg.geom.Line.prototype.recalc = function() {}

	dg.geom.Line.prototype.draw = function() { 
		var p0 = dg.geom.transform([this._p0.x(), this._p0.y()]);
		var p1 = dg.geom.transform([this._p1.x(), this._p1.y()]);

		dg_draw_line(p0, p1, "#202020");
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
		this._type = 6;
		
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
			this._p = new dg.geom.Midpoint(arguments[0].xy(), arguments[1].xy());
			this._l = new dg.geom.Segment(arguments[0], arguments[1]);
			
		} else {
			this._l = arguments[0];
			this._p = new dg.geom.Midpoint(this._l._p0, this._l._p1);
		}
		
		pl = dg.geom.PerpendicularLine.call(this, this._p, this._l);
		this._type = 7;

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

		this._type = 9;
		
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
		
		this._type = 8;
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
		this._type = 10;
		
		this._p0._d.push(this);
		this._p1._d.push(this);
		
		return this;
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
		
		dg_draw_circle(p, r, "#202020");
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
		this._type = 11;
	
		return this;
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
		this._type = 12;
		
		return this;
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
			
		dg_draw_polygon(p, "#993300", "rgba(255,0,0,0.2)");

	}
	
	/* dg functions */
	dg.f = {};
	dg.f.Function = function() {
		this._style = "#303030";
		if(arguments.length > 0) {
			this._f = arguments[0];
		} else 
			this._f = function() { return 0; };

		if(arguments.length > 1) {			
			this._style = arguments[1];
		}
		this._step = 0.01;
		this._type = 13;
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
				dg_draw_segment(p0, p1, this._style);
			
			p0 = p1;
			i+= this._step;
		}
	}
	dg.canvas = {};

	dg.canvas.Canvas = function (elName, opts) {
		if(dg_document.getElementById(elName) !== null) {
			this.canvasElement = dg_document.getElementById(elName);
			dg_canvas_element = this.canvasElement;
			this.canvasWidth = dg_canvas_width = this.canvasElement.getAttribute("width");
			this.canvasHeight = dg_canvas_height = this.canvasElement.getAttribute("height");
			this.canvasContext = dg_canvas_context = this.canvasElement.getContext("2d");
			
			dg_canvas_context.lineWidth = 1;
			
			if(opts.border)
				this.canvasElement.style.border = opts.border;
	
			this.canvasElement.style.cursor = "crosshair";
			/* events */
			this._events = new dg.event.Events(this.canvasElement);
		
			return dg;
		}
	}
	dg.canvas.Canvas.prototype.getContext = function() {
		return this.canvasContext;
	}
	dg.canvas.Canvas.prototype.getCanvas = function () { 
		return this.canvasElement;
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
		this._md = !this._md;
		this._mu = false;
		
			
			var pos = dg_get_mouse_pos(e);
			this._v = new dg.geom.Vector(dg.geom.transform_inverse([pos.x,pos.y]));
			
			for(var i = 0; i < dg.geom.objects.length; i++) {
				
				if(dg.geom.objects[i]._type == 1 && dg.geom.objects[i]._free == true) {
					var geom = dg.geom.transform(dg.geom.objects[i].xy());
					if(new dg.geom.Point(geom).dist(new dg.geom.Point([pos.x, pos.y])) < 15) {
		
						/* set object to manipulate */
						this._g = dg.geom.objects[i];
					}
				}

			}			
		
		dg_repaint();
		
	}
	dg.event.Events.prototype.mouse_up = function(e) {
		this._mu = !this._mu;
		this._md = false;
		this._g = false;
		dg_canvas_element.style.cursor = "crosshair";
		
		dg_repaint();
	}
	dg.event.Events.prototype.mouse_move = function(e) {
		var pos = dg_get_mouse_pos(e);
		this._pos = pos;
		
		for(var i = 0; i < dg.geom.objects.length; i++) {
			/* emp on points */
			if(dg.geom.objects[i]._type == 1 && dg.geom.objects[i]._free == true) {
				var geom = dg.geom.transform(dg.geom.objects[i].xy());
				if(new dg.geom.Point(geom).dist(new dg.geom.Point([pos.x, pos.y])) < 15) {
					//console.log("bingo! " + dg.geom.objects[i].label());
					/* emp point! */
					dg_draw_circle_fill(geom, 6, "#0000ff");
					
				}
			}

		}
		
		if(this._md == true && this._g) {
			dg_canvas_element.style.cursor = "pointer";
			/* clicked and point geometry selected */
			var gpos = dg.geom.transform_inverse([this._pos.x, this._pos.y]);
			
			this._g.x(gpos[0]);
			this._g.y(gpos[1]);
			/* recalculate dependent geom objects */
			this._g._d.recalc();
		} else if(this._md == true && !this._g) {
			var apos = new dg.geom.Point(dg.geom.transform_inverse([this._pos.x, this._pos.y]));
			var axes = dg.axes.objects[0];
			
			/* axes movement */
			dg_canvas_element.style.cursor = "pointer";
			axes._xaxis._o.x(axes._xaxis._o.x() + this._pos.x - dg.geom.transform(this._v.xy())[0]);
			axes._xaxis._o.y(axes._xaxis._o.y() + this._pos.y - dg.geom.transform(this._v.xy())[1]);
			axes._yaxis._o.x(axes._xaxis._o.x() + this._pos.x - dg.geom.transform(this._v.xy())[0]);
			axes._yaxis._o.y(axes._xaxis._o.y() + this._pos.y - dg.geom.transform(this._v.xy())[1]);
			
		}
		
		dg_repaint();		
	};
	dg.event.Events.prototype.mouse_wheel = function(e) {
		var d = dg_get_mouse_pos(e);
		var p = new dg.geom.Vector([d.x - dg.axes.objects[0]._xaxis._o.x() , -(d.y - dg.axes.objects[0]._yaxis._o.y())]).mul(0.1);
		var axes = dg.axes.objects[0];
		dg_clear_canvas();
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
		axes._xaxis.draw("x");
		axes._yaxis.draw("y");
		
		dg_draw_objects();		
	}
	dg.event.Events.prototype.mouse_wheel_ff = function(e) {
		var d = dg_get_mouse_pos(e);
		var p = new dg.geom.Vector([d.x - dg.axes.objects[0]._xaxis._o.x() , -(d.y - dg.axes.objects[0]._yaxis._o.y())]).mul(0.1);
		var axes = dg.axes.objects[0];
		dg_clear_canvas();
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
		axes._xaxis.draw("x");
		axes._yaxis.draw("y");
		
		dg_draw_objects();				
	}
	
	function dg_clear_canvas() {
		dg_canvas_context.fillStyle = "#ffffff";
		dg_canvas_context.rect(0, 0, dg_canvas_width, dg_canvas_height);
		dg_canvas_context.fill();
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