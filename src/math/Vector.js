export class Vector {
  
  constructor(x = 0, y = 0) {
    this.x = x;
    this.y = y;
  }
  
  static zero() {
    return new Vector();
  }
  
  static one() {
    return new Vector(1, 1);
  }
  
  static from(v) {
    return new Vector(v.x, v.y);
  }
  
  static fromAngle(a) {
    return new Vector(Math.cos(a), Math.sin(a));
  }
  
  clone() {
    return new Vector(this.x, this.y);
  }
  
  add(v) {
    this.x += v.x;
    this.y += v.y;
    return this;
  }
  
  sub(v) {
    this.x -= v.x;
    this.y -= v.y;
    return this;
  }
  
  scale(k) {
    this.x *= k;
    this.y *= k;
    return this;
  }
  
  mult(x, y = 1) {
    this.x *= x;
    this.y *= y;
    return this;
  }
  
  div(x, y = 1) {
    this.x /= x;
    this.y /= y;
    return this;
  }
  
  normalize() {
    const len = this.length();
    if(len == 0) {
      this.set(1, 0);
      return this;
    }
    this.scale(1 / len);
    return this;
  }
  
  length() {
    return Math.hypot(this.x, this.y);
  }
  
  lengthSq() {
    return this.x * this.x + this.y * this.y;
  }
  
  negate() {
    this.scale(-1);
    return this;
  }
  
  set(x, y) {
    this.x = x;
    this.y = y;
    return this;
  }
  
  copy(v) {
    this.x = v.x;
    this.y = v.y;
    return this;
  }
  
  equals(v, e = 0) {
    return Math.abs(this.x - v.x) <= e && Math.abs(this.y - v.y) <= e;
  }
  
  dot(v) {
    return this.x * v.x + this.y * v.y;
  }
  
  cross(v) {
    return this.x * v.y - this.y * v.x;
  }
  
  rotate(a) {
    let sin = Math.sin(a),
        cos = Math.cos(a),
        x = this.x,
        y = this.y;
    
    this.x = x * cos - y * sin;
    this.y = x * sin + y * cos;
    return this;
  }
  
  angle() {
    return Math.acos(
        this.x / this.length()
      );
  }
  
  
  lerp(v, k) {
    this.x += (v.x - this.x) * k;
    this.y += (v.y - this.y) * k;
    return this;
  }

  normal() {
    return new Vector(this.y, -this.x).normalize();
  }
  
  
}