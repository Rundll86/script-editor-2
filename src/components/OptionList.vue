<template>
    <Frame title="选项" class="options">
        <template #afterTitle>
            <slot name="afterTitle"></slot>
        </template>
        <slot></slot>
    </Frame>
</template>
<script setup lang="ts">
import Frame from "./ContainerFrame.vue";
</script>
<style scoped>
.options {
    display: flex;
    flex-direction: column;
}
</style>