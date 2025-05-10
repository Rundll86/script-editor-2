<template>
    <div class="container">
        <div class="bar" ref="bar" @mousedown.prevent="startJump">
            <div class="ball" :class="{ isRanging }" :style="{
                '--pos': `${percent * 100}%`
            }" @mousedown.prevent.stop="startRange">
                <div class="value-bar" :class="{ isRanging }">
                    {{ (min * (mode === "percent" ? 100 : 1)).toFixed(fix) + (mode === "percent" ? "%" : "") }}
                    /
                    {{ (currentValue * (mode === "percent" ? 100 : 1)).toFixed(fix) + (mode === "percent" ? "%" : "") }}
                    /
                    {{ (max * (mode === "percent" ? 100 : 1)).toFixed(fix) + (mode === "percent" ? "%" : "") }}
                </div>
                <div class="block external" :style="{
                    '--progress': jumpProgress
                }"></div>
                <div class="block internal" :style="{
                    '--progress': jumpProgress
                }"></div>
            </div>
        </div>
    </div>
</template>
<script setup lang="ts">
import { everyFrame, limited } from '@/tools';
import { computed, ref, watch, type PropType } from 'vue';
const props = defineProps({
    max: {
        type: Number,
        default: 100
    },
    min: {
        type: Number,
        default: 0
    },
    value: {
        type: Number,
        default: 50
    },
    ranging: {
        type: Boolean,
        default: false
    },
    fix: {
        type: Number,
        default: 1
    },
    mode: {
        type: String as PropType<"number" | "percent">,
        default: "number"
    },
    jumpTime: { //在bar上按住某个位置一段时间就把currentValue跳转到这里
        type: Number,
        default: 1000 //毫秒
    }
});
const emit = defineEmits(["update:value", "update:ranging"]);
const bar = ref<HTMLDivElement | null>(null);
const barWidth = computed(() => bar.value?.getBoundingClientRect().width ?? 0);
const barLeft = computed(() => bar.value?.getBoundingClientRect().left ?? 0);
const percent = computed(() => (currentValue.value - props.min) / (props.max - props.min));
const currentValue = ref(props.value);
const isRanging = ref(props.ranging);
const isJumping = ref(false);
const jumpProgress = ref(0);
let offset = 0;
let startJumpTime = 0;
let stoper: null | (() => void) = null;
function startRange(e: MouseEvent) {
    offset = e.clientX - (barWidth.value * percent.value + barLeft.value);
    isRanging.value = true;
}
function updateRange(e: MouseEvent) {
    if (!isRanging.value) return;
    setValue(e);
}
function endRange() {
    isRanging.value = false;
}
function startJump(e: MouseEvent) {
    startJumpTime = Date.now();
    isJumping.value = true;
    everyFrame((stop) => {
        if (!isJumping.value) {
            stop();
            return;
        };
        jumpProgress.value = (Date.now() - startJumpTime) / props.jumpTime;
        if (jumpProgress.value >= 1) {
            offset = 0;
            setValue(e, 0.1);
            endJump();
        };
    });
}
function endJump() {
    isJumping.value = false;
    jumpProgress.value = 0;
}
function setValue(e: MouseEvent, animationRate: number = 0, deviation: number = 0.1) {
    if (stoper) stoper();
    const target = (e.clientX - offset - barLeft.value) / barWidth.value * (props.max - props.min) + props.min;
    if (animationRate > 0) {
        everyFrame((stop) => {
            stoper = stop;
            currentValue.value += (target - currentValue.value) * animationRate;
            if (Math.abs(target - currentValue.value) < deviation) {
                currentValue.value = target;
                stop();
            };
        });
    } else {
        currentValue.value = target;
    }
}
window.addEventListener("mousemove", updateRange);
window.addEventListener("mouseup", endRange);
window.addEventListener("mouseup", endJump);
watch(currentValue, (newV, oldV) => {
    if (newV === oldV) return;
    currentValue.value = limited(props.min, newV, props.max);
    emit("update:value", newV);
});
watch(isRanging, (newV, oldV) => {
    if (newV === oldV) return;
    emit("update:ranging", newV);
});
watch(() => props.ranging, (newV, oldV) => {
    if (newV === oldV) return;
    isRanging.value = newV;
});
watch(() => props.value, (newV, oldV) => {
    if (newV === oldV) return;
    currentValue.value = limited(props.min, newV, props.max);
});
watch(() => props.min, (newV, oldV) => {
    if (newV === oldV) return;
    currentValue.value = limited(newV, currentValue.value, props.max);
});
watch(() => props.max, (newV, oldV) => {
    if (newV === oldV) return;
    currentValue.value = limited(props.min, currentValue.value, newV);
});
</script>
<style scoped>
.container {
    padding: 6px 0;
}

.value-bar {
    position: absolute;
    top: calc(-100% - 20px);
    left: 50%;
    background-color: transparent;
    z-index: 1;
    transform: translate(-50%, -50%) scale(0) rotate(-45deg);
    text-wrap-mode: nowrap;
    padding: 2px 4px;
    border-radius: 5px;
    transition: all .2s ease-out;
    pointer-events: none;
    background-color: rgba(0, 0, 0, 0.1);
    opacity: 0;
    transform-origin: 50% 100%;
}

.value-bar.isRanging {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1) rotate(-45deg);
}

.bar {
    position: relative;
    height: 4px;
    border-radius: 5px;
    background-color: gray;
}

.ball {
    --pos: 0%;
    position: absolute;
    top: 50%;
    left: var(--pos);
    width: 10px;
    height: 10px;
    background-color: rgb(60, 60, 60);
    transform: translate(-50%, -50%) rotate(45deg);
    transition: background-color .2s ease-out, width .2s ease-out, height .2s ease-out;
}

.ball:hover {
    background-color: rgb(110, 110, 110);
    width: 7px;
    height: 7px;
}

.ball::before {
    content: "";
    position: absolute;
    left: 50%;
    top: 50%;
    width: 15px;
    height: 15px;
    transform: translate(-50%, -50%) rotate(0deg);
    background-color: transparent;
    opacity: 0;
    border: 1px solid rgb(120, 120, 120);
    transition: all .2s ease-out;
}

.block {
    --progress: 0;
    position: absolute;
    left: 50%;
    top: 50%;
    width: 10px;
    height: 10px;
    opacity: calc(var(--progress));
}

.block.internal {
    background-color: rgba(255, 255, 255, 0.8);
    transform: translate(-50%, -50%) rotate(0deg) scale(var(--progress));
}

.block.external {
    background-color: rgba(0, 0, 0, 0.2);
    transform: translate(-50%, -50%) rotate(calc(180deg * var(--progress))) scale(calc(3 - var(--progress) * 2));
}

.ball:hover::before {
    opacity: 1;
    transform: translate(-50%, -50%) rotate(180deg);
}

.ball.isRanging {
    background-color: rgb(160, 160, 160);
}

.ball.isRanging::before {
    transform: translate(-50%, -50%) rotate(225deg);
    width: 13px;
    height: 13px;
}
</style>