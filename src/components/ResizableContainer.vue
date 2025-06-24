<template>
    <div class="resizable" :class="{ isResizing }" :style="{
        width: enable ? width + 'px' : 'auto',
        height: enable ? height + 'px' : 'auto',
    }">
        <slot></slot>
        <div v-if="enable" class="resize-handle" @mousedown.stop="startResize"></div>
    </div>
</template>
<script setup lang="ts">
interface TargetAndVector {
    target: EventTarget | null;
    clientX: number;
    clientY: number;
    movementX: number;
    movementY: number;
    preventDefault: () => void;
}
import { limited } from "@/tools";
import { ref, watch, type PropType } from "vue";
const props = defineProps({
    width: {
        type: Number,
        default: 100
    },
    height: {
        type: Number,
        default: 100
    },
    resizing: {
        type: Boolean,
        default: false
    },
    maxSize: {
        type: Object as PropType<{ width: number, height: number }>,
        default: () => ({ width: Infinity, height: Infinity })
    },
    minSize: {
        type: Object as PropType<{ width: number, height: number }>,
        default: () => ({ width: -Infinity, height: -Infinity })
    },
    enable: {
        type: Boolean,
        default: true
    }
});
const emit = defineEmits(["update:width", "update:height", "update:resizing", "resizestart", "resize", "resizeend"]);
const width = ref(props.width);
const height = ref(props.height);
const isResizing = ref(false);
const mouseOffset: [number, number] = [0, 0];
const mouse: [number, number] = [0, 0];
window.addEventListener("mousemove", e => {
    mouse[0] = e.clientX;
    mouse[1] = e.clientY;
});
window.addEventListener("mousemove", updateResize);
window.addEventListener("mouseup", endResize);
function startResize(e: TargetAndVector) {
    e.preventDefault();
    isResizing.value = true;
    mouseOffset[0] = e.clientX - width.value;
    mouseOffset[1] = e.clientY - height.value;
    emit("resizestart", mouseOffset);
};
function updateResize(e: TargetAndVector) {
    if (!isResizing.value) return;
    let newWidth = width.value + e.movementX;
    let newHeight = height.value + e.movementY;
    newWidth = limited(props.minSize.width, newWidth, props.maxSize.width);
    newHeight = limited(props.minSize.height, newHeight, props.maxSize.height);
    width.value = newWidth;
    height.value = newHeight;
    emit("resize", [newWidth, newHeight]);
};
function endResize() {
    if (!isResizing.value) return;
    isResizing.value = false;
    emit("resizeend");
};
watch([() => props.width, () => props.height], ([newWidth, newHeight]) => {
    if (newWidth !== width.value) width.value = newWidth;
    if (newHeight !== height.value) height.value = newHeight;
});
watch([width, height], ([newWidth, newHeight]) => {
    if (newWidth !== props.width) emit("update:width", newWidth);
    if (newHeight !== props.height) emit("update:height", newHeight);
});
watch(isResizing, (newResizing) => {
    emit("update:resizing", newResizing);
});
</script>
<style scoped>
.resizable {
    position: relative;
    display: inline-block;
    transition: none;
}

@property --size {
    initial-value: 0px;
    syntax: "<length>";
    inherits: false;
}

@property --angle {
    initial-value: 0deg;
    syntax: "<angle>";
    inherits: false;
}

.resize-handle {
    --size: 20px;
    --angle: 135deg;
    opacity: 0;
    position: absolute;
    width: var(--size);
    height: var(--size);
    bottom: 0;
    right: 0;
    cursor: se-resize;
    transform: translate(50%, 50%) rotate(var(--angle));
    background-color: white;
    border: 1px solid black;
}

.resize-handle:hover,
.resizable.isResizing .resize-handle {
    --size: 10px;
    --angle: 45deg;
    opacity: 1;
}

.resize-handle::before {
    content: "";
    position: absolute;
    width: 50%;
    height: 50%;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    background-color: black;
}
</style>