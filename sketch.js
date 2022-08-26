// For it to run you need a local server (check: https://github.com/processing/p5.js/wiki/Local-server)
p5.disableFriendlyErrors = true;

let ropes = [];
let dragging = -1;
let vert = -1;
let cloth;

let canvas;

let gravity;

let tear;

let isClothMode = true;

let stress;

let dots;

function setup() {
  // put setup code here
  document.oncontextmenu = function () {
    return false;
  };

  createElement("h1", "Cloth/Rope simulation based on Verlet integration");
  createElement("p", "Left click to move and right click to delete");
  // canvas = createCanvas(800, 800);
  canvas = createCanvas(windowWidth * 0.7, windowHeight * 0.8);

  canvas.mousePressed(mp);
  canvas.mouseClicked(mc);

  cloth = new Cloth(31, 20);

  gravity = createSlider(-0.1, 0.4, 0.1, 0.01);

  dots = createCheckbox("Dots", false);
  tear = createCheckbox("Tear", false);

  stress = createCheckbox("Stress", false);

  button = createButton("Rope mode");
  button.mousePressed(toggle);
  pixelDensity(1);
}

/* function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
} */

function toggle() {
  if (isClothMode) {
    button.html("Cloth Mode");
    cloth = null;
    ropes.push(new Rope(20, 20, createVector(100, 100)));
    isClothMode = false;
  } else {
    button.html("Rope Mode");
    ropes = [];
    cloth = new Cloth(29, 20);
    isClothMode = true;
  }
}

function mp() {
  if (mouseButton === LEFT) {
    if (!isClothMode) {
      for (let i = 0; i < ropes.length; i++) {
        let ind = ropes[i].isPressed(mouseX, mouseY);
        if (ind != -1) {
          dragging = i;
          vert = ind;
          return;
        }
      }
    }
    if (isClothMode) {
      l = cloth.isPressed(mouseX, mouseY);
      if (l[0] != -1) {
        dragging = l[0];
        vert = l[1];
        return;
      }
    }
  }
  dragging = -1;
}

function mc() {
  if (!isClothMode)
    if (dragging == -1)
      ropes.push(new Rope(20, 20, createVector(mouseX, mouseY)));
}

function mousePressed() {
  if (mouseX < 0 || mouseX > width || mouseY < 0 || mouseY > height)
    dragging = -1;
}

function mouseClicked() {
  if (mouseX < 0 || mouseX > width || mouseY < 0 || mouseY > height)
    dragging = -1;
}

function draw() {
  // put drawing code here

  background(255);

  if (mouseIsPressed) {
    if (!isClothMode && dragging >= 0)
      ropes[dragging].move(mouseX, mouseY, vert);
    if (isClothMode && dragging >= 0)
      cloth.move(mouseX, mouseY, dragging, vert);
    if (mouseButton === RIGHT) {
      if (!isClothMode)
        for (let i = 0; i < ropes.length; i++) {
          ropes[i].break(mouseX, mouseY);
        }
      if (isClothMode) {
        cloth.break(mouseX, mouseY);
      }
    }
  }

  for (let i = 0; i < ropes.length; i++) {
    ropes[i].display();
    ropes[i].update();
  }
  if (cloth) {
    cloth.display();
    cloth.update();
  }

  let fps = frameRate();
  noStroke();
  fill(0);
  text("FPS: " + fps.toFixed(2), 10, height - 10);
}