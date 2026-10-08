<script setup lang="ts">
import { onBeforeUnmount, onMounted, reactive, ref } from "vue";
import ElectricBorder from "./ElectricBorder.vue";

interface BorderTarget {
  element: HTMLElement;
  host: HTMLElement;
  isImage: boolean;
  id: number;
  forceActive: boolean;
}

interface ModalSelection {
  sourceIds: Set<number>;
  previewIds: Set<number>;
}

const targets = ref<BorderTarget[]>([]);
const activeTargetIds = ref(new Set<number>());
const targetByElement = new Map<HTMLElement, BorderTarget>();
const modalSelections = new Map<HTMLElement, ModalSelection>();
let snapshotObserver: MutationObserver | undefined;
let modalObserver: MutationObserver | undefined;
let lastClickedTargetId: number | null = null;

const cardSelector = [
  ".skill-card",
  ".cert-card",
  ".cert-overview-card",
  ".skill-modal-content",
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

const modalSelector = ".modal, .modal-overlay, .cert-modal, .skill-modal";

const getCanvasHost = (target: HTMLElement): HTMLElement | null => {
  if (!(target instanceof HTMLImageElement)) return target;

  return (
    target.closest<HTMLElement>(
      ".snapshot-carousel, .testimonial-carousel, .cert-modal-content, #imageModal, #certModal",
    ) ?? target.parentElement
  );
};

const setTargetsActive = (ids: Iterable<number>, active: boolean) => {
  const next = new Set(activeTargetIds.value);
  for (const id of ids) {
    if (active) next.add(id);
    else next.delete(id);
  }
  activeTargetIds.value = next;
};

const isModalOpen = (modal: HTMLElement) =>
  getComputedStyle(modal).display !== "none" &&
  modal.getAttribute("aria-hidden") !== "true";

const syncModalSelections = (modals: HTMLElement[]) => {
  modals.forEach((modal) => {
    const previous = modalSelections.get(modal);

    if (!isModalOpen(modal)) {
      if (previous) {
        setTargetsActive(
          [...previous.sourceIds, ...previous.previewIds],
          false,
        );
        modalSelections.delete(modal);
      }
      return;
    }

    const selection = previous ?? {
      sourceIds: new Set<number>(),
      previewIds: new Set<number>(),
    };

    if (!previous && lastClickedTargetId !== null) {
      selection.sourceIds.add(lastClickedTargetId);
    }

    const nextPreviewIds = new Set<number>();
    modal
      .querySelectorAll<HTMLElement>(".skill-modal-content")
      .forEach((content) => {
        const target = targetByElement.get(content);
        if (target) nextPreviewIds.add(target.id);
      });

    modal.querySelectorAll<HTMLImageElement>("img").forEach((image) => {
      if (!image.getAttribute("src")) return;
      const target = targetByElement.get(image);
      if (target) nextPreviewIds.add(target.id);
    });

    selection.previewIds.forEach((id) => {
      if (!nextPreviewIds.has(id) && !selection.sourceIds.has(id)) {
        setTargetsActive([id], false);
      }
    });

    const idsToActivate = new Set([
      ...selection.sourceIds,
      ...nextPreviewIds,
    ]);
    setTargetsActive(idsToActivate, true);
    selection.previewIds = nextPreviewIds;
    modalSelections.set(modal, selection);
  });

  lastClickedTargetId = null;
};

const getTargetForClick = (event: MouseEvent): BorderTarget | undefined => {
  const eventTarget = event.target;
  if (!(eventTarget instanceof Element)) return undefined;

  let element: Element | null = eventTarget;
  while (element) {
    if (element instanceof HTMLElement) {
      const target = targetByElement.get(element);
      if (target) return target;
    }
    element = element.parentElement;
  }
  return undefined;
};

const handleTargetClick = (event: MouseEvent) => {
  const target = getTargetForClick(event);
  if (!target) return;
  if (target.element.matches(".skill-modal-content")) return;

  const isActive = activeTargetIds.value.has(target.id);
  setTargetsActive([target.id], !isActive);
  lastClickedTargetId = target.id;
  window.setTimeout(() => {
    if (lastClickedTargetId === target.id) lastClickedTargetId = null;
  }, 0);

  const modal = target.element.closest<HTMLElement>(modalSelector);
  if (modal && isModalOpen(modal)) {
    const selection = modalSelections.get(modal);
    if (selection) selection.sourceIds.add(target.id);
  }
};

onMounted(() => {
  const seen = new Set<HTMLElement>();
  const borderTargets: BorderTarget[] = [];

  document
    .querySelectorAll<HTMLElement>(`${cardSelector}, ${imageSelector}`)
    .forEach((element, id) => {
      if (seen.has(element)) return;

      const host = getCanvasHost(element);
      if (!host) return;

      seen.add(element);
      const target = reactive<BorderTarget>({
        element,
        host,
        isImage: element instanceof HTMLImageElement,
        id,
        forceActive: element.matches(".snapshot-img.active"),
      });

      borderTargets.push(target);
      targetByElement.set(element, target);
    });

  targets.value = borderTargets;

  if ("MutationObserver" in window) {
    snapshotObserver = new MutationObserver((records) => {
      records.forEach(({ target }) => {
        if (!(target instanceof HTMLElement)) return;

        const borderTarget = targetByElement.get(target);
        if (borderTarget) {
          borderTarget.forceActive = target.classList.contains("active");
        }
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

  const modals = Array.from(
    document.querySelectorAll<HTMLElement>(modalSelector),
  );
  if ("MutationObserver" in window && modals.length > 0) {
    modalObserver = new MutationObserver(() => syncModalSelections(modals));
    modals.forEach((modal) => {
      modalObserver?.observe(modal, {
        attributes: true,
        attributeFilter: ["style", "aria-hidden"],
      });
      modal.querySelectorAll("img").forEach((image) => {
        modalObserver?.observe(image, {
          attributes: true,
          attributeFilter: ["src"],
        });
      });
    });
  }

  document.addEventListener("click", handleTargetClick, true);
});

onBeforeUnmount(() => {
  document.removeEventListener("click", handleTargetClick, true);
  snapshotObserver?.disconnect();
  modalObserver?.disconnect();
  modalSelections.clear();
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
      :active="activeTargetIds.has(target.id)"
      :force-active="target.forceActive"
      :speed="1"
      :chaos="0.12"
    />
  </div>
</template>
