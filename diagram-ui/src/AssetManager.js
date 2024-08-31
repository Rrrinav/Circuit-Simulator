export class Asset {
  constructor(imageDef, imageSel, callback) {
    this.img = new Image();
    this.imgsSelected = new Image();
    this.img.src = imageDef;
    this.imgsSelected.src = imageSel;
    this.img.onload = () => {
      callback();
    };
    this.isSelected = false;
  }
  getImageDef() {
    return this.img;
  }
  getImageSel() {
    return this.imgsSelected;
  }
  setWidth(width) {
    this.img.width = width;
    this.imgsSelected.width = width;
  }
  setHeight(height) {
    this.img.height = height;
    this.imgsSelected.height = height;
  }
  isSelected() {
    return this.isSelected;
  }
  getImg() {
    return this.isSelected ? this.imgsSelected : this.img;
  }
}

export class AssetManager {
  constructor() {
    this.assets = {};
  }
  addAsset(name, imageDef, imageSel) {
    this.assets[name] = new Asset(imageDef, imageSel);
  }
  addAsset(name, asset) {
    this.assets[name] = asset;
  }
  getAsset(name) {
    return this.assets[name];
  }
}
