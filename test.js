import * as ED from "./src/Engine.js"

const Engine = ED.default;
const {
  
  Body,
  Circle,
  Polygon,
  
  Vector,
  
  Manifold,
  Collisions,
  Solver
  
} = Engine;



function generateRegularPolyVerts(n, r) {
  let u = Math.PI * 2 / n;
  let verts = [];
  for(let i = 0; i < n; i++) {
    let angle = i * u;
    let x = Math.cos(angle) * r,
        y = Math.sin(angle) * r;
    if(Math.abs(x) < 1e-5) x = 0;
    if(Math.abs(y) < 1e-5) y = 0;
    verts.push(new Vector(x, y));
  }
  return verts;
}

console.log(generateRegularPolyVerts(4,20))





  
const canvas = document.createElement("canvas");
const ctx = canvas.getContext("2d");
let [W, H] = [window.innerWidth, window.innerHeight - 4];
const dpr = window.devicePixelRatio || 1;
canvas.width = W * dpr;
canvas.height = H * dpr;
canvas.style.width = W + "px";
canvas.style.height = H + "px";
ctx.scale(dpr, dpr);
document.body.append(canvas);

const c = t => console.log(t);
let zoom = 1;


function randint(min, max) {
  return Math.round(Math.random() * (max - min) + min);
}
function randomColor() {
  return `${randint(0, 255)},${randint(0,255)},${randint(0,255)}`;
}

function main() {
  
  
  
}


function resetTransform() {
  const z = zoom * dpr;
  ctx.setTransform(z, 0, 0, z, 0, 0);
}

const subSteps = 4;
const GRAVITY = new Vector(0, 30); // Gravity force 
const solver = new Solver(10);

  
function GameLoop() {
  requestAnimationFrame(GameLoop);
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  now = performance.now();
  dt = (now - then) / 1000;
  then = now;
  if(now - frameThen > 1000) {
    fps = frames;
    frames = 0;
    frameThen = now;
    fpsElm.textContent = fps;
  } else {
    frames++;
  }


  for(let i = 0; i < subSteps; i++) {

    const subDt = dt / subSteps;
    // Step 1: Apply gravity force
    for(let e of entities) {
      if(!e.mass) continue;
      e.applyForce(GRAVITY.clone().scale(e.mass));
    }
    // apply velocity
    for(let e of entities) {
      e.updateVel(subDt);
    }

    // Step 2: manifolds 
    const manifolds = solver.detectCollisions(entities);

    // debug
    //for(let m of manifolds) m.draw(ctx);

    // Step 3: solve manifolds 
    solver.solve();

    // Step 4: updatePos - add vel and angVel to pos and angle
    for(let e of entities) e.updatePos(dt);

    // Step 5: correct positions so that bodies no longer overlaps 
    solver.correctPositions();

    // Step 6: clear forces
    for(let e of entities) {
      e.clearForces();
    }
    
  }

  
  for(const e of entities) {

    // DOMMatrix
    const sin = Math.sin(e.angle),
          cos = Math.cos(e.angle),
          z = zoom * dpr;
    const matrix = new DOMMatrix([
      cos * z,
      sin * z,
      - sin * z,
      cos * z,
      e.pos.x * z,
      e.pos.y * z
    ]);

/*
    let k = e.pos.clone()
            .add(new Vector(10,1));
    let f = new Vector(10, -10);
    debug.drawLine(k.x, k.y, k.x + f.x, k.y + f.y);
    e.applyForceAtPoint(f, k);*/

    /*for(f of entities) {
      if(e.id >= f.id) continue;
      const m = Collisions.findCollisions(e, f);
      if(m) {
        for(let cPoint of m.contacts) {
          debug.drawPoint(cPoint.x, cPoint.y, "#09f", 2);
        }
      }
    }*/
    // e.applyForce(new Vector(0, e.mass * 20 ));
    e.update(dt);


    
    ctx.setTransform(matrix);
    e.render(ctx);
    /*debug.drawRect(
      e.boundingBox.minX,
      e.boundingBox.minY,
      e.boundingBox.maxX - e.boundingBox.minX,
      e.boundingBox.maxY - e.boundingBox.minY
    )*/
    
    //e.angle += 0.01;
  }
  
  
  ctx.resetTransform();
  
  
}


















let fps = 0,
  frames = 0,
  dt = 0,
  frameThen = 0;
 let  now = performance.now(),
   then = performance.now();
  let fpsElm = document.querySelector("#fps");
  
 let  entities = [];
let   e1 = new Circle(-400, 400, 10, 30);
 let e3 = new Circle(30, 350, 5, 20);
 let e2 = new Polygon(200, 350, 15, [
   new Vector(50, 40),
    new Vector(-50, 40),
    new Vector(-50, -40),
    new Vector(50, -40)
  ]);
 let  e4 = new Polygon(-400, 400, 100, [
    new Vector(40, 40),
    new Vector(30, 50),
    new Vector(0, 20),
    new Vector(-30, -50),
    new Vector(20, -50)
  ])
  e4.color = "165.7,100%,63.6%";
  e4.vel.set(100, 0);

  const w = canvas.clientWidth, h = canvas.clientHeight;
 let  e5 = new Polygon(w/2, h, 0, [
    new Vector(w/2, 5),
    new Vector(-w/2, 5),
    new Vector(-w/2, 0),
    new Vector(w/2, 0)
  ])

  const bw = 15

  for(let i = 10; i > 0; i--) {
    for(let j = 0; j < i; j++) {
      let x = j * 2 * bw + 35 + (11 - i) * bw;
      let y = h - (10 - i) * (bw+1) * 2;
     
      if(Math.random() > 0.2) {
        let e = new Polygon(x, y, 0.5, generateRegularPolyVerts(randint(3,8), bw*1.5));
        //e.color = randomColor();
        e.color = "133,242,255";
        entities.push(e);
        
      }
     else {
       let e = new Circle(x, y, 0.5, bw);
        e.color = "133,242,255";
       //e.color = randomColor();
       entities.push(e);
     }


      
    }
  }
  
  //e1.vel.set(0,-3)
//  e3.pos.y = h - 100
 // e3.vel.set(100, 0)
  entities.push(e5);
 // entities.push(e4)
  
  GameLoop();










canvas.addEventListener("pointermove", e => {
  let x = e.clientX,
      y = e.clientY;
  for(e of entities) {
    let {minX, maxX, minY, maxY} = e.boundingBox;
    if(x > minX && x < maxX && y > minY && y < maxY) {
      e.pos.set(x, y);
      return;
    }
  }
  
})

canvas.addEventListener("dblclick", e => {
  let x = e.clientX,
      y = e.clientY;
  for(e of entities) {
    let {minX, maxX, minY, maxY} = e.boundingBox;
    if(x > minX && x < maxX && y > minY && y < maxY) {
      e.angle += 0.1;
      return;
    }
  }
})