export const ElementTypes = {
  fuse: "_fuse",
  switch: "_switch",
  bulb: "_bulb",
  wire: "_wire",
};

export class Element {
  constructor(x, y, type, asset) {
    this.type = type;
    this.x = x;
    this.y = y;
    this.width = 50;
    this.height = 50;
    this.asset = asset;
    this.isSelected = false;
  }

  draw(ctx) {
    const image = this.asset.getImg(this.isSelected);
    ctx.drawImage(image, this.x, this.y, image.width, image.height);
    //For debugging purposes
    ctx.strokeStyle = "green";
    ctx.strokeRect(this.x, this.y, image.width, image.height);
    return true;
  }

  isClicked(mousex, mousey) {
    return (
      mousex > this.x &&
      mousex < this.x + this.width &&
      mousey > this.y &&
      mousey < this.y + this.height
    );
  }

  toggelSelectStatus() {
    this.isSelected = !this.isSelected;
  }

  setX(x) {
    this.x = x;
  }
  setY(y) {
    this.y = y;
  }
  getX() {
    return this.x;
  }
  getY() {
    return this.y;
  }
}

export class Board {
  constructor(canvas, assetManager) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.assetManager = assetManager;
    this.draggedAsset = null;
    this.clickOffsetX = 0;
    this.clickOffsetY = 0;
    this.cellSize = 50;
    this.width = this.canvas.width;
    this.height = this.canvas.height;
    this.elements = [];
    this.draggableElement = null;

    // Bind the methods to this instance
    this.handleMouseDown = this.handleMouseDown.bind(this);
    this.handleMouseUp = this.handleMouseUp.bind(this);
    this.handleMouseMove = this.handleMouseMove.bind(this);
  }

  addElement(element) {
    this.elements.push(element);
  }

  handleMouseDown(event) {
    const rect = this.canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    console.log("Mouse down at", x, y);

    for (let element of this.elements) {
      if (element.isClicked(x, y)) {
        this.draggableElement = element;
        this.clickOffsetX = x - element.getX();
        this.clickOffsetY = y - element.getY();
        break;
      }
    }
  }

  handleMouseUp(event) {
    this.draggableElement = null;
  }

  handleMouseMove(event) {
    if (this.draggableElement) {
      const rect = this.canvas.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;

      this.draggableElement.setX(x - this.clickOffsetX);
      this.draggableElement.setY(y - this.clickOffsetY);
    }
  }

  draw() {
    this.ctx.clearRect(0, 0, this.width, this.height);
    this.ctx.fillStyle = "lightgray";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    this.elements.forEach((element) => element.draw(this.ctx));
  }
}
