import { Vector } from "../math/Vector.js"

export class Body {

  static _id = 0;
  constructor(params = {}) {
    this.id = Body._id++;
    this.pos = new Vector(params.x||0, params.y||0);
    this.angle = params.angle || 0;
    
    this.torque = 0;
    this.force = new Vector();
    
    this.vel = params.vel || new Vector();
    this.angVel = params.angVel || 0;

    this.mass = params.mass ?? 0;
    this.invMass = this.mass > 0 ? 1 / this.mass : 0;

    this.restitution = params.restitution ?? 0.6;
    this.friction = params.friction ?? 0.2;

    this.r = params.r;
    this.vertices = params.vertices;
    this.color = "139,220,247";
    
  }

  
  applyForce(f) {
    this.force.add(f);
  }
  
  applyForceAtPoint(fx, fy, p) {
    this.force.x += fx;
    this.force.y += fy;
    const r = p.clone().sub(this.pos);
    this.torque += r.x * fy - r.y * fx;
  
  }

  applyAcc(acc, dt) {
    this.vel.add(acc.clone().scale(dt));
  }

  clearForces() {
    this.force.set(0, 0);
    this.torque = 0;
  }

  updateVel(dt) {
    if(this.invMass == 0) return;
    this.vel.add(this.force.clone().scale(this.invMass * dt));

    if(this.invMInertia == 0) return;
    this.angVel += this.torque * this.invMInertia * dt;
  }

  updatePos(dt) {
    this.pos.add(this.vel.clone().scale(dt));
    this.angle += this.angVel * dt;
  }

  update(dt) {
    if(!this.invMass) return;
    this.updateVel(dt);
    this.updatePos(dt);
    this.clearForces();
  }


  computeWorldVerts() {
    
  }
  
  computeBoundingBox() {
    
  }
  

  
  
}