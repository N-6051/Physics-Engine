import { Vector } from "../math/Vector.js";

export class Constraint {
  constructor(bodyA, bodyB) {
    this.bodyA = bodyA;
    this.bodyB = bodyB;
  }

  preCompute() {}
  correctPositions() {}

  getWorldAnchor(body, local) {
    return local.clone().rotate(body.angle).add(body.pos);
    /*const sin = Math.sin(body.angle),
          cos = Math.cos(body.angle);
    return new Vector(
      body.pos.x + local.x * cos - local.y * sin,
      body.pos.y + local.x * sin + local.y * cos
    );*/
  }
}

export class DistanceConstraint extends Constraint {
  constructor(bodyA, bodyB, localA, localB, length = null) {
    super(bodyA, bodyB);
    this.localA = localA;
    this.localB = localB;
    this.accImpulse = 0;

    if (length != null) {
      this.targetLength = length;
    } else {
      const wA = this.getWorldAnchor(bodyA, localA);
      const wB = this.getWorldAnchor(bodyB, localB);
      this.targetLength = wB.sub(wA).length();
    }
  }

  preCompute() {
    const a = this.bodyA,
      b = this.bodyB;
    this.worldA = this.getWorldAnchor(a, this.localA);
    this.worldB = this.getWorldAnchor(b, this.localB);
    this.rA = this.worldA.clone().sub(a.pos);
    this.rB = this.worldB.clone().sub(b.pos);

    const N = this.worldB.clone().sub(this.worldA);
    const dist = N.length();
    this.n = dist > 0.0001 ? N.scale(1 / dist) : new Vector(1, 0);

    const rAxN = this.rA.x * this.n.y - this.rA.y * this.n.x;
    const rBxN = this.rB.x * this.n.y - this.rB.y * this.n.x;
    this.effectiveMass =
      a.invMass +
      b.invMass +
      rAxN * rAxN * a.invMInertia +
      rBxN * rBxN * b.invMInertia;
    if (this.effectiveMass > 0) this.effectiveMass = 1 / this.effectiveMass;

    const px = this.accImpulse * this.n.x;
    const py = this.accImpulse * this.n.y;
    a.vel.x -= px * a.invMass;
    a.vel.y -= py * a.invMass;
    a.angVel -= (this.rA.x * py - this.rA.y * px) * a.invMInertia;
    b.vel.x += px * b.invMass;
    b.vel.y += py * b.invMass;
    b.angVel += (this.rB.x * py - this.rB.y * px) * b.invMInertia;
  }

  solve() {
    const a = this.bodyA,
      b = this.bodyB;
    const { rA, rB, n } = this;
    const dvx = b.vel.x - b.angVel * rB.y - (a.vel.x - a.angVel * rA.y);
    const dvy = b.vel.y + b.angVel * rB.x - (a.vel.y + a.angVel * rA.x);

    const vn = dvx * n.x + dvy * n.y;
    const lamda = -vn * this.effectiveMass;
    this.accImpulse += lamda;
    const px = lamda * n.x;
    const py = lamda * n.y;

    a.vel.x -= px * a.invMass;
    a.vel.y -= py * a.invMass;
    a.angVel -= (rA.x * py - rA.y * px) * a.invMInertia;

    b.vel.x += px * b.invMass;
    b.vel.y += py * b.invMass;
    b.angVel += (rB.x * py - rB.y * px) * b.invMInertia;
  }

  correctPositions() {
    const a = this.bodyA,
      b = this.bodyB;
    const wA = this.getWorldAnchor(a, this.localA),
      wB = this.getWorldAnchor(b, this.localB);
    let n = wB.clone().sub(wA);
    const dist = n.length();
    if (dist < 0.0001 && this.targetLength < 0.0001) return;
    n = dist > 0.0001 ? n.scale(1 / dist) : new Vector(1, 0);

    const C = dist - this.targetLength;
    const rA = wA.clone().sub(a.pos);
    const rB = wB.clone().sub(b.pos);
    const rAxN = rA.x * n.y - rA.y * n.x;
    const rBxN = rB.x * n.y - rB.y * n.x;
    const K =
      a.invMass +
      b.invMass +
      rAxN * rAxN * a.invMInertia +
      rBxN * rBxN * b.invMInertia;
    if (K === 0) return;

    const corr = (-C / K) * 0.2;

    a.pos.x -= corr * n.x * a.invMass;
    a.pos.y -= corr * n.y * a.invMass;
    b.pos.x += corr * n.x * b.invMass;
    b.pos.y += corr * n.y * b.invMass;
  }

