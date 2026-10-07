<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, Teleport, watch } from "vue";

const props = withDefaults(
  defineProps<{
    targetElement: HTMLElement;
    containerElement: HTMLElement;
    isImage?: boolean;
    active?: boolean;
    forceActive?: boolean;
    color?: string;
    radius?: number;
    speed?: number;
    chaos?: number;
  }>(),
  {
    isImage: false,
    active: false,
    forceActive: false,
    speed: 1,
    chaos: 0.12,
  },
);

const canvas = ref<HTMLCanvasElement | null>(null);
const rootStyle = ref<Record<string, string>>({});
const isHovered = ref(false);
const shouldAnimate = computed(
  () => isHovered.value || props.active || props.forceActive,
);

let animationFrame = 0;
let resizeObserver: ResizeObserver | undefined;
let intersectionObserver: IntersectionObserver | undefined;
let isInViewport = true;
let previousFrame = 0;
let context: CanvasRenderingContext2D | null = null;
let pixelRatio = 1;
let canvasWidth = 0;
let canvasHeight = 0;

const frameInterval = 1000 / 30;

const clearCanvas = () => {
  if (!context || !canvas.value) return;
  context.clearRect(0, 0, canvas.value.width, canvas.value.height);
};

const startAnimation = () => {
  if (
    !shouldAnimate.value ||
    !isInViewport ||
    document.hidden ||
    animationFrame
  ) {
    return;
  }

  previousFrame = 0;
  readBounds();
  animationFrame = requestAnimationFrame(draw);
  window.addEventListener("resize", readBounds);
  window.addEventListener("scroll", readBounds, true);
  document.addEventListener("visibilitychange", updateDocumentVisibility);
};

const stopAnimation = () => {
  if (animationFrame) {
    cancelAnimationFrame(animationFrame);
    animationFrame = 0;
  }

  clearCanvas();
};

const handlePointerEnter = (event: PointerEvent) => {
  if (event.pointerType !== "mouse" && event.pointerType !== "pen") return;
  isHovered.value = true;
  window.addEventListener("resize", readBounds);
  window.addEventListener("scroll", readBounds, true);
  document.addEventListener("visibilitychange", updateDocumentVisibility);
  startAnimation();
};

const handlePointerLeave = () => {
  isHovered.value = false;
  syncAnimation();
};

const syncAnimation = () => {
  if (shouldAnimate.value) {
    window.addEventListener("resize", readBounds);
    window.addEventListener("scroll", readBounds, true);
    document.addEventListener("visibilitychange", updateDocumentVisibility);
    startAnimation();
    return;
  }

  stopAnimation();
  window.removeEventListener("resize", readBounds);
  window.removeEventListener("scroll", readBounds, true);
  document.removeEventListener("visibilitychange", updateDocumentVisibility);
};

const readBounds = () => {
  const { targetElement, containerElement } = props;

  if (props.isImage) {
    const targetBounds = targetElement.getBoundingClientRect();
    const containerBounds = containerElement.getBoundingClientRect();

    rootStyle.value = {
      left: `${targetBounds.left - containerBounds.left + containerElement.scrollLeft}px`,
      top: `${targetBounds.top - containerBounds.top + containerElement.scrollTop}px`,
      width: `${targetBounds.width}px`,
      height: `${targetBounds.height}px`,
      opacity: getComputedStyle(targetElement).opacity,
      zIndex: String((Number.parseInt(getComputedStyle(targetElement).zIndex, 10) || 1) + 1),
    };

    return { width: targetBounds.width, height: targetBounds.height };
  }

  rootStyle.value = {
    inset: "0",
    width: "100%",
    height: "100%",
    opacity: getComputedStyle(targetElement).opacity,
  };

  const bounds = targetElement.getBoundingClientRect();
  return { width: bounds.width, height: bounds.height };
};

const readRadius = (width: number, height: number) => {
  if (props.radius !== undefined) return props.radius;

  const cssRadius = getComputedStyle(props.targetElement).borderTopLeftRadius;
  const value = Number.parseFloat(cssRadius);
  if (!Number.isFinite(value)) return 16;

  const percentage = cssRadius.includes("%")
    ? (value / 100) * Math.min(width, height)
    : value;

  return Math.min(percentage, width / 2, height / 2);
};

