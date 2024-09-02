export const ElementTypes = {
  fuse: "_fuse",
  switch: "_switch",
  bulb: "_bulb",
  wire: "_wire",
};

export class Element {
  constructor(gridX, gridY, type, asset) {
    this.gridX = gridX; // Grid position X
    this.gridY = gridY; // Grid position Y
    this.type = type;
    this.asset = asset;
    this.isSelected = false;
  }

  draw(ctx, cellSize) {
    const image = this.asset.getImg(this.isSelected);
    const x = this.gridX * cellSize;
    const y = this.gridY * cellSize;

    ctx.drawImage(image, x, y, cellSize, cellSize);

    // For debugging purposes
    ctx.strokeStyle = "black";
    ctx.strokeRect(x, y, cellSize, cellSize);
  }

  isClicked(mouseX, mouseY, cellSize) {
    const x = this.gridX * cellSize;
    const y = this.gridY * cellSize;
    return (
      mouseX > x && mouseX < x + cellSize && mouseY > y && mouseY < y + cellSize
    );
  }

  toggelSelectStatus() {
    this.isSelected = !this.isSelected;
  }
  
  setGridPosition(gridX, gridY) {
    this.gridX = gridX;
    this.gridY = gridY;
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
    this.elements = [];
    this.draggableElement = null;

    // Define grid size
    this.cellSize = Math.max(canvas.width, canvas.height) / 20;
    this.gridWidth = Math.floor(canvas.width / this.cellSize);
    this.gridHeight = Math.floor(canvas.height / this.cellSize);

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

    const gridX = Math.floor(x / this.cellSize);
    const gridY = Math.floor(y / this.cellSize);

    for (let element of this.elements) {
      if (element.isClicked(x, y, this.cellSize)) {
        element.toggelSelectStatus();
        this.draggableElement = element;
        this.clickOffsetX = gridX - element.gridX;
        this.clickOffsetY = gridY - element.gridY;
        break;
      }
    }
  }

  handleMouseUp(event) {
    if (this.draggableElement) {
      this.draggableElement.setGridPosition(
        this.draggableElement.gridX + this.clickOffsetX,
        this.draggableElement.gridY + this.clickOffsetY,
      );
    }
    this.draggableElement = null;
  }

  handleMouseMove(event) {
    if (this.draggableElement) {
      const rect = this.canvas.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;

      const gridX = Math.floor(x / this.cellSize);
      const gridY = Math.floor(y / this.cellSize);

      this.draggableElement.setGridPosition(
        gridX - this.clickOffsetX,
        gridY - this.clickOffsetY,
      );
    }
  }

  draw() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.fillStyle = "lightgray";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    this.ctx.strokeStyle = "green";
    // Draw grid lines (optional)
    for (let i = 0; i <= this.gridWidth; i++) {
      this.ctx.beginPath();
      this.ctx.moveTo(i * this.cellSize, 0);
      this.ctx.lineTo(i * this.cellSize, this.canvas.height);
      this.ctx.stroke();
    }

    for (let j = 0; j <= this.gridHeight; j++) {
      this.ctx.beginPath();
      this.ctx.moveTo(0, j * this.cellSize);
      this.ctx.lineTo(this.canvas.width, j * this.cellSize);
      this.ctx.stroke();
    }

    // Draw all elements aligned to the grid
    this.elements.forEach((element) => element.draw(this.ctx, this.cellSize));
  }
}
