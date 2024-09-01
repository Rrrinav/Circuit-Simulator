export class Board {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");  
    this.assetManager = assManager;
    this.draggedAsset = null;
    this.clickOffsetX = 0;
    this.clickOffsetY = 0;
    this.cellSize = 50;
    this.width = this.canvas.width;
    this.height = this.canvas.height;
  }
}
