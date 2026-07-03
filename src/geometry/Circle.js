import { Body } from "./Body.js"

export class Circle extends Body {
  
  constructor(x = 0, y = 0, mass = 10, r = 10, material = {}) {
    super(x, y, mass, material);
    this.r = r;
    this.mInertia = 0.5 * mass * r * r;

    this.mInertia ? this.invMInertia = 1 / this.mInertia : this.invMInertia = 0;

    this.shape = 0;


    this.computeWorldCoords();
    this.computeBoundingBox();
    this._updateWorldCoords = false;


    
    
  }
  
  render(ctx) {
    
    ctx.beginPath();
    ctx.strokeStyle = "rgb(" + this.color + ",0.7)";
    ctx.moveTo(0, 0);
    ctx.arc(0, 0, this.r, 0, 2 * Math.PI);
    ctx.stroke();
    ctx.fillStyle = "rgb(" + this.color + ",0.3)";
    ctx.arc(0, 0, this.r, 0, 2 * Math.PI);
    ctx.fill();
    
    
  }


  computeBoundingBox() {
    this.boundingBox = {
      minX: this.pos.x - this.r,
      maxX: this.pos.x + this.r,
      minY: this.pos.y - this.r,
      maxY: this.pos.y + this.r
    };
  }

   
  

  
  
}
