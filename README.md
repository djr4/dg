# dg.js
**dg.js** is javascript library for dynamic geometry. **DG** helps you to explore relationship between 
geometry objects and provides easy way to draw objects on canvas. 

# Resources

- [Examples](http://)

# API Reference

Everything in **dg** is scoped under `dg` namespace

DG uses semantic versioning. You can find current version of dg as `dg.version`

## dg.geom namespace

### dg.geom.Point class

Constructor: Point ([number: x,number: y])
Return Value: reference to created point.

Methods:

	`x(?number n)`  gets/sets x coordinate **not to be used in animation**
	
	`y(?number n)`  gets/sets y coordinate **not to be used in animation**
	
	`free(boolean b)`  Locks point interaction on canvas
	
	`label(?string s)`  get/sets point label
	
	`xy()`  gets point coordinates as array
	
	`dist(Point p)`  returns euclid distance between two points
	
	`setX(number n)`  sets x coordinate of a point **use for animation**
	
	`setY(number n)`  sets y coordinate of a point **use for animation**
	

### dg.geom.Midpoint

Constructor: Midpoint (Point p0, Point p1)
Return Value: reference to created midpoint dependent on p0, p1

### Geometry type ids
-1 point, 
-2 vector,
-3  midpoint,
-4  line,
-5  segment,
-6  perpendicular line,
-7  perpendicular bisector,
-8  parallel line,
-9  angle bisector,
-10  circle,
-11  tangent,
-12  polygon,
-13  function,
-14  intersection
-15  angle
