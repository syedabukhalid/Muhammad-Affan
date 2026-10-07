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
const selectedTargetIds = ref(new Set<number>());
const targetByElement = new Map<HTMLElement, BorderTarget>();
let snapshotObserver: MutationObserver | undefined;
let modalObserver: MutationObserver | undefined;
let lastClickedTargetId: number | null = null;

interface ModalSelection {
  sourceIds: Set<number>;
  previewIds: Set<number>;
}

const modalSelections = new Map<HTMLElement, ModalSelection>();

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

const updateSelectedTargets = (ids: Iterable<number>, selected: boolean) => {
  const next = new Set(selectedTargetIds.value);
  for (const id of ids) {
    if (selected) next.add(id);
    else next.delete(id);
  }
  selectedTargetIds.value = next;
};

const isModalOpen = (modal: HTMLElement) =>
  getComputedStyle(modal).display !== "none" &&
  modal.getAttribute("aria-hidden") !== "true";

const syncModalSelections = (modals: HTMLElement[]) => {
  modals.forEach((modal) => {
    const previous = modalSelections.get(modal);

    if (!isModalOpen(modal)) {
      if (previous) {
        updateSelectedTargets(
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
      updateSelectedTargets([lastClickedTargetId], true);
    }

    const nextPreviewIds = new Set<number>();
    modal.querySelectorAll("img").forEach((image) => {
      if (!image.getAttribute("src")) return;
      const target = targetByElement.get(image);
      if (target) nextPreviewIds.add(target.id);
    });

    selection.previewIds.forEach((id) => {
      if (!nextPreviewIds.has(id) && !selection.sourceIds.has(id)) {
        updateSelectedTargets([id], false);
      }
    });
    nextPreviewIds.forEach((id) => {
      if (!selection.previewIds.has(id)) updateSelectedTargets([id], true);
    });
    selection.previewIds = nextPreviewIds;
    modalSelections.set(modal, selection);
  });

  lastClickedTargetId = null;
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

  const modals = Array.from(
    document.querySelectorAll<HTMLElement>(
      ".modal, .modal-overlay, .cert-modal, .skill-modal",
    ),
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

  document.addEventListener("click", selectTarget, true);
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
      const isSelected = selectedTargetIds.value.has(target.id);
      updateSelectedTargets([target.id], !isSelected);
      lastClickedTargetId = target.id;
      queueMicrotask(() => {
        const modals = Array.from(
          document.querySelectorAll<HTMLElement>(
            ".modal, .modal-overlay, .cert-modal, .skill-modal",
          ),
        );
        syncModalSelections(modals);
      });
      return;
    }

    element = element.parentElement;
  }
};

onBeforeUnmount(() => {
  document.removeEventListener("click", selectTarget, true);
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
      :active="selectedTargetIds.has(target.id)"
      :force-active="target.forceActive"
      :speed="1"
      :chaos="0.12"
    />
  </div>
</template>
