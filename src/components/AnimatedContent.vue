<template>
    <span class="container">
        <span class="placeholder">{{ current === 1 ? data1 : data2 }}</span>
        <span :class="{ part: true, up: true, hide: current === 2 }">{{ data1 }}</span>
        <span :class="{ part: true, down: true, hide: current === 1 }">{{ data2 }}</span>
    </span>
</template>
<script setup lang="ts">
import { ref, watch } from 'vue';
const props = defineProps({
    content: {
        type: String,
        default: ""
    }
});
const current = ref<1 | 2>(1);
const data1 = ref(props.content);
const data2 = ref(props.content);
watch(() => props.content, (newValue) => {
    if (current.value === 1) {
        data2.value = newValue;
        current.value = 2;
    } else {
        data1.value = newValue;
        current.value = 1;
    }
});
</script>
<style scoped>
.container {
    position: relative;
}

.placeholder {
    opacity: 0;
}

.part {
    position: absolute;
    transition: all 0.3s ease-in-out;
    opacity: 1;
    transform: translateY(0);
    text-wrap: nowrap;
    left: 0;
    top: 0;
    pointer-events: none;
}

.part.hide {
    opacity: 0;
}

.part.up.hide {
    transform: translateY(-100%);
}

.part.down.hide {
    transform: translateY(100%);
}
</style>