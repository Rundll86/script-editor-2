<template>
    <ContainerFrame title="选项" class="options">
        <template #afterTitle>
            <slot name="afterTitle"></slot>
        </template>
        <slot></slot>
    </ContainerFrame>
</template>
<script setup lang="ts">
import ContainerFrame from "./ContainerFrame.vue";
</script>
<style scoped>
.options {
    display: flex;
    flex-direction: column;
}
</style>