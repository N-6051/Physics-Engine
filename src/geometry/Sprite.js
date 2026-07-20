import { Body } from "./Body.js"

export class Sprite extends Body {
  
  constructor(params = {}) {
    super(params);
    this.sprite = params.sprite;
    
  }

  render(ctx) {
    const w = 100;
    const h = this.sprite.height / this.sprite.width * w;
    ctx.drawImage(this.sprite, 0, 0, w, h);
  }
  
}