# dg.js
**dg.js** is javascript library for dynamic geometry. **DG** helps you visualize and explore relationship between 
geometry objects in intuitve and interactive way.

# Resources

- [Examples](http://alas.matf.bg.ac.rs/~mi09109/)

# API Reference

Everything in **dg** is scoped under `dg` namespace

DG uses semantic versioning. You can find current version of dg as `dg.version`

## dg.geom namespace

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

`free(boolean b)`  Locks point interaction on canvas
* Return Value: `Point`
* Example `dg.Point([0,0]).free(false);` 
	
`label(?string s)`  get/sets point label
* Return Value: `Point`
* Example `dg.Point([0,0]).size(4);`

`color(string c)` set point color
* Return Value: `Point`
* Example `dg.Point([0,0]).color('rgb(255,0,0)');`

`size(number s)` sets point size in pixels
* Return Value: `Point`
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
