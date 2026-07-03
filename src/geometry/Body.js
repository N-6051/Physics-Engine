import { Vector } from "../math/Vector.js"

export class Body {

  static _id = 0;
  constructor(x = 0, y = 0, mass, material = {}) {

    this.id = Body._id++;
    this.pos = new Vector(x, y);
    this.angle = 0;
    
    this.torque = 0;
    this.force = new Vector();
    
    this.vel = new Vector();
    this.angVel = 0;

    this.mass = mass;
    this.mass ? this.invMass = 1 / this.mass : this.invMass = 0;

    this.restitution = material.restitution || 0.3;
    this.friction = material.friction || 0.4;
    

    this._updateWorldCoords = false;



    this.color = "139,220,247";
    
  }



  applyForce(f) {
    this.force.add(f);
  }
  
  applyForceAtPoint(f, p) {
    this.force.add(f);
    const r = p.sub(this.pos);
    this.torque += r.x * this.force.y - r.y * this.force.x;
  
  }

  applyVel(acc, dt) {
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

    if(this._updateWorldCoords) {
      this.computeWorldCoords();
    }
    if(this.mass) {
      this.computeBoundingBox();
    }

    if(!this.invMass) return;
    this.updateVel(dt);
    this.updatePos(dt);
    this.clearForces();
  
  }


  computeWorldCoords() {
    
  }
  
  computeBoundingBox() {
    
  }
  

  
  
}