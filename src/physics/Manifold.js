export class Manifold {
  
  constructor(bodyA, bodyB, normal, penetration, contacts) {
    this.bodyA = bodyA;
    this.bodyB = bodyB;
    this.normal = normal;
    this.pen = penetration;
    this.contacts = contacts;
  }

}