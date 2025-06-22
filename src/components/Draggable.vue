<template>
    <div class="draggable" :class="{ isDragging }" :style="{
        left: x + 'px',
        top: y + 'px',
        '--region': regionStyle,
        '--region-drag': regionDragStyle
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
    },
    regionDragStyle: {
        type: String,
        default: "move"
    }
});
const emit = defineEmits(["update:x", "update:y", "update:dragging", "dragstart", "drag", "dragend"]);
const x = ref(props.x);
const y = ref(props.y);
const isDragging = ref(false);
const mouseOffset: [number, number] = [0, 0];
const mouse: [number, number] = [0, 0];
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
    isDragging.value = true;
    mouseOffset[0] = e.clientX - x.value;
    mouseOffset[1] = e.clientY - y.value;
    emit("dragstart", mouseOffset);
};
function updateDrag(e: TargetAndVector) {
    if (!isDragging.value) return;
    const targetX = e.clientX - mouseOffset[0];
    const targetY = e.clientY - mouseOffset[1];
    const diffX = targetX - x.value;
    const diffY = targetY - y.value;
    x.value = targetX;
    y.value = targetY;
    emit("drag", [diffX, diffY]);
};
function endDrag() {
    if (!isDragging.value) return;
    isDragging.value = false;
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
watch(isDragging, (newDragging) => {
    if (newDragging !== props.dragging) emit("update:dragging", newDragging);
});
</script>
<style scoped>
.draggable {
    --region: move;
    --region-drag: move;
    position: absolute;
    transition: none;
}

.draggable:deep([data-region=true]) {
    user-select: none;
    cursor: var(--region);
}

.draggable.isDragging:deep([data-region=true]) {
    cursor: var(--region-drag);
}
</style>