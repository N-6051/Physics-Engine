import { Vector } from "../math/Vector.js"

export class Joystick {

  constructor(x, y, rf, rb, ra = null) {
    this.pos = new Vector(x, y);
    this.rf = rf;
    this._rb = rb;
    this.rbInv = 1 / rb;
    this.ra = ra || rb;
    this.active = false;
    this.targetPos = new Vector();
    this.rPos = new Vector();
    //this.length = 0;
  }

  set rb(k) {
    this._rb = k;
    this.rbInv = 1 / k;
  }

  init(canvas = null) {
    
    if(canvas !== null) {
      const rect = canvas.getBoundingClientRect();
      canvas.addEventListener("pointerdown", e => {
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        let dx = x - this.pos.x;
        let dy = y - this.pos.y;
        const distSq = dx * dx + dy * dy;
        if(distSq > this.ra * this.ra) return;
        if(distSq > this._rb * this._rb) {
          const dist = Math.sqrt(distSq);
          dx = dx / dist * this._rb;
          dy = dy / dist * this._rb;
        }
        this.targetPos.set(dx, dy);
        this.active = true;
      })

      canvas.addEventListener("pointermove", e => {
        if(!this.active) return;
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        let dx = x - this.pos.x;
        let dy = y - this.pos.y;
        const distSq = dx * dx + dy * dy;
        if(distSq > this.ra * this.ra) {
          this.active = false;
          this.targetPos.set(0, 0);
          return;
        }
        if(distSq > this._rb * this._rb) {
          const dist = Math.sqrt(distSq);
          dx = dx / dist * this._rb;
          dy = dy / dist * this._rb;
        }
        this.targetPos.set(dx, dy);
      })

      canvas.addEventListener("pointerup", e => {
        this.targetPos.set(0, 0);
        this.active = false;
      })
    } else {
      
      const rfElm = document.createElement("div"),
            rbElm = document.createElement("div"),
            raElm = document.createElement("div");
      
      rbElm.append(rfElm);
      raElm.append(rbElm);
      document.body.append(raElm);
      
      raElm.style.display = "grid";
      raElm.style.placeItems = "center";
      rbElm.style.display = "grid";
      rbElm.style.placeItems = "center";
      rfElm.style.borderRadius = rbElm.style.borderRadius = raElm.style.borderRadius = "50%";
      //raElm.style.background = "#0000001a";
      rbElm.style.background = "rgb(16,35,54)";
      rfElm.style.background = "rgb(25,53,69)";
      raElm.style.width = raElm.style.height = this.ra * 2 + "px";
      rbElm.style.width = rbElm.style.height = this._rb * 2 + "px";
      rfElm.style.width = rfElm.style.height = this.rf * 2 + "px";
      raElm.style.position = "absolute";
      raElm.style.transform = `translate(${this.pos.x - innerWidth/2}px, ${innerHeight/2 - this.pos.y}px)`;
      rfElm.style.transition = "0.1s";
      raElm.style.touchAction = "none";

      const rect = raElm.getBoundingClientRect();
      raElm.addEventListener("pointerdown", e => {
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        let dx = x - this.ra;
        let dy = y - this.ra;
        this.active = true;
        const distSq = dx * dx + dy * dy;
        if(distSq > this._rb * this._rb) {
          const dist = Math.sqrt(distSq);
          dx = dx / dist * this._rb;
          dy = dy / dist * this._rb;
        }
        rfElm.style.transform = `translate(${dx}px, ${dy}px)`;
        this.rPos.set(dx, dy);
      })
    

    raElm.addEventListener("pointermove", e => {
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      let dx = x - this.ra;
      let dy = y - this.ra;
      const distSq = dx * dx + dy * dy;
      if(distSq > this.ra * this.ra) {
        this.active = false;
        rfElm.style.transform = "translate(0, 0)";
        this.rPos.set(0, 0);
        return;
      }
      if(distSq > this._rb * this._rb) {
        const distInv = 1 / Math.sqrt(distSq);
        dx = dx * distInv * this._rb;
        dy = dy * distInv * this._rb;
      }
      rfElm.style.transform = `translate(${dx}px, ${dy}px)`;
      this.rPos.set(dx, dy);
      
    })

      raElm.addEventListener("pointerup", e => {
        this.active = false;
        rfElm.style.transform = "translate(0, 0)";
        this.rPos.set(0, 0);
      })


    }
  }

  // only for canvas (in loop)
  update(t = 0.2) {
    if(this.rPos.lengthSq() < 0.000001) {
      this.rPos.copy(this.targetPos);
      return;
    }
    this.rPos.x += (this.targetPos.x - this.rPos.x) * t;
    this.rPos.y += (this.targetPos.y - this.rPos.y) * t;
    //this.length = this.rPos.length();
  }

  // only for canvas (in loop)
  render(ctx = null) {
    
    if(ctx !== null) {
      /*ctx.beginPath();
      ctx.fillStyle = "rgba(255,255,255,0.3";
      ctx.arc(this.pos.x, this.pos.y, this.ra, 0, 2 * Math.PI);
      ctx.fill();*/

      ctx.beginPath();
      ctx.fillStyle = "rgb(7,28,35)";
      ctx.arc(this.pos.x, this.pos.y, this._rb, 0, 2 * Math.PI);
      ctx.fill();

      ctx.beginPath();
      ctx.fillStyle = "rgb(4,47,62)";
      ctx.arc(this.rPos.x + this.pos.x, this.rPos.y + this.pos.y, this.rf, 0, 2 * Math.PI);
      ctx.fill();
    } else {
      
    }
    
  }

  get n() {
    return this.rPos.clone().scale(this.rbInv);
  }

  get x() {
    return this.rPos.x * this.rbInv;
  }

  get y() {
    return this.rPos.y * this.rbInv;
  }
  
}