  render(ctx) {
    ctx.beginPath();
    ctx.strokeStyle = "#09f";
    ctx.moveTo(this.worldA.x, this.worldA.y);
    ctx.lineTo(this.worldB.x, this.worldB.y);
    ctx.stroke();
  }
}

export class SpringConstraint extends Constraint {
  constructor(bodyA, bodyB, localA, localB, props = {}) {
    super(bodyA, bodyB);
    this.localA = localA;
    this.localB = localB;
    this.worldA = this.getWorldAnchor(bodyA, localA);
    this.worldB = this.getWorldAnchor(bodyB, localB);
    if (props.restLength !== undefined) {
      this.restLength = props.restLength;
    } else {
      this.restLength = this.worldB.clone().sub(this.worldA).length();
    }
    this.minLength = props.minLength ?? 0;
    this.maxLength = props.maxLength ?? Infinity;
    this.stiffness = props.stiffness ?? 10;
    this.damping = props.damping ?? 10;
    this.maxForce = props.maxForce ?? 50000;
  }

  applySpringForce() {
    const a = this.bodyA,
      b = this.bodyB;
    this.worldA = this.getWorldAnchor(a, this.localA);
    this.worldB = this.getWorldAnchor(b, this.localB);

    const n = this.worldB.clone().sub(this.worldA);
    const dist = n.length();
    if (dist < 0.0001) return;
    n.scale(1 / dist);

    const clampedDist = Math.max(
      this.minLength,
      Math.min(dist, this.maxLength),
    );
    const stretch = clampedDist - this.restLength;

    const rA = this.worldA.clone().sub(a.pos);
    const rB = this.worldB.clone().sub(b.pos);
    const dvx = b.vel.x - b.angVel * rB.y - (a.vel.x - a.angVel * rA.y);
    const dvy = b.vel.y + b.angVel * rB.x - (a.vel.y + a.angVel * rA.x);
    const velAlongN = dvx * n.x + dvy * n.y;

    let forceMag = this.stiffness * stretch + this.damping * velAlongN;

    if (dist > this.maxLength) {
      forceMag += 2 * this.stiffness * (dist - this.maxLength);
    } else if (dist < this.minLength) {
      forceMag += 2 * this.stiffness * (dist - this.minLength);
    }

    forceMag = Math.max(-this.maxForce, Math.min(forceMag, this.maxForce));
    const fx = forceMag * n.x,
      fy = forceMag * n.y;

    a.applyForceAtPoint(fx, fy, this.worldA);
    b.applyForceAtPoint(-fx, -fy, this.worldB);
    a.vel.scale(0.999);
    b.vel.scale(0.999);
    a.angVel *= 0.99;
    b.angVel *= 0.99;
  }

  solve() {}
  correctPositions() {}

  render(ctx, coilCount = 10, endLength = 5, amp = 5) {
    ctx.beginPath();
    ctx.strokeStyle = "#09f";
    ctx.moveTo(this.worldA.x, this.worldA.y);

    const n = this.worldB.clone().sub(this.worldA);
    const dist = n.length();
    n.scale(1 / dist);

    let e1 = this.worldA.clone().add(n.clone().scale(endLength));
    ctx.lineTo(e1.x, e1.y);

    const len = dist - 2 * endLength;
    const p = 20;
    const tp = coilCount * p;

    for (let i = 0; i < tp; i++) {
      let yP = e1.clone().add(n.clone().scale((i / tp) * len));
      let k = n.normal();
      k.scale(amp * Math.sin((Math.PI / (len / coilCount)) * ((i * len) / tp)));
      yP.add(k);
      ctx.lineTo(yP.x, yP.y);

      /* let x = this.worldA.x + dx * endLength + i * len / (coilCount * 20);
      let y = this.worldA.y + dx * endLength + Math.sin(i * len / (coilCount*20) - len / coilCount)*/
    }

    ctx.lineTo(this.worldB.x, this.worldB.y);
    ctx.stroke();
  }
}

export class RopeConstraint extends Constraint {
  constructor(bodyA, bodyB, localA, localB, maxLength = null) {
    super(bodyA, bodyB);
    this.localA = localA;
    this.localB = localB;
    if (maxLength != undefined) {
      this.maxLength = maxLength;
    } else {
      const wA = this.getWorldAnchor(bodyA, localA);
      const wB = this.getWorldAnchor(bodyB, localB);
      this.maxLength = wB.sub(wA).length();
    }
    this.accImpulse = 0;
  }

