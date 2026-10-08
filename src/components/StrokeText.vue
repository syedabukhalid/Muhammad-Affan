<script setup lang="ts">
import { gsap } from "gsap";
import { nextTick, onBeforeUnmount, onMounted, ref } from "vue";

type Props = {
  text: string;
  trigger?: "mount" | "scroll";
  strokeColor?: string;
  fillColor?: string;
  fillMode?: "fade" | "none";
  ease?: string;
  strokeWidth?: number;
  drawDuration?: number;
  fillDelay?: number;
  stagger?: number;
  fontWeight?: number;
  letterSpacing?: number;
};

const props = withDefaults(defineProps<Props>(), {
  trigger: "scroll",
  strokeColor: "#00ff87",
  fillColor: "#f4f4f9",
  fillMode: "fade",
  ease: "power2.out",
  strokeWidth: 1.4,
  drawDuration: 1.6,
  fillDelay: 0.2,
  stagger: 0.05,
  fontWeight: 700,
  letterSpacing: +0.5,
});

const host = ref<HTMLElement | null>(null);
const lines = ref<string[]>([]);
const svgWidth = ref(1);
const fontSize = ref(16);
const lineHeight = ref(20);
const textAnchor = ref<"start" | "middle" | "end">("start");
const textX = ref(0);

let resizeObserver: ResizeObserver | undefined;
let intersectionObserver: IntersectionObserver | undefined;
let timeline: gsap.core.Timeline | undefined;
let animationStarted = false;
let hasPlayed = false;

function wrapText(text: string, context: CanvasRenderingContext2D, width: number) {
  const words = text.split(/\s+/);
  const wrapped: string[] = [];
  let line = "";

  for (const word of words) {
    const candidate = line ? `${line} ${word}` : word;
    const measuredWidth =
      context.measureText(candidate).width +
      Math.max(candidate.length - 1, 0) * props.letterSpacing;

    if (line && measuredWidth > width) {
      wrapped.push(line);
      line = word;
    } else {
      line = candidate;
    }
  }

  if (line) wrapped.push(line);
  return wrapped;
}

async function updateLayout() {
  const heading = host.value?.parentElement;
  if (!heading) return;

  const width = Math.max(heading.clientWidth, 1);
  const style = getComputedStyle(heading);
  const resolvedFontSize = Number.parseFloat(style.fontSize) || 16;
  const resolvedLineHeight =
    style.lineHeight === "normal"
      ? resolvedFontSize * 1.2
      : Number.parseFloat(style.lineHeight) || resolvedFontSize * 1.2;
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");
  if (!context) {
    throw new Error("Unable to measure StrokeText heading layout.");
  }

  context.font = `${props.fontWeight} ${resolvedFontSize}px ${style.fontFamily}`;
  svgWidth.value = width;
  fontSize.value = resolvedFontSize;
  lineHeight.value = resolvedLineHeight;
  textAnchor.value =
    style.textAlign === "center" ? "middle" : style.textAlign === "right" ? "end" : "start";
  textX.value =
    textAnchor.value === "middle"
      ? width / 2
      : textAnchor.value === "end"
        ? width
        : 0;
  lines.value = wrapText(props.text, context, width);

  await nextTick();
  if (hasPlayed) {
    setFinalState();
  } else if (animationStarted) {
    timeline?.kill();
    animationStarted = false;
    setDrawState();
    playAnimation();
  } else {
    setDrawState();
  }
}

function getTextElements() {
  return host.value?.querySelectorAll<SVGTextElement>(".stroke-text__line") ?? [];
}

function hasStroke() {
  return props.strokeColor !== "none" && props.strokeColor !== "transparent" && props.strokeWidth > 0;
}

function hasFill() {
  return props.fillColor !== "none" && props.fillColor !== "transparent";
}

function setDrawState() {
  const elements = getTextElements();
  gsap.set(elements, {
    strokeDasharray: (_, element: SVGTextElement) => {
      const length = element.getComputedTextLength();
      return `${length} ${length}`;
    },
    strokeDashoffset: (_, element: SVGTextElement) =>
      hasStroke() ? element.getComputedTextLength() : 0,
    fillOpacity: props.fillMode === "fade" ? 0 : 1,
  });
}

function setFinalState() {
  const elements = getTextElements();
  gsap.set(elements, { strokeDashoffset: 0, fillOpacity: 1 });
}

function playAnimation() {
  if (animationStarted || !lines.value.length) return;
  animationStarted = true;

  const elements = getTextElements();
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduceMotion) {
    setFinalState();
    hasPlayed = true;
    return;
  }

  setDrawState();
  const drawsStroke = hasStroke();
  const drawsFill = hasFill();

  timeline = gsap.timeline({
    onComplete: () => {
      hasPlayed = true;
    },
  });

  if (drawsStroke) {
    timeline.to(
      elements,
      {
        strokeDashoffset: 0,
        duration: props.drawDuration,
        ease: props.ease,
        stagger: props.stagger,
      },
    );
  }

  if (drawsFill && props.fillMode === "fade") {
    timeline.to(
      elements,
      {
        fillOpacity: 1,
        duration: drawsStroke ? 0.45 : props.drawDuration,
        ease: props.ease,
        stagger: props.stagger,
      },
      `+=${props.fillDelay}`,
    );
  }

  if (!drawsStroke && (!drawsFill || props.fillMode !== "fade")) {
    setFinalState();
    hasPlayed = true;
    timeline.kill();
  }
}

onMounted(async () => {
  await updateLayout();
  const heading = host.value?.parentElement;
  if (!heading) return;
  heading.dataset.strokeReady = "true";

  resizeObserver = new ResizeObserver(() => {
    void updateLayout();
  });
  resizeObserver.observe(heading);

  if (props.trigger === "mount") {
    playAnimation();
    return;
  }

  intersectionObserver = new IntersectionObserver(
    (entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        intersectionObserver?.disconnect();
        playAnimation();
      }
    },
    { threshold: 0.15, rootMargin: "0px 0px -10% 0px" },
  );
  intersectionObserver.observe(heading);
});

onBeforeUnmount(() => {
  resizeObserver?.disconnect();
  intersectionObserver?.disconnect();
  timeline?.kill();
});
</script>

<template>
  <span ref="host" class="stroke-text" aria-hidden="true">
    <svg
      class="stroke-text__svg"
      :viewBox="`0 0 ${svgWidth} ${lineHeight * lines.length}`"
      preserveAspectRatio="none"
      role="presentation"
    >
      <text
        v-for="(line, index) in lines"
        :key="`${index}-${line}`"
        class="stroke-text__line"
        :x="textX"
        :y="index * lineHeight"
        :text-anchor="textAnchor"
        dominant-baseline="hanging"
        :fill="fillColor"
        :stroke="strokeColor"
        :stroke-width="strokeColor === 'none' || strokeColor === 'transparent' ? 0 : strokeWidth"
        stroke-linejoin="round"
        :style="{
          fontSize: `${fontSize}px`,
          fontWeight,
          letterSpacing: `${letterSpacing}px`,
        }"
      >
        {{ line }}
      </text>
    </svg>
  </span>
  <span class="stroke-text__sr-only">{{ text }}</span>
</template>

<style scoped>
.stroke-text {
  display: block;
  width: 100%;
}

.stroke-text__svg {
  display: block;
  width: 100%;
  overflow: visible;
}

.stroke-text__line {
  font-family: inherit;
}

.stroke-text__sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
</style>
