// =======================================================================
//      >>  ElementTypes
// =======================================================================
export const ElementTypes = {
  fuse: "_fuse",
  switch: "_switch",
  bulb: "_bulb",
  wire: "_wire",
  battery: "_battery",
  resistor: "_resistor",
};
// =======================================================================
//      >>  ElementTypes
// =======================================================================
export class Element {
  constructor(gridX, gridY, type) {
    this.gridX = gridX;
    this.gridY = gridY;
    this.type = type;
    this.isSelected = false;
    this.connectedElements = [];
  }

  draw(ctx, cellSize, assetMannager) {
    const image = assetMannager.getAsset(this.type).getImg(this.isSelected);
    const x = this.gridX * cellSize;
    const y = this.gridY * cellSize;
    ctx.drawImage(image, x, y, cellSize, cellSize);
  }

  isClicked(mouseX, mouseY, cellSize) {
    const x = this.gridX * cellSize;
    const y = this.gridY * cellSize;
    return (
      mouseX > x && mouseX < x + cellSize && mouseY > y && mouseY < y + cellSize
    );
  }

  isClickedOnLeftTerminal(mouseX, mouseY, cellSize, tolerance = 10) {
    const x = this.gridX * cellSize;
    const y = this.gridY * cellSize;
    const tol = tolerance;
    return (
      mouseX < x + tol &&
      mouseX > x - tol &&
      mouseY < y + cellSize / 2 + tol &&
      mouseY > y + cellSize / 2 - tol
    );
  }

