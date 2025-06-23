<template>
    <input ref="autoWidthInput" :style="{
        width: inputWidth + 'px'
    }" @input="updateWidth" :value="modelValue" />
</template>
<script setup lang="ts">
import { onMounted, ref } from "vue";
defineProps({
    modelValue: String
});
const emit = defineEmits(["update:modelValue"]);
const inputWidth = ref(10);
const autoWidthInput = ref<HTMLInputElement | null>(null);
const updateWidth = () => {
    emit("update:modelValue", autoWidthInput.value?.value);
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
};
onMounted(() => {
    updateWidth();
});
</script>