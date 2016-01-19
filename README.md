# dg.js
**dg.js** is javascript library for dynamic geometry. **DG** helps you visualize and explore relationship between 
geometry objects in intuitve and interactive way.

# Resources

- [Examples](http://alas.matf.bg.ac.rs/~mi09109/)

# API Reference

Everything in **dg** is scoped under `dg` namespace

DG uses semantic versioning. You can find current version of dg as `dg.version`

## dg.canvas namespace 

#### dg.canvas.Canvas class

Constructor: `dg.Canvas(string elementID, ?object options)`
* Return Value: `Canvas`

`options` object 
* Example: `{ border: "1px solid #ccc", width: 800, height: 600 }`

Canvas creation example: `dg.Canvas("testcanvas", { border: '1px solid #ccc;' })`

###### Methods

`width()` gets canvas width in pixels
* Return Value: `number`
 
`height()` gets canvas height in pixels
* Return Value: `number`

## dg.axes namespace

Constructor: `dg.Axes(Vector v)`
* Return Value: `Axes`
* Example: `dg.Axes([ canvas.width() / 4, canvas.height()/ 1.5 ]).hide(false);`

_canvas_ is reference to created canvas before calling `dg.Axes` constructor!

`dg.Axes([ 250 , 300 ])`, 200 & 300 represent **begining** of _cartesian plane_ in pixels.

see `dg.geom.Vector` class under helping classes & functions. 

## dg.event namespace

#### dg.event.Events class



## dg.f namespace

#### dg.f.Function class

Constructor: 
* `dg.Function(function f)`
* `dg.Function(function f, string color)`
* Return Value: reference to created function
* Example: `dg.Function( function(x) { return Math.cos(x); } );`

###### Methods

_note that `function` refers to **javascript** function & `Function` refers to `dg.f.Function` class_

`color(string color)` sets function drawing color
* Return Value: `Function`

`f(number x)` evaluates function value at x
* Return Value: `number`

`step(number s)` precision of function drawing (careful if you use `dg.Intersect` on functions)
* Return Value: `Function`

`setF(function f)` set function to f (use for animation, _calls `dg_repaint()`_)
* Return Value: `Function`
* Example: `dg.Function( function(x) { return 0; } ).setF( function(y) { return Math.sin(y); } );`

## dg.geom namespace

#### dg.geom.Angle class

`dg.Angle` draws angle between 3 points on canvas. ** Angles are calculated and drawn up to PI radians or 180 degrees.**
 
Constructor: `dg.Angle(Point p0, Point p1, Point p2)`
* Return Value: `Angle`

###### Methods

`deg()` returns created angle in degrees
* Return Value: `number`
* Example: `dg.Angle(p0, p1, p2).deg();`

#### dg.geom.Point class

 Constructor: `Point ([number: x,number: y])`
* Return Value: reference to created point.

###### Methods:

`x(?number n)` gets/sets x coordinate **not to be used in animation**
* Return Value: `number` | `Point`
* Example `dg.Point([0,0]).x();`
	
`y(?number n)` gets/sets y coordinate **not to be used in animation**
* Return Value: `number` | `Point`
* Example `dg.Point([0,0]).y(2);` sets y coordinate to 2.

`translate(Point p)` translate point by vector built by [0,0], Point 
* Return Value: `Point`
* Example `dg.Point([0,0]).translate(new dg.geom.Point([1,1]))`

`rotate(?(Point p,) number theta)` if p supplied rotates around a Point p, otherwise around coordinate begining (counterclockwise)
* Return Value: `Point`
* Example `dg.Point([1,1]).rotate(Math.PI);` 
* Example `dg.Point([1,1]).rotate(new dg.geom.Point([1,0]), Math.PI));`

`free(boolean b)`  Locks point interaction on canvas
* Return Value: `Point`
* Example `dg.Point([0,0]).free(false);` 
	
`label(?string s)`  get/sets point label
* Return Value: `Point`
* Example `dg.Point([0,0]).size(4);`

`color()` get/set point color
* Return Value: `String`|`Point`
* Example `dg.Point([0,0]).color('rgb(255,0,0)');`

`size(number s)` get/sets point size in pixels
* Return Value: `String`|`Point`
* Example `dg.Point([0,0]).size(4);`

`xy()`  gets point coordinates as array
* Return Value: `[number, number]`
* Example `dg.Point([0,0]).xy();`
	
`dist(Point p)`  returns euclid distance between two points
* Return Value: `Point`
* Example `dg.Point([0,0]).dist(dg.Point([1,1]));`
	
`setX(number n)`  sets x coordinate of a point **use for animation** (calls repaint)
* Return Value: `Point`
* Example `dg.Point([0,0]).setX(4);
	
`setY(number n)`  sets y coordinate of a point **use for animation** (calls repaint)
* Return Value: `Point`
* Example `dg.Point([0,0]).setY(3);

`addEvent(string eventName, function callback)` registers event listener
* Return Value: `Point`
* Example `dg.Point([0,0]).addEvent('click', function() { ... });
* Events: `click` `moved`	

#### dg.geom.Midpoint

`dg.geom.Midpoint` inherits `dg.geom.Point`

Constructor: `Midpoint (Point p0, Point p1)`
* Return Value: reference to created midpoint dependent on `p0`, `p1`
* Example: `dg.Midpoint(dg.Point([0,0]), dg.Point([1,0]));`

#### dg.geom.Segment

Constructor: `Segment (Point p0, Point p1)`
* Return Value: reference to created segment dependent on `p0`, `p1`
* Example: `dg.Segment(dg.Point([0,0]), dg.Point([1,0]));`

###### Methods

`p0()` gets first point defining line segment
* Return Value: `Point`
* Example `dg.Segment(dg.Point([0,0]), dg.Point([1,0])).p0();`
	
`p1()` gets second point defining line segment
* Return Value: `Point`
* Example `dg.Segment(dg.Point([0,0]), dg.Point([1,0])).p1();` 

`color(string c)` set segment color
* Return Value: `Segment`

`attach(Point p)` attach point p to line.
* Return Value: `Segment`

#### dg.geom.MapPoint

`dg.geom.MapPoint` inherits `dg.geom.Point`

Constructor: `MapPoint (Point p, function f)`
* Return Value: reference to point mapped applying function false
* Example: `dg.MapPoint(p, function(x){ return x*x;});`

#### dg.geom.Line

Constructor: `Line (Point p0, Point p1)`
* Return Value: reference to created line dependent on `p0`, `p1`
* Example: `dg.Line(dg.Point([0,0]), dg.Point([1,0]));`

###### Methods

`p0()` gets first point defining line 
* Return Value: `Point`
* Example `dg.Line(dg.Point([0,0]), dg.Point([1,0])).p0();`
	
`p1()` gets second point defining line 
* Return Value: `Point`
* Example `dg.Line(dg.Point([0,0]), dg.Point([1,0])).p1();` 

`color(string c)` set line color
* Return Value: `Line`

`attach(Point p)` attach point p to line.
* Return Value: `Line`

#### dg.geom.PerpendicularLine

`dg.geom.PerpendicularLine` inherits `dg.geom.Line`

Constructor: `PerpendicularLine (Point p, Line l)`
* Return Value: reference to created perpendicular line dependent on `p`, `l`

#### dg.geom.PerpendicularBisector

`dg.geom.PerpendicularBisector` inherits `dg.geom.PerpendicularLine`

Constructor: 
* `PerpendicularBisector (Point p, Segment s)`
* `PerpendicularBisector (Segment s)`
* Return Value: reference to created perpendicular bisector dependent on `p`, `s` | `s`

#### dg.geom.AngleBisector

`dg.geom.AngleBisector` inherits `dg.geom.Line`

Constructor: `AngleBisector(Point p0, Point p1, Point p2)`
* Return Value: reference to created angle bisector dependent on `p0`, `p1`, `p2`

#### dg.geom.ParallelLine

`dg.geom.ParallelLine` inherits `dg.geom.Line`

Constructor: `ParallelLine(Point p, Line l)`
* Return Value: reference to created parallel line dependent on `p`, `l`

#### dg.geom.Circle

Constructor: `Circle(Point p0, Point p1)`
* Return Value: reference to created circle

###### Methods

`color(String c)` sets circle line color
* Return Value: `Circle`

#### dg.geom.Tangent

Constructor: `Tangent(Point p, Circle c)`
* Return Value: reference to created tangent lines 

#### dg.geom.Polygon

Constructor: `Polygon([Point p0, Point p1 (?,number n)])`
* Return Value: reference to created polygon
* Example: `Polygon([p0, p1], 6)` _regular poly 6 sides_
* Example: `Polygon([p0, p1, p2])` _poly created from_ **Points** `p0`, `p1`, `p2` 

###### Methods

`color(String c)` sets poly fill color
* Return Value: `Polygon`
* Example: `dg.Polygon([p0, p1], 6).color("rgba(255,0,0,0.2)");`

`stroke(String s)` sets poly stroke color
* Return Value: `Polygon`

## Helping classes & functions 

In this library `dg.geom.Vector` class turned out to be helping class to do various calculations.
Vector class does lots of calculations regarding _2d_ vectors.

Constructor: `dg.geom.Vector([number p, number q])`

###### Methods

`str()` returns nice string representation of a vector. _For debugging_.

`translate(Vector v)` translates vector position by `Vector` v.

`dot(Vector v)` returns vector dot products of current vector & vector v.

`norm()` returns norm of a vector.

`add(Vector v)` adds with current vector and returns a new vector, _imutable_.

`mul(number t)` scalar multiplication of a vector. 

`label(?string s)` gets/sets vector label. 

`xy()` returns vector coordinates as an array.

`x()` returns x coordinate of a vector.

`y()` returns y coordinate of a vector.

#### Helping functions

`dg.geom.transform` & `dg.geom.transform_inverse` are used as mapping functions from canvas to created coordinate system & vice versa.

`dg.geom.transform` returns array of coordinates on canvas in **pixels**.

`dg.geom.transform_inverse` returns array of coordinates in our **plane**. 

`dg.geom.transform_scalar(s)` returns scalar in canvas pixels.

`dg.abs(x)` returns absolute value of x. 

`dg.max(array d)` returns max value of **array** d.

`dg.min(array d)` returns min value of **array** d.

`dg.rotate(array d, number theta)` returns array of coordinates rotated by angle _theta_

`dg.square(array d)` returns squared array.

`dg.centroid(array[Points])` returns centroid `Point` of an array of _points_.

`dg.color.rand()` returns random color as string in rgb format. 
* Output example: `rgb(241,124,252)` 

### Geometry type ids

- 1 point
- 2 vector,
- 3 midpoint,
- 4  line,
- 5  segment,
- 6  perpendicular line,
- 7  perpendicular bisector,
- 8  parallel line,
- 9  angle bisector,
- 10  circle,
- 11  tangent,
- 12  polygon,
- 13  function,
- 14  intersection
- 15  angle
