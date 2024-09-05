export class Asset {
  constructor(imageDef, imageSel) {
    this.defaultImg = new Image();
    this.selectedImg = new Image();
    this.defaultImg.crossOrigin = "Anonymous";
    this.selectedImg.crossOrigin = "Anonymous";
    this.defaultSrc = imageDef;
    this.selectedSrc = imageSel;
  }

  load() {
    return Promise.all([
      new Promise((resolve, reject) => {
        this.defaultImg.onload = resolve;
        this.defaultImg.onerror = reject;
        this.defaultImg.src = this.defaultSrc;
      }),
      new Promise((resolve, reject) => {
        this.selectedImg.onload = resolve;
        this.selectedImg.onerror = reject;
        this.selectedImg.src = this.selectedSrc;
      }),
    ]);
  }

  getImageDef() {
    return this.defaultImg;
  }
  getImageSel() {
    return this.selectedImg;
  }
  setWidth(width) {
    this.defaultImg.width = width;
    this.selectedImg.width = width;
  }
  setHeight(height) {
    this.defaultImg.height = height;
    this.selectedImg.height = height;
  }
  getWidth() {
    return this.defaultImg.width;
  }
  getHeight() {
    return this.defaultImg.height;
  }

  getImg(isSelected) {
    return isSelected ? this.selectedImg : this.defaultImg;
  }
}

export class AssetManager {
  constructor() {
    this.assets = {};
    this.loadedAssets = 0;
    this.totalAssets = 0;
  }
  addAsset(name, imageDef, imageSel) {
    this.assets[name] = new Asset(imageDef, imageSel);
    this.totalAssets++;
  }
  addAsset(name, asset) {
    this.assets[name] = asset;
  }
  getAsset(name) {
    return this.assets[name];
  }

  async loadAll() {
    const loadPromises = Object.values(this.assets).map((asset) =>
      asset.load(),
    );
    await Promise.all(loadPromises);
  }

  getAllAssets()
  {
    return this.assets;
  }
}
