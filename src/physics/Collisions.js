import { Manifold } from "./Manifold.js"

export class Collisions {
  
  constructor() {
    
  }
  
  static dispatch = [
    [Collisions.CirVsCir, Collisions.CirVsPoly],
    [Collisions.PolyVsCir, Collisions.PolyVsPoly]
  ];
  

  


  static findCollisions(bodyA, bodyB) {
    return Collisions.dispatch[bodyA.shape][bodyB.shape](bodyA, bodyB);
  }

  static CirVsCir(c1, c2) {
    const diff = c2.pos.clone().sub(c1.pos);
    
    const disSq = diff.lengthSq();
    const rSum = c1.r + c2.r;
    if(disSq >= rSum * rSum) return null;

    
    const normal = diff.normalize();
    
    const dis = Math.sqrt(disSq);
    const pen = rSum - dis;
    
    const contact = c1.pos.clone()
      .add(normal.clone().scale(c1.r - pen / 2));

    return new Manifold(c1, c2, normal, pen, [contact]);
    
  }

  static PolyVsPoly(p1, p2) {
    const vs1 = p1.worldVerts;
    const vs2 = p2.worldVerts;

    let bestAxis, bestEdge, bestOverlap = Infinity;
    let refPoly, refEdgeIdx, incPoly, incEdgeIdx, refVerts, incVerts;






    
    for (let idx = 0; idx < vs1.length; idx++) {
  const v1 = vs1[idx];
  const edge = vs1[(idx + 1) % vs1.length].clone().sub(v1);
  const normal = edge.normal();

  const faceValue = v1.dot(normal);

  let support = Infinity;
  for (let v2 of vs2) support = Math.min(support, v2.dot(normal));

  const separation = support - faceValue;
  if (separation > 0) return null;

  const overlap = -separation;
  if (overlap < bestOverlap) {
    bestOverlap = overlap;
    bestAxis = normal;
    refPoly = p1;
    refVerts = vs1;
    refEdgeIdx = idx;
  }
      
}


    for (let idx = 0; idx < vs2.length; idx++) {
  const v2 = vs2[idx];
  const edge = vs2[(idx + 1) % vs2.length].clone().sub(v2);
  const normal = edge.normal();

  const faceValue = v2.dot(normal);

  let support = Infinity;
  for (let v1 of vs1) support = Math.min(support, v1.dot(normal));

  const separation = support - faceValue;
  if (separation > 0) return null;

  const overlap = -separation;
  if (overlap < bestOverlap) {
    bestOverlap = overlap;
    bestAxis = normal;
    refPoly = p2;
    refVerts = vs2;
    refEdgeIdx = idx;
  }
      
}






    if(refPoly == p1) {
      incPoly = p2;
      incVerts = vs2;
    } else {
      incPoly = p1;
      incVerts = vs1;
    }
    incEdgeIdx = Collisions.findIncidentEdge(incVerts, bestAxis);

    const r1 = refVerts[refEdgeIdx],
          r2 = refVerts[(refEdgeIdx + 1) % refVerts.length],
          i1 = incVerts[incEdgeIdx],
          i2 = incVerts[(incEdgeIdx + 1) % incVerts.length];

    

    
    const contacts = Collisions.clipEdge(r1, r2, i1, i2, bestAxis);
    

    
    if(bestAxis.dot(p2.pos.clone().sub(p1.pos)) < 0) {
      bestAxis.negate();
    }


    return new Manifold(p1, p2, bestAxis, bestOverlap, contacts);

    
  }

  static CirVsPoly(c, p) {

    const verts = p.worldVerts;
    let bestOverlap = Infinity;
    let bestAxis;

    
    for(let idx = 0; idx < verts.length; idx++) {
      const v = verts[idx];
      const edge = verts[(idx + 1) % verts.length].clone().sub(v);
      const normal = edge.normal();

      let pMin = Infinity, pMax = -Infinity;
      for(let vert of verts) {
        let d = vert.dot(normal);
        pMin = Math.min(pMin, d);
        pMax = Math.max(pMax, d);
      }

      let cProj = c.pos.dot(normal);
      let cMin = cProj - c.r,
          cMax = cProj + c.r;

      let overlap = Math.min(cMax, pMax) - Math.max(cMin, pMin);
      if(overlap < 0) return null;

      if(overlap < bestOverlap) {
        bestOverlap = overlap;
        bestAxis = normal;
      }

      
      
    }


    let closestAxis = c.pos.clone().sub(verts[0]);
    let closestDist = closestAxis.lengthSq();
    for(let idx = 1; idx < verts.length; idx++) {
      let _axis = c.pos.clone().sub(verts[idx]);
      let _axisDist = _axis.lengthSq();
      if(_axisDist < closestDist) {
        closestDist = _axisDist;
        closestAxis = _axis;
      }
    }

    if(closestDist > 0.001) {
    closestAxis.normalize();
    let pMin = Infinity;
    let pMax = -Infinity;
    for(let vert of verts) {
      let d = vert.dot(closestAxis);
      pMin = Math.min(pMin, d);
      pMax = Math.max(pMax, d);
    }
    let cProj = c.pos.dot(closestAxis);
    let cMin = cProj - c.r;
    let cMax = cProj + c.r;
    let overlap = Math.min(cMax, pMax) - Math.max(cMin, pMin);
    if(overlap < 0) return null;
    if(overlap < bestOverlap) {
      bestOverlap = overlap;
      bestAxis = closestAxis;
    }
    }

    if(p.pos.clone().sub(c.pos).dot(bestAxis) < 0) {
      bestAxis.negate();
    }

    let contact = c.pos.clone().add(bestAxis.clone().scale(c.r));

    

    return new Manifold(c, p, bestAxis, bestOverlap, [contact]);

    
    
  }

  static PolyVsCir(p, c) {
    /*const m = Collisions.CirVsPoly(c, p);
    if(m) {
      m.normal.mult(-1);
      [m.bodyA, m.bodyB] = [m.bodyB, m.bodyA];
    }
    return m;*/
    return Collisions.CirVsPoly(c, p);
  }


  



  static clipEdge(r1, r2, i1, i2, refNormal) {
  const r = r2.clone().sub(r1).normalize();
  let cp = Collisions.clip(r1, r, i1, i2);
  if(cp.length < 2) return [];

  
  cp = Collisions.clip(r2, r.clone().negate(), cp[0], cp[1]);
  if(cp.length < 2) return [];

  const contacts = [];
  const refDist = refNormal.dot(r1);
  for(let p of cp) {
    const d = p.dot(refNormal) - refDist;
    if(d <= 0) contacts.push(p);
  }

  return contacts;
}

  static clip(a, r, p1, p2) {
  const output = [];
  const d0 = p1.clone()
               .sub(a)
               .dot(r);
  const d1 = p2.clone()
               .sub(a)
               .dot(r);
  if(d0 >= 0) output.push(p1);
  if(d1 >= 0) output.push(p2);

  if((d0 > 0 && d1 < 0) || (d0 < 0 && d1 > 0)) {
    const frac = d0 / (d0 - d1);
    output.push(p1.clone().add(p2.clone().sub(p1).scale(frac)));
  }

  return output;
}



  static findIncidentEdge(vertices, normal) {
  let minDot = Infinity, incEdgeIdx;

  for(let idx = 0; idx < vertices.length; idx++) {

    const dot = vertices[(idx + 1) % vertices.length].clone().sub(vertices[idx]).normal().dot(normal);

    if(dot < minDot) {
      minDot = dot;
      incEdgeIdx = idx;
    }

    
  }


  return incEdgeIdx;
  }


  
}
