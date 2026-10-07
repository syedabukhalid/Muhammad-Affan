<script setup lang="ts">
import { onMounted, ref } from "vue";
import ElectricBorder from "./ElectricBorder.vue";

interface BorderTarget {
  element: HTMLElement;
  host: HTMLElement;
  isImage: boolean;
  id: number;
}

const targets = ref<BorderTarget[]>([]);

const cardSelector = [
  ".skill-card",
  ".cert-card",
  ".cert-overview-card",
  ".edu-card",
  ".exp-card",
  ".project-card",
  ".home-overview-image-card",
  ".home-overview-logo-card",
].join(", ");

const imageSelector = [
  ".snapshot-img",
  "img.testimonial-img",
  "#imgFull",
  "#modalCertImg",
].join(", ");

const isTargetElement = (element: Element): element is HTMLElement =>
  element instanceof HTMLElement;

const getCanvasHost = (target: HTMLElement): HTMLElement | null => {
  if (!(target instanceof HTMLImageElement)) return target;

  return (
    target.closest<HTMLElement>(
      ".snapshot-carousel, .testimonial-carousel, .cert-modal-content, #imageModal, #certModal",
    ) ?? target.parentElement
  );
};

onMounted(() => {
  const matches = document.querySelectorAll(`${cardSelector}, ${imageSelector}`);
  const seen = new Set<HTMLElement>();
  const borderTargets: BorderTarget[] = [];

  matches.forEach((element, id) => {
    if (!isTargetElement(element) || seen.has(element)) return;

    const host = getCanvasHost(element);
    if (!host || !isTargetElement(host)) return;

    seen.add(element);
    borderTargets.push({
      element,
      host,
      isImage: element instanceof HTMLImageElement,
      id,
    });
  });

  targets.value = borderTargets;
});
</script>

<template>
  <div aria-hidden="true">
    <ElectricBorder
      v-for="target in targets"
      :key="target.id"
      :target-element="target.element"
      :container-element="target.host"
      :is-image="target.isImage"
      :speed="1"
      :chaos="0.12"
    />
  </div>
</template>
