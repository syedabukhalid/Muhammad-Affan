<script setup lang="ts">
import { onBeforeUnmount, onMounted, reactive, ref } from "vue";
import ElectricBorder from "./ElectricBorder.vue";

interface BorderTarget {
  element: HTMLElement;
  host: HTMLElement;
  isImage: boolean;
  forceActive: boolean;
  id: number;
}

const targets = ref<BorderTarget[]>([]);
const selectedTargetId = ref<number | null>(null);
const targetByElement = new Map<HTMLElement, BorderTarget>();
let snapshotObserver: MutationObserver | undefined;

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

const isMainSnapshotPage = () =>
  /(?:^|\/)(?:Experience|Projects)\.html$/i.test(window.location.pathname);

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
  const hasAlwaysActiveSnapshots = isMainSnapshotPage();

  matches.forEach((element, id) => {
    if (!isTargetElement(element) || seen.has(element)) return;

    const host = getCanvasHost(element);
    if (!host || !isTargetElement(host)) return;

    seen.add(element);
    const borderTarget = reactive<BorderTarget>({
      element,
      host,
      isImage: element instanceof HTMLImageElement,
      forceActive:
        hasAlwaysActiveSnapshots &&
        element.matches(".snapshot-img.active"),
      id,
    });

    borderTargets.push(borderTarget);
    targetByElement.set(element, borderTarget);
  });

  targets.value = borderTargets;

  if (hasAlwaysActiveSnapshots && "MutationObserver" in window) {
    snapshotObserver = new MutationObserver((records) => {
      records.forEach((record) => {
        const element = record.target;
        if (!isTargetElement(element)) return;

        const target = targetByElement.get(element);
        if (target) target.forceActive = element.classList.contains("active");
      });
    });

    borderTargets.forEach(({ element }) => {
      if (element.matches(".snapshot-img")) {
        snapshotObserver?.observe(element, {
          attributes: true,
          attributeFilter: ["class"],
        });
      }
    });
  }

  document.addEventListener("click", selectTarget);
});

const selectTarget = (event: MouseEvent) => {
  const eventTarget = event.target;
  if (!(eventTarget instanceof Element)) return;

  let element: HTMLElement | null = isTargetElement(eventTarget)
    ? eventTarget
    : eventTarget.parentElement;

  while (element) {
    const target = targetByElement.get(element);
    if (target) {
      selectedTargetId.value =
        selectedTargetId.value === target.id ? null : target.id;
      return;
    }

    element = element.parentElement;
  }
};

onBeforeUnmount(() => {
  document.removeEventListener("click", selectTarget);
  snapshotObserver?.disconnect();
  targetByElement.clear();
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
      :active="selectedTargetId === target.id"
      :force-active="target.forceActive"
      :speed="1"
      :chaos="0.12"
    />
  </div>
</template>
