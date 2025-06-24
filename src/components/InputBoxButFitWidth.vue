<template>
    <input ref="autoWidthInput" :style="{
        width: inputWidth + 'px'
    }" @input="updateWidth" :value="modelValue" />
</template>
<script setup lang="ts">
import { onMounted, PropType, ref } from "vue";
const props = defineProps({
    modelValue: {
        type: [String, Number]
    },
    castFunction: {
        type: Function as PropType<(original: string) => any>,
        default: () => (e: string) => e
    }
});
const emit = defineEmits(["update:modelValue"]);
const inputWidth = ref(10);
const autoWidthInput = ref<HTMLInputElement | null>(null);
function updateWidth() {
    emit("update:modelValue", props.castFunction(autoWidthInput.value?.value as string));
    const inputElement = autoWidthInput.value as HTMLInputElement;
    const tempSpan = document.createElement("span");
    tempSpan.style.visibility = "hidden";
    tempSpan.style.whiteSpace = "nowrap";
    tempSpan.style.fontSize = getComputedStyle(inputElement).fontSize;
    tempSpan.style.fontFamily = getComputedStyle(inputElement).fontFamily;
    tempSpan.textContent = inputElement.value;
    document.body.appendChild(tempSpan);
    inputWidth.value = tempSpan.offsetWidth + 20;
    document.body.removeChild(tempSpan);
}
onMounted(() => {
    updateWidth();
});
</script>