const strokeElectricPath = (
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  radius: number,
  offset: number,
) => {
  const inset = 1.5;
  const left = inset;
  const top = inset;
  const right = Math.max(left, width - inset);
  const bottom = Math.max(top, height - inset);
  const r = Math.min(radius, (right - left) / 2, (bottom - top) / 2);
  const sides: Array<[number, number, number, number]> = [
    [left + r, top, right - r, top],
    [right, top + r, right, bottom - r],
    [right - r, bottom, left + r, bottom],
    [left, bottom - r, left, top + r],
  ];
  const perturbation = 12 * props.chaos;
  ctx.beginPath();
  ctx.moveTo(left + r, top);

  sides.forEach(([x1, y1, x2, y2], sideIndex) => {
    const length = Math.hypot(x2 - x1, y2 - y1);
    const steps = Math.max(2, Math.ceil(length / 12));

    for (let step = 1; step <= steps; step += 1) {
      const progress = step / steps;
      const wave =
        Math.sin(progress * Math.PI * 8 + offset + sideIndex * 1.7) *
        perturbation *
        0.45;
      const jitter = (Math.random() - 0.5) * perturbation;
      const normalX = y2 === y1 ? 0 : 1;
      const normalY = x2 === x1 ? 0 : 1;

      ctx.lineTo(
        x1 + (x2 - x1) * progress + normalX * (wave + jitter),
        y1 + (y2 - y1) * progress + normalY * (wave + jitter),
      );
    }

    const corners: Array<[number, number, number, number]> = [
      [right, top, right, top + r],
      [right, bottom, right - r, bottom],
      [left, bottom, left, bottom - r],
      [left, top, left + r, top],
    ];
    const [controlX, controlY, endX, endY] = corners[sideIndex];
    ctx.quadraticCurveTo(controlX, controlY, endX, endY);
  });

  ctx.closePath();
  ctx.stroke();
};

const draw = (time: number) => {
  if (!shouldAnimate.value || !isInViewport || document.hidden) {
    animationFrame = 0;
    return;
  }

  animationFrame = requestAnimationFrame(draw);
  if (time - previousFrame < frameInterval) return;

  previousFrame = time;
  const bounds = readBounds();
  if (!context || bounds.width <= 0 || bounds.height <= 0) return;

  const nextRatio = Math.min(window.devicePixelRatio || 1, 2);
  const nextWidth = Math.round(bounds.width * nextRatio);
  const nextHeight = Math.round(bounds.height * nextRatio);

  if (nextWidth !== canvasWidth || nextHeight !== canvasHeight || nextRatio !== pixelRatio) {
    pixelRatio = nextRatio;
    canvasWidth = nextWidth;
    canvasHeight = nextHeight;
    const canvasElement = canvas.value;
    if (!canvasElement) return;
    canvasElement.width = canvasWidth;
    canvasElement.height = canvasHeight;
  }

  context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
  context.clearRect(0, 0, bounds.width, bounds.height);

  const accent =
    props.color ||
    getComputedStyle(props.targetElement).getPropertyValue("--accent-green").trim() ||
    "#28FF85";
  const radius = readRadius(bounds.width, bounds.height);
  const phase = (time / 1000) * props.speed * Math.PI * 2;

  context.save();
  context.globalCompositeOperation = "lighter";
  context.strokeStyle = accent;
  context.lineWidth = 2;
  context.lineJoin = "round";
  context.lineCap = "round";
  context.shadowColor = accent;
  context.shadowBlur = 16;
  context.globalAlpha = 0.72;
  strokeElectricPath(context, bounds.width, bounds.height, radius, phase);
  context.shadowBlur = 5;
  context.lineWidth = 1;
  context.globalAlpha = 1;
  strokeElectricPath(context, bounds.width, bounds.height, radius, phase + 1.2);
  context.restore();
};

const updateVisibility = (entries: IntersectionObserverEntry[]) => {
  isInViewport = entries.some((entry) => entry.isIntersecting);

  if (isInViewport) {
    syncAnimation();
  } else {
    stopAnimation();
  }
};

const updateDocumentVisibility = () => {
  if (document.hidden) {
    stopAnimation();
  } else if (shouldAnimate.value && isInViewport) {
    syncAnimation();
  }
};

onMounted(() => {
  const canvasElement = canvas.value;
  if (!canvasElement) return;

  context = canvasElement.getContext("2d");
  if (!context) {
    console.error("ElectricBorder could not create a 2D canvas context.");
    return;
  }

  if (getComputedStyle(props.containerElement).position === "static") {
    props.containerElement.style.position = "relative";
  }

  props.targetElement.addEventListener("pointerenter", handlePointerEnter);
  props.targetElement.addEventListener("pointerleave", handlePointerLeave);

  resizeObserver = new ResizeObserver(() => {
    previousFrame = 0;
  });
  resizeObserver.observe(props.targetElement);
  resizeObserver.observe(props.containerElement);

  if ("IntersectionObserver" in window) {
    intersectionObserver = new IntersectionObserver(updateVisibility);
    intersectionObserver.observe(props.targetElement);
    isInViewport = false;
  }

  watch(shouldAnimate, syncAnimation, { immediate: true });
});

onBeforeUnmount(() => {
  stopAnimation();
  props.targetElement.removeEventListener("pointerenter", handlePointerEnter);
  props.targetElement.removeEventListener("pointerleave", handlePointerLeave);
  resizeObserver?.disconnect();
  intersectionObserver?.disconnect();
});
</script>

<template>
  <Teleport :to="containerElement">
    <div
      aria-hidden="true"
      class="pointer-events-none absolute z-10"
      v-show="shouldAnimate"
      :style="rootStyle"
    >
      <canvas ref="canvas" class="h-full w-full" />
    </div>
  </Teleport>
</template>
