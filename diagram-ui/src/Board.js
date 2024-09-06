export const ElementTypes = {
  fuse: "_fuse",
  switch: "_switch",
  bulb: "_bulb",
  wire: "_wire",
  battery: "_battery",
};

export class Element {
  constructor(gridX, gridY, type) {
    this.gridX = gridX; // Grid position X
    this.gridY = gridY; // Grid position Y
    this.type = type;
    this.isSelected = false;
    this.connectedElements = [];
  }

  draw(ctx, cellSize, assetMannager) {
    const image = assetMannager.getAsset(this.type).getImg(this.isSelected);

    const x = this.gridX * cellSize;
    const y = this.gridY * cellSize;

    ctx.drawImage(image, x, y, cellSize, cellSize);

    // // For debugging purposes
    // ctx.strokeStyle = "black";
    // ctx.strokeRect(x, y, cellSize, cellSize);
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

  connectTo(element) {
    this.connectedElements.push(element);
  }

  getConnectedElements() {
    return this.connectedElements;
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
    this.draggableElement = null;
    this.lastSelectedElement = null;
    this.selectedElementToBeDrawn = ElementTypes.fuse;

    this.menuHeight = 60;
    // Define grid size
    this.cellSize = Math.max(canvas.width, canvas.height) / 20;
    this.gridWidth = Math.floor(canvas.width / this.cellSize);
    this.gridHeight = Math.floor(canvas.height / this.cellSize);

    this.elements = [];

    // Bind the methods to this instance
    this.handleMouseDown = this.handleMouseDown.bind(this);
    this.handleMouseUp = this.handleMouseUp.bind(this);
    this.handleMouseMove = this.handleMouseMove.bind(this);
    this.handleKeyDown = this.handleKeyDown.bind(this);

    // Add event listeners directly to the canvas
    this.canvas.addEventListener("mousedown", this.handleMouseDown);
    this.canvas.addEventListener("mouseup", this.handleMouseUp);
    this.canvas.addEventListener("mousemove", this.handleMouseMove);
    document.addEventListener("keydown", this.handleKeyDown);
  }

  getMousePosition(event) {
    const rect = this.canvas.getBoundingClientRect();
    const scaleX = this.canvas.width / rect.width;
    const scaleY = this.canvas.height / rect.height;

    return {
      x: (event.clientX - rect.left) * scaleX,
      y: (event.clientY - rect.top) * scaleY,
    };
  }

  addElement(element) {
    this.elements.push(element);
  }

  handleMouseDown(event) {
    const { x, y } = this.getMousePosition(event);
    const gridX = Math.floor(x / this.cellSize);
    const gridY = Math.floor(y / this.cellSize);

    for (let element of this.elements) {
      if (element.isClicked(x, y, this.cellSize)) {
        if (this.lastSelectedElement) {
          this.lastSelectedElement.toggelSelectStatus();
        }

        if (this.lastSelectedElement === element) {
          this.lastSelectedElement = null;
        } else {
          this.lastSelectedElement = element;
          element.toggelSelectStatus();
        }

        this.draggableElement = element;
        this.clickOffsetX = gridX - element.gridX;
        this.clickOffsetY = gridY - element.gridY;
        return;
      }
    }

    this.addElement(
      new Element(
        gridX,
        gridY,
        this.selectedElementToBeDrawn,
        this.assetManager,
      ),
    );
  }

  setSelectedElementToBeDrawn(type) {
    this.selectedElementToBeDrawn = type;
  }

  handleMouseUp(event) {
    if (this.draggableElement) {
      const { x, y } = this.getMousePosition(event);
      const gridX = Math.floor(x / this.cellSize);
      const gridY = Math.floor(y / this.cellSize);

      this.draggableElement.setGridPosition(
        gridX - this.clickOffsetX,
        gridY - this.clickOffsetY,
      );
    }
    this.draggableElement = null;
  }

  handleKeyDown(event) {
    if (event.key === "Backspace" && this.lastSelectedElement) {
      this.elements = this.elements.filter(
        (element) => element !== this.lastSelectedElement,
      );
      this.lastSelectedElement = null;
    }
  }

  handleMouseMove(event) {
    if (this.draggableElement) {
      const { x, y } = this.getMousePosition(event);
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
    this.ctx.fillStyle = "#e1e1e1";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    this.ctx.strokeStyle = "#99aabb";
    // Draw pluses at grid intersections
    for (let i = 0; i <= this.gridWidth; i++) {
      for (let j = 0; j <= this.gridHeight; j++) {
        const x = i * this.cellSize;
        const y = j * this.cellSize;

        // Draw a plus sign at each grid intersection
        this.ctx.beginPath();
        // Vertical part of the plus
        this.ctx.moveTo(x, y - 5);
        this.ctx.lineTo(x, y + 5);
        // Horizontal part of the plus
        this.ctx.moveTo(x - 5, y);
        this.ctx.lineTo(x + 5, y);
        this.ctx.stroke();
      }
    }

    // Draw all elements aligned to the grid
    this.elements.forEach((element) =>
      element.draw(this.ctx, this.cellSize, this.assetManager),
    );
  }

  updateCanvasSize(width, height) {
    this.canvas.width = width;
    this.canvas.height = height;
    this.cellSize = Math.max(width, height) / 20;
    this.gridWidth = Math.floor(width / this.cellSize);
    this.gridHeight = Math.floor(height / this.cellSize);
  }

  destroy() {
    // Remove event listeners when the board is no longer needed
    this.canvas.removeEventListener("mousedown", this.handleMouseDown);
    this.canvas.removeEventListener("mouseup", this.handleMouseUp);
    this.canvas.removeEventListener("mousemove", this.handleMouseMove);
    document.removeEventListener("keydown", this.handleKeyDown);
  }
}
