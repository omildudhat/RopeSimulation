function Point(x, y, l) {
    this.x = x;
    this.y = y;
    this.px = x;
    this.py = y;
    this.locked = l;
  
    this.radius = 8;
  
    this.display = function () {
      if (dots.checked() && this.x && this.y) {
        if (this.locked) fill(255, 0, 0);
        else fill(255);
        circle(this.x, this.y, this.radius);
      }
    };
  
    this.update = function () {
      if (this.x && this.y) {
        if (!this.locked) {
          old_x = this.x;
          old_y = this.y;
  
          if (gravity.value()) this.y += gravity.value();
          else this.y += 0.1;
  
          this.x += this.x - this.px;
          this.y += this.y - this.py;
  
          this.px = old_x;
          this.py = old_y;
        }
        if (this.x >= width - this.radius) this.x = width - this.radius;
        if (this.x <= this.radius) this.x = this.radius;
        if (this.y >= height - this.radius) this.y = height - this.radius;
        if (this.y <= this.radius) this.y = this.radius;
      }
    };
  
    this.isPressed = function (x, y) {
      if (dist(x, y, this.x, this.y) <= this.radius * 1.5) {
        return true;
      }
      return false;
    };
  }
  
  function pickHex(color1, color2, weight) {
    var w1 = weight;
    var w2 = 1 - w1;
    var rgb = [
      Math.round(color1[0] * w1 + color2[0] * w2),
      Math.round(color1[1] * w1 + color2[1] * w2),
      Math.round(color1[2] * w1 + color2[2] * w2),
    ];
    return rgb;
  }
  
  function Line(p1, p2, l) {
    this.p1 = p1;
    this.p2 = p2;
    this.l = l;
  
    this.display = function () {
      if (this.p1 && this.p2) {
        // strokeWeight(0.5);
        if (stress.checked()) {
          n =
            0.08 +
            dist(this.p1.x, this.p1.y, this.p2.x, this.p2.y) / (5 * this.l);
          rgb = pickHex([255, 0, 0], [0, 255, 0], n);
          stroke(rgb[0], rgb[1], rgb[2]);
        } else stroke(0);
  
        line(p1.x, p1.y, p2.x, p2.y);
      }
    };
  
    this.update = function () {
      if (this.p1 && this.p2) {
        for (let i = 0; i < 1; i++) {
          let c = createVector(
            (this.p1.x + this.p2.x) / 2,
            (this.p1.y + this.p2.y) / 2
          );
          let dir = createVector(
            (this.p1.x - this.p2.x) / 2,
            (this.p1.y - this.p2.y) / 2
          ).normalize();
  
          if (!this.p1.locked) {
            this.p1.x = c.x + (dir.x * this.l) / 2;
            this.p1.y = c.y + (dir.y * this.l) / 2;
          }
          if (!this.p2.locked) {
            this.p2.x = c.x - (dir.x * this.l) / 2;
            this.p2.y = c.y - (dir.y * this.l) / 2;
          }
        }
      }
    };
  }
  
  function Rope(npoints, width, start) {
    this.npoints = npoints;
    this.width = width;
    this.start = start;
  
    this.points = [];
    this.lines = [];
  
    let locked = false;
    for (let i = 0; i < this.npoints; i++) {
      if (i == 0) locked = true;
      else locked = false;
      this.points[i] = new Point(
        this.start.x,
        this.start.y + this.width * i,
        locked
      );
      if (i > 0)
        this.lines[i - 1] = new Line(
          this.points[i - 1],
          this.points[i],
          this.width
        );
    }
  
    this.isPressed = function (x, y) {
      for (let i = 0; i < this.points.length; i++) {
        if (this.points[i].isPressed(x, y)) {
          return i;
        }
      }
      return -1;
    };
  
    this.break = function (x, y) {
      // this.lines.splice(i, 1);
      for (let i = 0; i < this.lines.length; i++) {
        let d1 = dist(x, y, this.lines[i].p1.x, this.lines[i].p1.y);
        let d2 = dist(x, y, this.lines[i].p2.x, this.lines[i].p2.y);
        let l = dist(
          this.lines[i].p1.x,
          this.lines[i].p1.y,
          this.lines[i].p2.x,
          this.lines[i].p2.y
        );
        if (d1 + d2 >= l - 1 && d1 + d2 <= l + 1) this.lines.splice(i, 1);
      }
    };
  
    this.move = function (x, y, i) {
      this.points[i].x = x;
      this.points[i].y = y;
    };
  
    this.display = function () {
      for (let i = 0; i < this.lines.length; i++) {
        this.lines[i].display();
      }
      for (let i = 0; i < this.points.length; i++) {
        this.points[i].display();
      }
    };
  
    this.update = function () {
      for (let i = 0; i < this.points.length; i++) {
        this.points[i].update();
      }
      for (let i = 0; i < this.lines.length; i++) {
        if (
          tear.checked() &&
          dist(
            this.lines[i].p1.x,
            this.lines[i].p1.y,
            this.lines[i].p2.x,
            this.lines[i].p2.y
          ) >=
            5 * this.lines[i].l
        ) {
          this.lines.splice(i, 1);
        }
        this.lines[i].update();
      }
    };
  }
  
  function Cloth(npoints, w) {
    this.npoints = npoints;
    this.width = w;
  
    this.start = createVector((width - (this.npoints - 1) * this.width) / 2, 10);
  
    this.grid = [];
    this.lines = [];
  
    let k = 0;
    let locked = false;
    for (let i = 0; i < this.npoints; i++) {
      this.grid[i] = [];
      for (let j = 0; j < this.npoints; j++) {
        if (i == 0 && j % 3 == 0) locked = true;
        else locked = false;
        this.grid[i][j] = new Point(
          this.start.x + this.width * j,
          this.start.y + this.width * i,
          locked
        );
        if (j > 0)
          this.lines[k++] = new Line(
            this.grid[i][j - 1],
            this.grid[i][j],
            this.width
          );
        if (i > 0)
          this.lines[k++] = new Line(
            this.grid[i - 1][j],
            this.grid[i][j],
            this.width
          );
      }
    }
  
    this.isPressed = function (x, y) {
      for (let i = 0; i < this.grid.length; i++) {
        for (let j = 0; j < this.grid[i].length; j++) {
          if (this.grid[i][j].isPressed(x, y)) {
            return [i, j];
          }
        }
      }
      return [-1, -1];
    };
  
    this.break = function (x, y) {
      for (let i = 0; i < this.lines.length; i++) {
        let d1 = dist(x, y, this.lines[i].p1.x, this.lines[i].p1.y);
        let d2 = dist(x, y, this.lines[i].p2.x, this.lines[i].p2.y);
        let l = dist(
          this.lines[i].p1.x,
          this.lines[i].p1.y,
          this.lines[i].p2.x,
          this.lines[i].p2.y
        );
        if (d1 + d2 >= l - 1 && d1 + d2 <= l + 1) this.lines.splice(i, 1);
      }
      return -1;
    };
  
    this.move = function (x, y, i, j) {
      this.grid[i][j].x = x;
      this.grid[i][j].y = y;
    };
  
    this.display = function () {
      for (let i = 0; i < this.lines.length; i++) {
        this.lines[i].display();
      }
      for (let i = 0; i < this.npoints; i++) {
        for (let j = 0; j < this.npoints; j++) {
          this.grid[i][j].display();
        }
      }
    };
  
    this.update = function () {
      for (let i = 0; i < this.npoints; i++) {
        for (let j = 0; j < this.npoints; j++) {
          if (this.lines[i]) this.grid[i][j].update();
        }
      }
      for (let i = 0; i < this.lines.length; i++) {
        // print(tear.value())
        if (
          tear.checked() &&
          dist(
            this.lines[i].p1.x,
            this.lines[i].p1.y,
            this.lines[i].p2.x,
            this.lines[i].p2.y
          ) >=
            5 * this.lines[i].l
        ) {
          this.lines.splice(i, 1);
        }
        this.lines[i].update();
      }
    };
  }