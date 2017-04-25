/**
 * Created by Stephen on 4/25/2017.
 */

class NavMesh{
  constructor(){

    // test/debugging zone
    // raycast on line segments

    // point in triangle test either declaration works
    //let pt = vec3.create(); vec3.set(pt, 0.1, 0.01, 0);
    let pt = [0, 0, 0];
    //let v0 = vec3.create(); vec3.set(v0, 0, 0, 0);
    let v0 = [0, 0, 0];
    //let v1 = vec3.create(); vec3.set(v1, 0, 1, 0);
    let v1 = [0, 2, 0];
    // let v2 = vec3.create(); vec3.set(v2, 1, 0, 0);
    let v2 = [2, 0, 0];

    console.log("NavMesh check: ");
    console.log(pt);
    console.log(v0);
    console.log(v1);
    console.log(v2);
    console.log(this.isPointInTriangle2D(pt, v0, v1, v2));
  }

  // If the pt is on the line, the pt is considered to be INSIDE the triangle
  isPointInTriangle2D(pt, v0, v1, v2){
    let b0 = this._sign(pt, v0, v1) <= 0.0;
    let b1 = this._sign(pt, v1, v2) <= 0.0;
    let b2 = this._sign(pt, v2, v0) <= 0.0;

    return ((b0 === b1) && (b1 === b2));
  }

  // Appears to be some sort of cross product
  _sign(pt0, pt1, pt2){
    return (pt0[0] - pt2[0]) * (pt1[1] - pt2[1]) - (pt1[0] - pt2[0]) * (pt0[1] - pt2[1]);
  }

  rayIntersectsSegment(ray2D, lineSegment, maxDistance = Number.POSITIVE_INFINITY, hitDistance){
    let seg = [0, 0];
    seg[0] = lineSegment[1][0] - lineSegment[0][0];
    seg[1] = lineSegment[1][1] - lineSegment[0][1];

    let segPerp = [seg[1], -seg[0]];
    let perpDotd = this.dot2D(ray2D.direction, segPerp);
    if(perpDotd <= Number.EPSILON && perpDotd >= Number.EPSILON){
      hitDistance.dist = Number.POSITIVE_INFINITY;
      return false;
    }

    let d = [lineSegment[0][0] - ray2D.origin[0], lineSegment[0][1] - ray2D.origin[1]];

    hitDistance.dist = this.dot2D(segPerp, d) / perpDotd;
    let s = this.dot2D([ray2D.direction[1], -ray2D.direction[0]], d) / perpDotd;

    return hitDistance.dist >= 0.0 && hitDistance.dist <= maxDistance && s >= 0.0 && s <= 1.0;
  }
}