  isClickedOnRightTerminal(mouseX, mouseY, cellSize, tolerance = 10) {
    const x = this.gridX * cellSize;
    const y = this.gridY * cellSize;
    const tol = tolerance;
    return (
      mouseX < x + cellSize + tol &&
      mouseX > x + cellSize - tol &&
      mouseY < y + cellSize / 2 + tol &&
      mouseY > y + cellSize / 2 - tol
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

// =======================================================================
//      >>  WIRE CLASS
// =======================================================================

// TODO: > Wires don't have to begin from middle of the cell but from the terminal
//         they are started from (left or right)
//       > Populate the connectedElements array properly
//       > Deletion of wires
//       > Wires should be allowed to pass over other of their kind without connections
//                - This has to be visualized properly!

export class Wire {
  constructor(startGridX, startGridY, startTerminal) {
    this.segments = [{ x: startGridX, y: startGridY, terminal: startTerminal }];
    this.isComplete = false;
  }

  addSegment(x, y, terminal = null) {
    const lastSegment = this.segments[this.segments.length - 1];
    if (x !== lastSegment.x || y !== lastSegment.y) {
      // Determine whether to add a horizontal or vertical segment
      if (x !== lastSegment.x) {
        // Add horizontal segment
        this.segments.push({ x: x, y: lastSegment.y, terminal: null });
      }
      if (y !== lastSegment.y) {
        // Add vertical segment
        this.segments.push({ x: x, y: y, terminal: terminal });
      }
    }
  }

  complete(endTerminal) {
    this.isComplete = true;
    this.segments[this.segments.length - 1].terminal = endTerminal;
  }

  draw(ctx, cellSize) {
    ctx.strokeStyle = this.isComplete ? "black" : "gray";
    ctx.lineWidth = 4;
    ctx.beginPath();

    const startSegment = this.segments[0];
    let startX = startSegment.x * cellSize + cellSize / 2;
    let startY = startSegment.y * cellSize + cellSize / 2;

    // Adjust start point based on the starting terminal
    if (startSegment.terminal === "left") {
      startX = startSegment.x * cellSize;
    } else if (startSegment.terminal === "right") {
      startX = (startSegment.x + 1) * cellSize;
    }

    ctx.moveTo(startX, startY);

    for (let i = 1; i < this.segments.length; i++) {
      const segment = this.segments[i];
      let endX = segment.x * cellSize + cellSize / 2;
      let endY = segment.y * cellSize + cellSize / 2;

      // Adjust end point for the last segment
      if (i === this.segments.length - 1) {
        if (segment.terminal === "left") {
          endX = segment.x * cellSize;
        } else if (segment.terminal === "right") {
          endX = (segment.x + 1) * cellSize;
        }
      }

      ctx.lineTo(endX, endY);
    }

    ctx.stroke();
  }
}

// =======================================================================
//      >> BOARD CLASS
// =======================================================================
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

    this.cellSize = Math.max(canvas.width, canvas.height) / 20;
    this.gridWidth = Math.floor(canvas.width / this.cellSize);
    this.gridHeight = Math.floor(canvas.height / this.cellSize);

    this.elements = [];
    this.wires = [];
    this.currentWire = null;
    this.isDrawingWire = false;
    this.lastWireGridX = null;
    this.lastWireGridY = null;

    this.handleMouseDown = this.handleMouseDown.bind(this);
    this.handleMouseUp = this.handleMouseUp.bind(this);
    this.handleMouseMove = this.handleMouseMove.bind(this);
    this.handleKeyDown = this.handleKeyDown.bind(this);

    this.canvas.addEventListener("mousedown", this.handleMouseDown);
    this.canvas.addEventListener("mouseup", this.handleMouseUp);
    this.canvas.addEventListener("mousemove", this.handleMouseMove);
    document.addEventListener("keydown", this.handleKeyDown);
  }

  getElement(gridX_, gridY_) {
    return this.elements.find((e) => e.gridX == gridX_ && e.gridY == gridY_);
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

    const clickedElement = this.elements.find((element) =>
      element.isClicked(x, y, this.cellSize),
    );

    if (clickedElement) {
      if (clickedElement.isClickedOnLeftTerminal(x, y, this.cellSize, 20)) {
        this.isDrawingWire = true;
        this.currentWire = new Wire(gridX, gridY, "left");
        this.lastWireGridX = gridX;
        this.lastWireGridY = gridY;
        return;
      } else if (
        clickedElement.isClickedOnRightTerminal(x, y, this.cellSize, 20)
      ) {
        this.isDrawingWire = true;
        this.currentWire = new Wire(gridX, gridY, "right");
        this.lastWireGridX = gridX;
        this.lastWireGridY = gridY;
        return;
      }

      // Toggle selection of the clicked element
      clickedElement.toggelSelectStatus();

      // If the clicked element is different from the last selected element
      if (
        this.lastSelectedElement &&
        this.lastSelectedElement !== clickedElement
      ) {
        this.lastSelectedElement.toggelSelectStatus(); // Deselect the previous element
      }

      // Update the last selected element
      this.lastSelectedElement = clickedElement.isSelected
        ? clickedElement
        : null;

      // Set up for dragging
      this.draggableElement = clickedElement;
      this.clickOffsetX = gridX - clickedElement.gridX;
      this.clickOffsetY = gridY - clickedElement.gridY;
    } else if (this.isDrawingWire) {
      // If we're drawing a wire and clicked on an empty cell, add a new segment
      this.currentWire.addSegment(gridX, gridY);
      this.lastWireGridX = gridX;
      this.lastWireGridY = gridY;
    } else {
      // If clicked on empty space and not drawing a wire, add a new element
      if (this.lastSelectedElement) {
        this.lastSelectedElement.toggelSelectStatus();
        this.lastSelectedElement = null;
      }
      const newElement = new Element(
        gridX,
        gridY,
        this.selectedElementToBeDrawn,
        this.assetManager,
      );
      this.addElement(newElement);
    }
  }

  handleMouseUp(event) {
    const { x, y } = this.getMousePosition(event);
    const gridX = Math.floor(x / this.cellSize);
    const gridY = Math.floor(y / this.cellSize);

    if (this.isDrawingWire && this.currentWire) {
      const element = this.elements.find((element) =>
        element.isClicked(x, y, this.cellSize),
      );

      if (element) {
        let endTerminal = null;
        if (element.isClickedOnLeftTerminal(x, y, this.cellSize, 20)) {
          endTerminal = "left";
        } else if (element.isClickedOnRightTerminal(x, y, this.cellSize, 20)) {
          endTerminal = "right";
        }

        if (endTerminal) {
          this.currentWire.addSegment(gridX, gridY, endTerminal);
          this.currentWire.complete(endTerminal);
          this.wires.push(this.currentWire);
          this.currentWire = null;
          this.isDrawingWire = false;
          this.lastWireGridX = null;
          this.lastWireGridY = null;
          return;
        }
      }

      // If not ending on an element terminal, complete the wire at the cell center
      this.currentWire.addSegment(gridX, gridY);
      this.currentWire.complete(null);
      this.wires.push(this.currentWire);
      this.currentWire = null;
      this.isDrawingWire = false;
      this.lastWireGridX = null;
      this.lastWireGridY = null;
    }

    if (this.draggableElement) {
      this.draggableElement.setGridPosition(
        gridX - this.clickOffsetX,
        gridY - this.clickOffsetY,
      );
    }
    this.draggableElement = null;
  }

  handleMouseMove(event) {
    const { x, y } = this.getMousePosition(event);
    const gridX = Math.floor(x / this.cellSize);
    const gridY = Math.floor(y / this.cellSize);

    if (this.isDrawingWire && this.currentWire) {
      // Only add a new segment if the mouse has moved to a new grid cell
      if (gridX !== this.lastWireGridX || gridY !== this.lastWireGridY) {
        this.currentWire.addSegment(gridX, gridY);
        this.lastWireGridX = gridX;
        this.lastWireGridY = gridY;
      }
    }

    if (this.draggableElement) {
      this.draggableElement.setGridPosition(
        gridX - this.clickOffsetX,
        gridY - this.clickOffsetY,
      );
    }
  }

  handleKeyDown(event) {
    if (event.key === "Backspace" && this.lastSelectedElement) {
      this.elements = this.elements.filter(
        (element) => element !== this.lastSelectedElement,
      );
      this.lastSelectedElement = null;
    }
  }

  setSelectedElementToBeDrawn(type) {
    this.selectedElementToBeDrawn = type;
  }

  draw() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.fillStyle = "#e1e1e1";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    this.ctx.strokeStyle = "#99aabb";
    this.ctx.lineWidth = 1;
    // Draw pluses at grid intersections
    for (let i = 0; i < this.gridWidth; i++) {
      for (let j = 0; j < this.gridHeight; j++) {
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

    // Draw completed wires
    this.wires.forEach((wire) => wire.draw(this.ctx, this.cellSize));

    // Draw the wire being currently drawn
    if (this.currentWire) {
      this.currentWire.draw(this.ctx, this.cellSize);
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
