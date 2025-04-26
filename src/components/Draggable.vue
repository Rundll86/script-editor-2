<template>
    <div class="draggable" :style="{
        left: x + 'px',
        top: y + 'px',
        '--region': regionStyle,
    }" @mousedown="startDrag">
        <slot></slot>
    </div>
</template>
<script setup lang="ts">
import { ref, watch } from 'vue';
interface TargetAndVector {
    target: EventTarget | null;
    clientX: number;
    clientY: number;
    preventDefault: () => void;
    stopPropagation: () => void;
};
const props = defineProps({
    x: {
        type: Number,
        default: 0
    },
    y: {
        type: Number,
        default: 0
    },
    dragging: {
        type: Boolean,
        default: false
    },
    regionStyle: {
        type: String,
        default: "move"
    }
});
const emit = defineEmits(["update:x", "update:y", "update:dragging", "dragstart", "drag", "dragend"]);
const x = ref(0);
const y = ref(0);
const dragging = ref(false);
let mouseOffset: [number, number] = [0, 0];
let mouse: [number, number] = [0, 0];
window.addEventListener("mousemove", e => {
    mouse[0] = e.clientX;
    mouse[1] = e.clientY;
});
window.addEventListener("mousemove", updateDrag);
window.addEventListener("mouseup", endDrag);
function isElementInRegion(element: Element | EventTarget | null) {
    return (
        element &&
        element instanceof HTMLElement &&
        element.dataset.region === "true"
    );
};
function startDrag(e: TargetAndVector) {
    if (!isElementInRegion(e.target)) return;
    e.preventDefault();
    e.stopPropagation();
    dragging.value = true;
    mouseOffset[0] = e.clientX - x.value;
    mouseOffset[1] = e.clientY - y.value;
    emit("dragstart", mouseOffset);
};
function updateDrag(e: TargetAndVector) {
    if (!dragging.value) return;
    x.value = e.clientX - mouseOffset[0];
    y.value = e.clientY - mouseOffset[1];
    emit("drag", [x, y]);
};
function endDrag() {
    if (!dragging.value) return;
    dragging.value = false;
    emit("dragend");
};
watch([() => props.x, () => props.y], ([newX, newY]) => {
    if (newX !== x.value) x.value = newX;
    if (newY !== y.value) y.value = newY;
});
watch([x, y], ([newX, newY]) => {
    if (newX !== props.x) emit("update:x", newX);
    if (newY !== props.y) emit("update:y", newY);
});
watch(dragging, (newDragging) => {
    emit("update:dragging", newDragging);
});
</script>
<style scoped>
.draggable {
    --region: move;
    position: absolute;
    transition: none;
}

.draggable:deep([data-region=true]) {
    user-select: none;
    cursor: var(--region);
}
</style>