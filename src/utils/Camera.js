import { Vector } from "../math/Vector.js"

export class Camera {
   // decay rate (lerp factor)
  constructor(x = 0, y = 0, target = null, params = {}) {
    this.pos = new Vector(x, y);
    this.target = target;
    this.bounds = params.bounds;
    this.angle = params.angle || 0;
    this.zoom = params.zoom ?? 1;
    this.targetZoom = this.zoom;
    this.speed = params.speed ?? 1;
    
    this.shakeIntensity = 0;
    this.shakeDuration = 0;
    this.shakeOffset = new Vector();
  }

  setTarget(target, x = null, y = null) {
    this.target = target;
    if(x !== null) this.pos.x = x;
    if(y !== null) this.pos.y = y;
  }

  shake(shakeIntensity, shakeDuration) {
    this.shakeIntensity = shakeIntensity;
    this.shakeDuration = shakeDuration;
  }

  update(dt = 0.01) {
    const t = 1 - Math.exp(-dt * this.speed);
    if(this.target) {
      this.pos.x += (this.target.pos.x - this.pos.x) * t;
      this.pos.y += (this.target.pos.y - this.pos.y) * t;
    }
   
    this.zoom += (this.targetZoom - this.zoom) * t * 0.1;
    if(Math.abs(this.zoom - this.targetZoom) < 0.0001) this.zoom = this.targetZoom;

    if(this.bounds) {
    this.pos.x = Math.max(this.bounds.minX, Math.min(this.pos.x, this.bounds.maxX));
    this.pos.y = Math.max(this.bounds.minY, Math.min(this.pos.y, this.bounds.maxY));
    }

    if(this.shakeDuration > 0) {
      this.shakeDuration -= dt;
      this.shakeOffset.x = (Math.random() * 2 - 1) * this.shakeIntensity;
      this.shakeOffset.y = (Math.random() * 2 - 1) * this.shakeIntensity;

      this.shakeIntensity *= 0.99;

      if(this.shakeDuration <= 0) {
        //this.shakeOffset.set(0, 0);
        this.shakeIntensity = 0;
      }
    } else if(this.shakeOffset.x !== 0 || this.shakeOffset.y !== 0) {
      this.shakeOffset.x -= this.shakeOffset.x * t;
      this.shakeOffset.y -= this.shakeOffset.y * t;
      if(Math.abs(this.shakeOffset.x) < 0.0001) this.shakeOffset.x = 0;
      if(Math.abs(this.shakeOffset.y) < 0.0001) this.shakeOffset.y = 0;
    }

  }
  
  setZoom(z) {
    this.targetZoom = z;
  }

  get x() {
    if(this.bounds) {
      return Math.max(this.bounds.minX, Math.min(this.pos.x + this.shakeOffset.x, this.bounds.maxX));
    }
    return this.pos.x + this.shakeOffset.x;
  }
  
  get y() {
    if(this.bounds) {
      return Math.max(this.bounds.minY, Math.min(this.pos.y + this.shakeOffset.y, this.bounds.maxY));
    }
    return this.pos.y + this.shakeOffset.y;
  }


}