  preCompute() {
    const a = this.bodyA,
      b = this.bodyB;
    this.worldA = this.getWorldAnchor(a, this.localA);
    this.worldB = this.getWorldAnchor(b, this.localB);
    let n = this.worldB.clone().sub(this.worldA);
    const dist = n.length();
    n = dist > 0.0001 ? n.scale(1 / dist) : new Vector(1, 0);
    this.n = n;
    if (dist <= this.maxLength) {
      this.accImpulse = 0;
      return;
    }

    this.rA = this.worldA.clone().sub(a.pos);
    this.rB = this.worldB.clone().sub(b.pos);
    const rAxN = this.rA.x * n.y - this.rA.y * n.x;
    const rBxN = this.rB.x * n.y - this.rB.y * n.x;
    this.effectiveMass =
      a.invMass +
      b.invMass +
      rAxN * rAxN * a.invMInertia +
      rBxN * rBxN * b.invMInertia;
    if (this.effectiveMass > 0) this.effectiveMass = 1 / this.effectiveMass;

    const px = this.accImpulse * n.x;
    const py = this.accImpulse * n.y;
    a.vel.x -= px * a.invMass;
    a.vel.y -= py * a.invMass;
    a.angVel -= (this.rA.x * py - this.rA.y * px) * a.invMInertia;
    b.vel.x += px * b.invMass;
    b.vel.y += py * b.invMass;
    b.angVel += (this.rB.x * py - this.rB.y * px) * b.invMInertia;
  }

  solve() {
    const a = this.bodyA,
      b = this.bodyB;
    const { rA, rB, n } = this;

    let N = this.getWorldAnchor(b, this.localB).sub(
      this.getWorldAnchor(a, this.localA),
    );
    if (N.length() <= this.maxLength) return;

    const dvx = b.vel.x - b.angVel * rB.y - (a.vel.x - a.angVel * rA.y);
    const dvy = b.vel.y + b.angVel * rB.x - (a.vel.y + a.angVel * rA.x);
    const vn = dvx * n.x + dvy * n.y;
    let j = -vn * this.effectiveMass;

    const oldJAcc = this.accImpulse;
    this.accImpulse = Math.min(0, this.accImpulse + j);
    j = this.accImpulse - oldJAcc;

    const px = j * n.x,
      py = j * n.y;

    a.vel.x -= px * a.invMass;
    a.vel.y -= py * a.invMass;
    a.angVel -= (rA.x * py - rA.y * px) * a.invMInertia;
    b.vel.x += px * b.invMass;
    b.vel.y += py * b.invMass;
    b.angVel += (rB.x * py - rB.y * px) * b.invMInertia;
  }

  correctPositions() {
    const a = this.bodyA,
      b = this.bodyB;
    this.wA = this.getWorldAnchor(a, this.localA);
    this.wB = this.getWorldAnchor(b, this.localB);
    const { wA, wB } = this;
    let n = wB.clone().sub(wA);
    const dist = n.length();
    if (dist <= this.maxLength) return;
    n = dist > 0.0001 ? n.scale(1 / dist) : new Vector(1, 0);

    const dl = dist - this.maxLength;
    const rA = wA.clone().sub(a.pos);
    const rB = wB.clone().sub(b.pos);
    const rAxN = rA.x * n.y - rA.y * n.x;
    const rBxN = rB.x * n.y - rB.y * n.x;
    const EMR =
      a.invMass +
      b.invMass +
      rAxN * rAxN * a.invMInertia +
      rBxN * rBxN * b.invMInertia;
    if (EMR === 0) return;

    const corr = (-dl / EMR) * 0.2;
    a.pos.x -= corr * a.invMass * n.x;
    a.pos.y -= corr * a.invMass * n.y;
    b.pos.x += corr * b.invMass * n.x;
    b.pos.y += corr * b.invMass * n.y;
  }

  render(ctx, t = 0.4) {
    ctx.beginPath();
    ctx.strokeStyle = "#09f";

    const { wA, wB } = this;
    const n = wB.clone().sub(wA);
    const dist = n.length();
    const slack = Math.max(0, this.maxLength - dist);
    const sag = slack * 0.5;
    const gx = 0, gy = 1;

    ctx.moveTo(wA.x, wA.y);
    ctx.bezierCurveTo(
      wA.x + n.x * t + gx * sag,
      wA.y + n.y * t + gy * sag,
      
      wB.x - n.x * t + gx * sag,
      wB.y - n.y * t + gy * sag,
      
      wB.x, wB.y,
    );

    //ctx.lineTo(this.worldB.x, this.worldB.y);
    ctx.stroke();
  }
}
