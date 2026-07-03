import { Body } from "./Body.js"

export class Polygon extends Body {
  constructor(x = 0, y = 0, mass = 10, vertices = [], material = {}) {
    super(x, y, mass, material);
    this.vertices = vertices;

    
    let minX = Infinity, maxX = -Infinity,
        minY = Infinity, maxY = -Infinity;
    for(let vertex of vertices) {
      minX = Math.min(vertex.x, minX);
      maxX = Math.max(vertex.x, maxX);
      minY = Math.min(vertex.y, minY);
      maxY = Math.max(vertex.y, maxY);
    }

    const w = maxX - minX;
    const h = maxY - minY;
    this.mInertia = mass / 12 * (w * w + h * h);
    this.mInertia ? this.invMInertia = 1 / this.mInertia : this.invMInertia = 0;
    

    this.shape = 1;



    this.computeWorldCoords();
    this.computeBoundingBox();
    if(mass) {
      this._updateWorldCoords = true;
    }

      
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


  getWorldCoords() {
    let ver = [];
    for(let v of this.vertices) {
      ver.push(
        v.clone()
        .rotate(this.angle)
        .add(this.pos)
      );
    }
    return ver;
  }

  computeWorldCoords() {
    this.worldVerts = this.getWorldCoords();
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
    this.boundingBox = {
      minX: minX,
      minY: minY,
      maxX: maxX,
      maxY: maxY
    };
  }


  
}