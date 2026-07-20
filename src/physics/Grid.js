export class Grid {
  
  constructor(cellSize = 32) {
    this._cellSize = cellSize;
    this.inv = 1 / cellSize;
    this.cells = new Map();
  }

  set cellSize(val) {
    this._cellSize = val;
    this.inv = 1 / val;
  }

  get cellSize() {
    return this._cellSize;
  }

  insert(entity, x, y, w = 0, h = 0) {
    const cx_min = Math.floor(x * this.inv),
          cx_max = Math.floor((x + w) * this.inv),
          cy_min = Math.floor(y * this.inv),
          cy_max = Math.floor((y + h) * this.inv);
    
    for(let cy = cy_min; cy <= cy_max; cy++) {
      let row = this.cells.get(cy);
      if(!row) {
        row = new Map();
        this.cells.set(cy, row);
      }
      
      for(let cx = cx_min; cx <= cx_max; cx++) {
        let cell = row.get(cx);
        if(!cell) {
          cell = [];
          row.set(cx, cell);
        }
        cell.push(entity);
      }
    }
  }

  clear() {
    this.cells.clear();
  }

  query(x, y, w, h, extra = 0) {
    const result = new Set();
    
    const cx_min = Math.floor(x * this.inv) - extra,
          cx_max = Math.floor((x + w) * this.inv) + extra,
          cy_min = Math.floor(y * this.inv) - extra,
          cy_max = Math.floor((y + h) * this.inv) + extra;
    
    
    for(let cy = cy_min; cy <= cy_max; cy++) {
      const row = this.cells.get(cy);
      if(!row) continue;
      for(let cx = cx_min; cx <= cx_max; cx++) {
        const entities = row.get(cx);
        if(!entities) continue;
        for(const e of entities) result.add(e);
      }
    }

    return [...result];
    
  }

  // only for debugging
  getObject() {
    const str = JSON.stringify(this.cells, (key, value) => {
      if (value instanceof Map) {
        return Object.fromEntries(value); 
      }
      return value;
    });

    return JSON.parse(str);
  }
  
  
}