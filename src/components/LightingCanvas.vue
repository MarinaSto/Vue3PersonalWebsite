<script setup>
import { onMounted } from "vue";
import { rng, randomColorHsla } from "@/helper.js";

class Circle {
  constructor(
    cx,
    cy,
    r,
    color,
    shadowColor,
    shadowBlur = 80,
    shadowOffset = 2
  ) {
    this.cx = cx;
    this.cy = cy;
    this.r = r;
    this.shadowBlur = shadowBlur;
    this.shadowOffset = shadowOffset;
    this.color = color;
    this.shadowColor = shadowColor;
  }
  draw(ctx) {
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.cx, this.cy, this.r, 0, Math.PI * 2, true);
    ctx.shadowBlur = this.shadowBlur;
    ctx.shadowOffsetX = this.shadowOffset;
    ctx.shadowOffsetY = this.shadowOffset;
    ctx.shadowColor = this.shadowColor;
    ctx.globalCompositeOperation = "lighter";
    ctx.fill();
  }
  move(dx, dy) {
    this.cx += dx;
    this.cy += dy;
  }
  scale(scalingFactor) {
    this.r *= scalingFactor;
  }
  static generateRandom(minX, maxX, minY, maxY, minR, maxR) {
    let x = rng(minX, maxX);
    let y = rng(minY, maxY);
    let r = rng(minR, maxR);
    return new Circle(x, y, r, randomColorHsla(), randomColorHsla());
  }
}

onMounted(() => {
  window.requestAnimFrame = (function () {
    return (
      window.requestAnimationFrame ||
      window.webkitRequestAnimationFrame ||
      window.mozRequestAnimationFrame ||
      window.oRequestAnimationFrame ||
      window.msRequestAnimationFrame ||
      function (callback) {
        window.setTimeout(callback, 1000 / 60);
      }
    );
  })();
  var c = document.getElementById("lightsCanvas");
  var ctx = c.getContext("2d");
  var w = (c.width = window.innerWidth);
  var h = (c.height = window.innerHeight);
  var _w = w * 0.5;
  var _h = h * 0.5;
  var arr = [];
  var cnt = 0;

  window.addEventListener("load", resize);
  window.addEventListener("resize", resize, false);

  function resize() {
    c.width = w = window.innerWidth;
    c.height = h = window.innerHeight;
    c.style.position = "absolute";
    c.style.left = (window.innerWidth - w) * 0.01 + "px";
    c.style.top = (window.innerHeight - h) * 0.01 + "px";
  }

  function anim() {
    cnt++;
    if (cnt % 6) draw();
    window.requestAnimFrame(anim);
  }
  anim();

  function draw() {
    var splot = Circle.generateRandom(
      -_w * 0.5,
      2.5 * _w,
      -_h * 0.5,
      2.5 * _h,
      20,
      80
    );

    arr.push(splot);
    while (arr.length > 100) {
      arr.shift();
    }
    ctx.clearRect(0, 0, w, h);

    for (var i = 0; i < arr.length; i++) {
      splot = arr[i];
      splot.draw(ctx);

      splot.move(rng(-1, 1), rng(-1, 1));
      splot.scale(0.96);
    }
  }
});
</script>

<template>
  <div id="lightingCanvas">
    <canvas id="lightsCanvas"></canvas>
  </div>
</template>

<style scoped>
#lightingCanvas {
  width: 100%;
  height: 100%;
  margin: 0;
  overflow: hidden;
  background: hsla(0, 5%, 5%, 1);
  background-repeat: no-repeat;
  background-attachment: fixed;
  background-image: linear-gradient(
    to right top,
    hsla(0, 5%, 15%, 0.5),
    hsla(0, 5%, 5%, 1)
  );

  background-image: -moz-linear-gradient(
    to right top,
    hsla(0, 5%, 15%, 0.5),
    hsla(0, 5%, 5%, 1)
  );
}
div {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
