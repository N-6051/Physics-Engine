import { Collisions } from "./Collisions.js"
import { Vector } from "../math/Vector.js"

export class Solver {
  
  constructor(iters = 10, grid = null) {
    this.iters = iters;
    this.noCollide = [];
    
    this.collisionCount = 0;
    this.grid = grid;
  }

  includeCollision(a, b) {
    const m = Math.min(a.id, b.id);
    const M = Math.max(a.id, b.id);
    const exclusions = this.noCollide[m];
    if(!exclusions) return;
    exclusions.delete(M);
    if(exclusions.size === 0) {
      delete this.noCollide[m];
    }
  }

  excludeCollision(a, b) {
    const m = Math.min(a.id, b.id);
    const M = Math.max(a.id, b.id);
    if(this.noCollide[m] === undefined) {
      this.noCollide[m] = new Set();
    }
    this.noCollide[m].add(M);
  }

  shouldCollide(a, b) {
    const m = Math.min(a.id, b.id);
    const M = Math.max(a.id, b.id);
    const exclusions = this.noCollide[m];
    if(exclusions === undefined) return true;
    return !exclusions.has(M);
  }


  detectCollisions(bodies) {
    this.manifolds = [];
    this.collisionCount = 0;

    if(this.grid) {
      for(const b of bodies) this.grid.insert(b, b.boundingBox.minX, b.boundingBox.minY, b.boundingBox.maxX - b.boundingBox.minX, b.boundingBox.maxY - b.boundingBox.minY);
  }
    
    for(const b1 of bodies) {
      const nearby = this.grid ? this.grid.query(b1.boundingBox.minX, b1.boundingBox.minY, b1.boundingBox.maxX - b1.boundingBox.minX, b1.boundingBox.maxY - b1.boundingBox.minY) : bodies;
      for(const b2 of nearby) {
        if(b1.id <= b2.id) continue;
        if(!this.shouldCollide(b1, b2)) continue;
        
        this.collisionCount++;

          const m = Collisions.findCollisions(b1, b2);
          if(m && m.contacts.length > 0) {
            this.preCompute(m);
            this.manifolds.push(m);
          }
      
      }
    }
    if(this.grid) this.grid.clear();
    return this.manifolds;
  }

  preCompute(m) {
    const a = m.bodyA,
          b = m.bodyB,
          n = m.normal;
    const t = new Vector(-n.y, n.x);
    m.e = Math.min(a.restitution, b.restitution);
    m.mu = Math.sqrt(a.friction * b.friction);
    m.tangent = t;

    m.contactData = [];
    for(let c of m.contacts) {
      const rA = c.clone().sub(a.pos);
      const rB = c.clone().sub(b.pos);
      
      const rAxN = rA.x * n.y - rA.y * n.x;
      const rBxN = rB.x * n.y - rB.y * n.x;

      const kN = a.invMass + b.invMass
                 + rAxN * rAxN * a.invMInertia
                 + rBxN * rBxN * b.invMInertia;

      const rAxT = rA.x * t.y - rA.y * t.x;
      const rBxT = rB.x * t.y - rB.y * t.x;

      const kT = a.invMass + b.invMass
               + rAxT * rAxT * a.invMInertia
               + rBxT * rBxT * b.invMInertia;
      
      m.contactData.push({
        rA,
        rB,
        massN: kN > 0 ? 1 / kN : 0,
        massT: kT > 0 ? 1 / kT : 0,
        jnAcc: 0,
        jtAcc: 0
      });
    }
    
  }

  solve(constraints) {
    for(let iter = 0; iter < this.iters; iter++) {
      for(let m of this.manifolds) this.solveManifold(m);
      for(let c of constraints) c.solve();
    }
  }

  solveManifold(m) {
    const a = m.bodyA;
    const b = m.bodyB;
    const n = m.normal;
    const t = m.tangent;

    for(let cd of m.contactData) {
      const { rA, rB } = cd;

      
      const dvx = (b.vel.x - b.angVel * rB.y) - (a.vel.x - a.angVel * rA.y);
       const dvy = (b.vel.y + b.angVel * rB.x) - (a.vel.y + a.angVel * rA.x);

      const vn = dvx * n.x + dvy * n.y;
      const e = (-vn > 1.0) ? m.e : 0;

      let jn = cd.massN * (-(1 + e) * vn);
    
      const jnOld = cd.jnAcc;
      cd.jnAcc = Math.max(jnOld + jn, 0);
      jn = cd.jnAcc - jnOld;


      const pnx = n.x * jn;
      const pny = n.y * jn;

      a.vel.x -= pnx * a.invMass;
      a.vel.y -= pny * a.invMass;
      a.angVel -= (rA.x * pny - rA.y * pnx) * a.invMInertia;

      b.vel.x += pnx * b.invMass;
      b.vel.y += pny * b.invMass;
      b.angVel += (rB.x * pny - rB.y * pnx) * b.invMInertia;




      





      const dvx2 = (b.vel.x - b.angVel * rB.y) - (a.vel.x - a.angVel * rA.y);
      const dvy2 = (b.vel.y + b.angVel * rB.x) - (a.vel.y + a.angVel * rA.x);

      const vt = dvx2 * t.x + dvy2 * t.y;

      let jt = cd.massT * (-vt);
      const maxF = cd.jnAcc * m.mu;

      const jtOld = cd.jtAcc;
      cd.jtAcc = Math.max(-maxF, Math.min(jtOld + jt, maxF));
      jt = cd.jtAcc - jtOld;

      const ptx = t.x * jt;
      const pty = t.y * jt;

      a.vel.x -= ptx * a.invMass;
      a.vel.y -= pty * a.invMass;
      a.angVel -= (rA.x * pty - rA.y * ptx) * a.invMInertia;

      b.vel.x += ptx * b.invMass;
      b.vel.y += pty * b.invMass;
      b.angVel += (rB.x * pty - rB.y * ptx) * b.invMInertia;
      
  

      
      
    }
    

    


    
  }

  correctPositions(constraints) {
    const percent = 0.4;
    const slop = 0.01;

    for(let m of this.manifolds) {
      const a = m.bodyA,
            b = m.bodyB,
            n = m.normal;

      const totalInvMass = a.invMass + b.invMass;
      if(totalInvMass == 0) continue;

      const corr = Math.max(m.pen - slop, 0) / totalInvMass * percent;

      a.pos.x -= n.x * corr * a.invMass;
      a.pos.y -= n.y * corr * a.invMass;
      b.pos.x += n.x * corr * b.invMass;
      b.pos.y += n.y * corr * b.invMass;


      
    }

    for(const c of constraints) {
      c.correctPositions();
    }
    
  }
  
  
  
}