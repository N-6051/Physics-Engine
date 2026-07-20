import { Body } from "./Body.js"
import { Sprite } from "./Sprite.js"

export class Circle extends Sprite {
  
  constructor(params = {}) {
    super(params);
    this.shape = 0;
    
    this.mInertia = 0.5 * this.mass * this.r * this.r;
    this.mInertia ? this.invMInertia = 1 / this.mInertia : this.invMInertia = 0;

    this.boundingBox = {
      minX: this.pos.x - this.r,
      maxX: this.pos.x + this.r,
      minY: this.pos.y - this.r,
      maxY: this.pos.y + this.r
    };


    
    
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
    this.boundingBox.minX = this.pos.x - this.r;
    this.boundingBox.maxX = this.pos.x + this.r;
    this.boundingBox.minY = this.pos.y - this.r;
    this.boundingBox.maxY = this.pos.y + this.r;
  }

   
  

  
  
}
