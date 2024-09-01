export class Asset {
  constructor(imgX, imgY, imageDef, imageSel) {
    this.x = imgX;
    this.y = imgY;
    this.img = new Image();
    this.imgSelected = new Image();
    this.img.src = imageDef;
    this.imgSelected.src = imageSel;
    this.img.width = 50;
    this.img.height = 50;

    this.imgSelected.width = 50;
    this.imgSelected.height = 50;

    this.img.crossOrigin = "Anonymous";
    this.imgSelected.crossOrigin = "Anonymous";
  }
  getImageDef() {
    return this.img;
  }
  getImageSel() {
    return this.imgSelected;
  }
  setWidth(width) {
    this.img.width = width;
    this.imgSelected.width = width;
  }
  setHeight(height) {
    this.img.height = height;
    this.imgSelected.height = height;
  }
  getWidth() {
    return this.img.width;
  }
  getHeight() {
    return this.img.height;
  }
  isImgSelected() {
    return this.isSelected;
  }
  getImg(isSelected) {
    return isSelected ? this.imgSelected : this.img;
  }
  toggleSelectStatus() {
    this.isSelected = !this.isSelected;
  }
  isClicked(x, y) {
    return (
      x > this.x &&
      x < this.x + this.img.width &&
      y > this.y &&
      y < this.y + this.img.height
    );
  }
  getX() {
    return this.x;
  }
  getY() {
    return this.y;
  }
  draw(ctx) {
    const image = this.isSelected ? this.imgSelected : this.img;
    ctx.drawImage(image, this.x, this.y, image.width, image.height);
    //For debugging purposes
    ctx.strokeStyle = "green";
    ctx.strokeRect(this.x, this.y, image.width, image.height);
    return true;
  }
  setX(x) {
    this.x = x;
  }
  setY(y) {
    this.y = y;
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
