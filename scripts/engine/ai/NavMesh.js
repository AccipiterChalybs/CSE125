/**
 * Created by Stephen on 4/25/2017.
 */

class NavMesh{
  constructor(){
    this.faceList = null;
    this.boundaryList = null;
    this.vertList = null;

    this.loadNavMesh("assets/scenes/ExampleLevel_Nav.json");

    // test/debugging zone
    // raycast on line segments
    // let ray = {origin: [0, 0, 1], direction: [0, 0, 1]};
    // let lineSeg = [[-1, 0, 1], [1, 0, 1]];
    // let hitDistance = {dist: null};
    // let hitResult = this.rayIntersectsSegment(ray, lineSeg, Number.POSITIVE_INFINITY, hitDistance);

    // point in triangle test either declaration works
    // let pt = [0, 0];
    // let v0 = [0, 0];
    // let v1 = [0, 2];
    // let v2 = [2, 0];
    // let result = this.isPointInTriangle2D(pt, v0, v1, v2);
  }

  loadNavMesh(filename){
    let loadID = GameEngine.registerLoading();

    let finishLoadNavMesh = this._finishLoadNavMesh;
    JsonLoader.loadJSON(filename, finishLoadNavMesh.bind(this, loadID));
  }

  _finishLoadNavMesh(loadID, data){
    if(Debug.navMesh.printLoadFinished){
      Debug.navMesh.printLoadFinishedInfo(data);
    }

    this.boundaryList = data.boundary;
    this.faceList = data.faceList;
    this.vertList = data.vertList;

    // test/debugging zone
    let pt = [20, 0, -13];
    let faceIndex = this.findFace(pt);

    GameEngine.completeLoading(loadID);
  }

  findPath(startPos, endPos, path){
    if(!startPos || !endPos) return false;

    let startFace = this.findFace(startPos);
    let endFace = this.findFace(endPos);

    // Check if the start and end are on the navmesh
    if(startFace === -1){
      startPos = this.findClosestPoint(startPos);
      startFace = this.findFace(startPos);
    }
    if(endFace === -1){
      endPos = this.findClosestPoint(endPos);
      endFace = this.findFace(endPos);
    }

    // Debug.log("startFace: " + startFace);
    // Debug.log("endFace: " + endFace);

    let searchResult = aStar.search(startFace, endFace, startPos, endPos, path);
    if(!searchResult){
      return false;
    }

    this.cleanPath(path);

    // Debug.log(path);

    return path;
  }

  // Finds the closest point ON the navmesh FROM a point OUTSIDE of the navmesh
  findClosestPoint(pt){
    let closestPt = vec3.create();
    let closestDist = Number.POSITIVE_INFINITY;
    for(let i = 0; i < this.boundaryList.length; ++i){
      let newPt = {pos: vec3.create()};
      let dist = this.distToSegmentSquared(pt, this.boundaryList[i][0], this.boundaryList[i][1], newPt);
      if(dist < closestDist){
        closestDist = dist;
        closestPt = newPt.pos;
      }
    }

    return closestPt;
  }

  cleanPath(path){
    // Debug.log([].concat(path));

    for(let i = 0; i < path.length; ++i){
      for(let j = i+2; j < path.length; ){
        // Debug.log("i: ", this.vertList[path[i]].pos, "\tj: ", this.vertList[path[j]].pos);
        // Debug.log(vec3.subtract(vec3.create(), this.vertList[path[j]].pos, this.vertList[path[i]].pos));
        let ray2D = {origin:path[i], direction: vec3.subtract(vec3.create(), path[j], path[i])};
        let distance = vec3.length(ray2D.direction) - 0.1;
        vec3.normalize(ray2D.direction, ray2D.direction);
        let raycastResult = false;

        for(let k = 0; k < this.boundaryList.length; ++k) {
          if(this.rayIntersectsSegment(ray2D, this.boundaryList[k], distance)){
            // Debug.log("(i, j): (" + i + ", " + j + ")");
            raycastResult = true;
            break;
          }
        }

        if(raycastResult === true){
          break;
        }else{
           path.splice(j - 1, 1);
        }
      }
    }

    // Debug.log("cleaned");
  }

