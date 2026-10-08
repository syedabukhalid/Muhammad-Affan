<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from "vue";
import ElectricBorder from "./ElectricBorder.vue";

interface BorderTarget {
  element: HTMLElement;
  host: HTMLElement;
  isImage: boolean;
  id: number;
  alwaysOn: boolean;
  modal: HTMLElement | null;
  modalActive: boolean;
}

const targets = ref<BorderTarget[]>([]);

const cardSelector = [
  ".skill-card",
  ".cert-card",
  ".cert-overview-card",
  ".skill-modal-content",
  ".edu-card",
  ".exp-card",
  ".project-card",
  ".modal-container",
  ".home-overview-image-card",
  ".home-overview-logo-card",
].join(", ");

const imageSelector = [
  ".snapshot-img",
  "img.testimonial-img",
  "#imgFull",
  "#modalCertImg",
].join(", ");
const modalSelector = "#skillModal, #imageModal, #certModal, #projectModal";

const getCanvasHost = (target: HTMLElement): HTMLElement | null => {
  if (!(target instanceof HTMLImageElement)) return target;

  return (
    target.closest<HTMLElement>(
      ".snapshot-carousel, .testimonial-carousel, .cert-modal-content, #imageModal, #certModal",
    ) ?? target.parentElement
  );
};

const isModalOpen = (modal: HTMLElement) =>
  modal.getAttribute("aria-hidden") !== "true" &&
  getComputedStyle(modal).display !== "none";

let modalObserver: MutationObserver | undefined;

onMounted(() => {
  const seen = new Set<HTMLElement>();
  const borderTargets: BorderTarget[] = [];
  const modals = Array.from(
    document.querySelectorAll<HTMLElement>(modalSelector),
  );

  document
    .querySelectorAll<HTMLElement>(`${cardSelector}, ${imageSelector}`)
    .forEach((element, id) => {
      if (seen.has(element)) return;

      const host = getCanvasHost(element);
      if (!host) return;

      seen.add(element);
      borderTargets.push({
        element,
        host,
        isImage: element instanceof HTMLImageElement,
        id,
        alwaysOn:
          element.matches(".snapshot-img.active") &&
          host.matches(".snapshot-carousel, .testimonial-carousel"),
        modal: element.closest<HTMLElement>(modalSelector),
        modalActive: false,
      });
    });

  targets.value = borderTargets;

  const updateModalStates = () => {
    for (const target of targets.value) {
      target.modalActive = target.modal ? isModalOpen(target.modal) : false;
      target.alwaysOn =
        target.element.matches(".snapshot-img.active") &&
        target.host.matches(".snapshot-carousel, .testimonial-carousel");
    }

  };

  modalObserver = new MutationObserver(updateModalStates);
  for (const modal of modals) {
    modalObserver.observe(modal, {
      attributes: true,
      attributeFilter: ["aria-hidden", "class", "style"],
    });
  }
  for (const target of targets.value) {
    if (target.element.matches(".snapshot-img")) {
      modalObserver.observe(target.element, {
        attributes: true,
        attributeFilter: ["class"],
      });
    }
  }

  updateModalStates();
});

onBeforeUnmount(() => {
  modalObserver?.disconnect();
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
      :active="target.modalActive"
      :force-active="target.alwaysOn"
      :speed="1"
      :chaos="0.12"
    />
  </div>
</template>
