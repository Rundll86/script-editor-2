<template>
    <div :style="{
        zIndex: props.priority
    }">
        <slot></slot>
    </div>
</template>
<script setup lang="ts">
const props = defineProps({
    priority: {
        type: Number,
        required: true,
    }
});
</script>