  // If the pt is on the line, the pt is considered to be INSIDE the triangle.
  // 2D is on the x and z plane NOT x and y
  isPointInTriangle2D(pt, v0, v1, v2){
    // code from http://stackoverflow.com/questions/2049582/how-to-determine-if-a-point-is-in-a-2d-triangle
    let b0 = this._sign(pt, v0, v1) <= 0.0;
    let b1 = this._sign(pt, v1, v2) <= 0.0;
    let b2 = this._sign(pt, v2, v0) <= 0.0;

    let result = ((b0 === b1) && (b1 === b2));

    if(Debug.navMesh.printPointTriangle){
      Debug.navMesh.printPointTriangleInfo(result, pt, v0, v1, v2, b0, b1, b2);
    }

    return result;
  }

  // Appears to be some sort of cross product
  _sign(pt0, pt1, pt2){
    return (pt0[0] - pt2[0]) * (pt1[2] - pt2[2]) - (pt1[0] - pt2[0]) * (pt0[2] - pt2[2]);
  }

  findFace(pt){
    if(Debug.navMesh.printFindFace) {
      let color = vec4.create(); vec4.set(color, 0, 0, 1, 1);
      Debug.drawTeapot(pt, color);
    }

    for(let i = 0; i < this.faceList.length; ++i){
      let face = this.faceList[i].vert;

      if(this.isPointInTriangle2D(pt, face[0], face[1], face[2])){
        if(Debug.navMesh.printFindFace) {
          Debug.navMesh.printFindFaceInfo(pt, i, face);
          let teapot = new GameObject();
          let mesh = new Mesh("Teapot02");
          teapot.addComponent(mesh);
          teapot.transform.setPosition(pt);
          Debug.drawTeapot(face[0]);
          Debug.drawTeapot(face[1]);
          Debug.drawTeapot(face[2]);
        }

        return i;
      }
    }

    if(Debug.navMesh.printFindFace)
      Debug.navMesh.printFindFaceInfo(pt, -1);

    return -1;
  }

  // If collinear: ray does NOT intersect and distance = NaN
  // If ray starts on line but points elsewhere: ray does NOT intersect and distance = 0
  rayIntersectsSegment(ray2D, lineSegment, maxDistance = Number.POSITIVE_INFINITY, hitDistance = {}){
    // code from http://afloatingpoint.blogspot.com/2011/04/2d-polygon-raycasting.html
    let seg = [0, 0, 0];
    seg[0] = lineSegment[1][0] - lineSegment[0][0];
    seg[2] = lineSegment[1][2] - lineSegment[0][2];

    let segPerp = [seg[2], 0, -seg[0]];
    let perpDotd = PhysicsEngine.dot2D(ray2D.direction, segPerp);
    if(perpDotd <= Number.EPSILON && perpDotd >= 0){
      hitDistance.dist = Number.POSITIVE_INFINITY;
      return false;
    }

    let d = [lineSegment[0][0] - ray2D.origin[0], 0, lineSegment[0][2] - ray2D.origin[2]];

    hitDistance.dist = PhysicsEngine.dot2D(segPerp, d) / perpDotd;
    let s = PhysicsEngine.dot2D([ray2D.direction[2], 0, -ray2D.direction[0]], d) / perpDotd;

    let hitResult = hitDistance.dist >= Number.EPSILON && hitDistance.dist <= maxDistance && s >= 0.0 && s <= 1.0;

    if(Debug.navMesh.printRaySegment){
      Debug.navMesh.printRaySegmentInfo(hitResult, ray2D, lineSegment, maxDistance, hitDistance, s);
    }

    return hitResult;
  }

  // Code from http://stackoverflow.com/questions/849211/shortest-distance-between-a-point-and-a-line-segment
  distToSegmentSquared(p, v, w, pt) {
    let l2 = Utility.distanceSqrd2D(v, w);
    if (l2 <= Number.EPSILON) return Utility.distanceSqrd2D(p, v);
    let t = ((p[0] - v[0]) * (w[0] - v[0]) + (p[2] - v[2]) * (w[2] - v[2])) / l2;
    t = Math.max(0, Math.min(1, t));
    pt.pos = [v[0] + t * (w[0] - v[0]), 0, v[2] + t * (w[2] - v[2])];
    return Utility.distanceSqrd2D(p, pt.pos);
  }
}
NavMesh.prototype.currentNavMesh= null;
