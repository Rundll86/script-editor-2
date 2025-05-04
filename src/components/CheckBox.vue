<template>
    <span :class="{
        checked: isChecked
    }" @click="toggle"></span>
</template>
<style scoped>
span {
    width: 10px;
    height: 10px;
    position: relative;
    display: inline-block;
    border: 1px solid black;
    margin: 0 5px;
}

span:hover {
    cursor: pointer;
    background-color: rgba(0, 0, 0, 0.1);
}

span::before {
    content: "";
    display: block;
    background-color: transparent;
    position: absolute;
    width: 150%;
    height: 150%;
    left: -25%;
    top: -50%;
    clip-path: polygon(0 65%,
            0 45%,
            50% 70%,
            100% 0%,
            100% 30%,
            50% 100%);
    transition: all .1s ease-out;
}

span.checked::before {
    background-color: black;
}
</style>
<script setup lang="ts">
import { ref, watch } from 'vue';
const emit = defineEmits(["update:modelValue"]);
const props = defineProps({
    modelValue: {
        type: Boolean,
        default: false
    }
});
const isChecked = ref(props.modelValue)
function toggle() {
    isChecked.value = !isChecked.value;
};
watch(isChecked, (newV) => {
    if (newV === props.modelValue) return;
    emit("update:modelValue", isChecked.value);
});
watch(() => props.modelValue, (newV) => {
    if (newV === isChecked.value) return;
    isChecked.value = props.modelValue;
});
</script>