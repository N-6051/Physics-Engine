export class Assets {
  
  constructor() {
    this.assets = new Map();
  }

  async load(data = []) {
    await Promise.all(data.map(async (params) => {
      const type = params.type;
      let asset;
      
      switch(type) {
        case "img": {
          asset = new Image();
          asset.src = params.url;
          await asset.decode();
          break;
        }
        case "audio": {
          asset = new Audio();
          asset.src = params.url;
          await new Promise((resolve, reject) => {
            asset.oncanplaythrough = resolve;
            asset.onerror = () => reject(new Error(`Failed to load audio: ${params.key}`));
          });
          break;
        }
        case "json": {
          const res = await fetch(params.url);
          if (!res.ok) throw new Error(`Failed to fetch JSON: ${params.key}`);
          asset = await res.json();
          break;
        }
      }

      this.assets.set(params.key, asset);
    }));

    
    return this.assets;
  }

  get(key) {
    return this.assets.get(key);
  }
  
}
