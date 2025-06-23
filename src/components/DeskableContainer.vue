<template>
    <div>
        <div @click="toggle">
            <slot name="toggler" :opening="opening"></slot>
        </div>
        <div class="desk" :class="{ opening }">
            <slot name="content"></slot>
        </div>
    </div>
</template>
<script setup lang="ts">
import { ref } from "vue";
const props = defineProps({
    initial: {
        type: Boolean,
        default: false
    }
});
const emit = defineEmits(["toggle"]);
const opening = ref(props.initial);
function toggle() {
    opening.value = !opening.value;
    emit("toggle", opening.value);
};
</script>
<style scoped>
.desk {
    height: 0;
    opacity: 0;
    transform: scale(0);
    interpolate-size: allow-keywords;
    transform-origin: 50% 0;
    transition: all 0.3s ease-in-out;
    overflow: visible;
}

.desk.opening {
    height: 100%;
    opacity: 1;
    transform: scale(1);
}
</style>