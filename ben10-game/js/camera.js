class Camera {
  constructor(canvasWidth, canvasHeight) {
    this.x = 0; this.y = 0;
    this.targetX = 0; this.targetY = 0;
    this.width = canvasWidth; this.height = canvasHeight;
    this.smoothFactor = 0.055;
    this.offsetX = 0; this.offsetY = 0;
    this.zoom = 1;
    this.targetZoom = 1;
  }

  follow(target, levelWidth, levelHeight) {
    this.targetX = target.x + target.width / 2 - this.width / 2;
    this.targetY = target.y + target.height / 2 - this.height / 2;

    this.x += (this.targetX - this.x) * this.smoothFactor;
    this.y += (this.targetY - this.y) * this.smoothFactor;

    this.zoom += (this.targetZoom - this.zoom) * 0.1;

    this.x = Math.max(0, Math.min(this.x, levelWidth - this.width));
    this.y = Math.max(0, Math.min(this.y, levelHeight - this.height));
  }

  setZoom(z) { this.targetZoom = z; }
}
