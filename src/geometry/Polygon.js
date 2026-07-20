import { Body } from "./Body.js"
import { Vector } from "../math/Vector.js"

export class Polygon extends Body {
  constructor(params = {}) {
    super(params);
    this.shape = 1;
    
    this.worldVerts = [];
    for(let i = 0; i < this.vertices.length; i++) {
      this.worldVerts.push(new Vector());
    }
        
    this.computeWorldVerts();
    this.boundingBox = {};
    this.computeBoundingBox();
    
    const w = this.boundingBox.maxX - this.boundingBox.minX;
    const h = this.boundingBox.maxY - this.boundingBox.minY;
    this.mInertia = this.mass / 12 * (w * w + h * h);
    this.invMInertia = this.mInertia > 0 ? 1 / this.mInertia : 0;
  }


  render(ctx) {

    ctx.beginPath();
    ctx.moveTo(this.vertices[0].x, this.vertices[0].y);
    for(let idx = 1; idx < this.vertices.length; idx++) {
      const v = this.vertices[idx];
      ctx.lineTo(v.x, v.y);
    }
    ctx.closePath();
    ctx.strokeStyle = "rgb(" + this.color + ",0.7)";
    ctx.stroke();
    ctx.fillStyle = "rgb(" + this.color + ",0.3)";
    ctx.fill();
    
  }


  computeWorldVerts() {
    for(let i = 0; i < this.vertices.length; i++) {
      const v = this.vertices[i];
      this.worldVerts[i].copy(
        v.clone()
        .rotate(this.angle)
        .add(this.pos)
      );
    }
    return this.worldVerts;
  }

  computeBoundingBox() {
    let minX = Infinity,
        minY = Infinity,
        maxX = -Infinity,
        maxY = -Infinity;
    for(let v of this.worldVerts) {
      minX = Math.min(minX, v.x);
      minY = Math.min(minY, v.y);
      maxX = Math.max(maxX, v.x);
      maxY = Math.max(maxY, v.y);
    }
    
    this.boundingBox.minX = minX;
    this.boundingBox.maxX = maxX;
    this.boundingBox.minY = minY;
    this.boundingBox.maxY = maxY;
  }


  
}