<template>
    <div class="outer">
        <div class="editor">
            <ResizableContainer :min-size="Vector.create(0)" :max-size="Vector.create(100)"
                v-model:width="ratioSize.width" v-model:height="ratioSize.height" class="inner">
                <div class="arrow horizontal"></div>
                <div class="arrow vertical"></div>
            </ResizableContainer>
        </div>
        <div class="values" v-if="values">
            <span class="text">
                {{ min.x.toFixed(0) }}~{{ max.x.toFixed(0) }}
                ×
                <InputBoxButFitWidth :sweeper="Number.isNaN" :caster="Number" v-model="ratioSize.width" />%
                =
                {{ castedSize.width }}
            </span>
            <span class="text">
                {{ min.y.toFixed(0) }}~{{ max.y.toFixed(0) }}
                ×
                <InputBoxButFitWidth :sweeper="Number.isNaN" :caster="Number" v-model="ratioSize.height" />%
                =
                {{ castedSize.height }}
            </span>
        </div>
    </div>
</template>
<script setup lang="ts">
import { Vector } from '@/structs';
import { computed, ref, watch } from 'vue';
import ResizableContainer from './ResizableContainer.vue';
import InputBoxButFitWidth from './InputBoxButFitWidth.vue';
const { min, value, max } = defineProps({
    min: {
        type: Vector,
        default: () => new Vector(400, 300)
    },
    value: {
        type: Vector,
        default: () => Vector.create(10 ** 2)
    },
    max: {
        type: Vector,
        default: () => Vector.create(10 ** 3)
    },
    values: Boolean
});
const emit = defineEmits(["update:value"]);
const ratioSize = ref(uncast(value));
const castedSize = computed(() => cast(ratioSize.value));
watch(() => ratioSize.value.x, (value, old) => {
    if (value === old) return;
    emit("update:value", castedSize.value);
});
watch(() => ratioSize.value.y, (value, old) => {
    if (value === old) return;
    emit("update:value", castedSize.value);
});
watch(() => value, (value) => {
    if (Vector.equals(value, castedSize.value)) return;
    ratioSize.value = uncast(value);
});
function cast(ratioSize: Vector) {
    return Vector.add(Vector.multiply(Vector.divide(ratioSize, Vector.create(100)), Vector.subtract(max, min)), min);
}
function uncast(castedSize: Vector) {
    return Vector.multiply(Vector.divide(castedSize, max), Vector.create(100));
}
</script>
<style scoped>
.arrow {
    --arrow-size: 8px;
    --line-width: 2px;
    position: absolute;
    background-color: black;
}

.arrow::before,
.arrow::after {
    content: "";
    position: absolute;
    width: var(--arrow-size);
    height: var(--arrow-size);
    clip-path: polygon(0 100%, 100% 100%, 50% 0);
    background-color: black;
}

.outer {
    display: inline-flex;
    align-items: center;
    gap: 10px;
}

.editor {
    background-color: rgba(0, 0, 0, 0.05);
    border: 2px solid gray;
    box-sizing: content-box;
    padding: 2px;
    width: 100px;
    height: 100px;
}

.inner {
    border: 1px solid black;
}

.values {
    display: flex;
    flex-direction: column;
    gap: 3px;
}

.horizontal {
    width: 100%;
    height: var(--line-width);
    top: 50%;
    left: 0;
    transform: translateY(-50%);
}

.horizontal::before {
    top: 50%;
    left: 0;
    transform: translate(-50%, -50%) rotate(-90deg);
}

.horizontal::after {
    top: 50%;
    right: 0;
    transform: translate(50%, -50%) rotate(90deg);
}

.vertical {
    width: var(--line-width);
    height: 100%;
    top: 0;
    left: 50%;
    transform: translateX(-50%);
}

.vertical::before {
    top: 0;
    left: 50%;
    transform: translate(-50%, -50%) rotate(0deg);
}

.vertical::after {
    bottom: 0;
    left: 50%;
    transform: translate(-50%, 50%) rotate(180deg);
}

.text {
    display: flex;
    align-items: center;
    gap: 5px;
}
</style>