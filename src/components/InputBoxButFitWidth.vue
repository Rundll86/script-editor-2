<template>
    <input ref="input" :style="{
        width: realWidth + 'px'
    }" @input="setContent" :value="contentInside" />
</template>
<script setup lang="ts">
import { computed, PropType, ref, watch } from "vue";
const props = defineProps({
    modelValue: {
        type: [String, Number],
        default: ""
    },
    caster: {
        type: Function as PropType<(original: string) => any>
    },
    sweeper: {
        type: Function as PropType<(casted: any, original: string) => boolean>
    }
});
const contentInside = ref(props.modelValue);
const emit = defineEmits(["update:modelValue"]);
const realWidth = computed<number>(() => {
    dust.value = !dust.value;
    if (!input.value) return 0;
    const inputElement = input.value;
    const tempSpan = document.createElement("span");
    tempSpan.style.visibility = "hidden";
    tempSpan.style.whiteSpace = "nowrap";
    tempSpan.style.fontSize = getComputedStyle(inputElement).fontSize;
    tempSpan.style.fontFamily = getComputedStyle(inputElement).fontFamily;
    tempSpan.textContent = inputElement.value;
    document.body.appendChild(tempSpan);
    const result = tempSpan.offsetWidth + 20;
    document.body.removeChild(tempSpan);
    return result;
});
const input = ref<HTMLInputElement | null>(null);
const dust = ref(false);
function setContent(e: Event) {
    if (!(e.target instanceof HTMLInputElement)) return;
    const { value: inputString } = e.target;
    const oldValue = contentInside.value;
    if (props.caster) {
        const casted = props.caster(inputString);
        if (props.sweeper && props.sweeper(casted, inputString)) {
            contentInside.value = oldValue;
        } else contentInside.value = casted;
    }
    else {
        contentInside.value = inputString;
    }
}
watch(contentInside, (value, old) => {
    if (value === old) return;
    emit("update:modelValue", value);
});
watch(() => props.modelValue, (value) => {
    if (value === contentInside.value) return;
    contentInside.value = value;
});
</script>