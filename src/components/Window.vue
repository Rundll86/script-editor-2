<script setup lang="ts">
import type { PropType } from 'vue';
import Draggable from './Draggable.vue';
import Resizable from './Resizable.vue';
import SquareButton from './SquareButton.vue';
import type { WindowType } from '@/structs';
defineProps({
    title: String,
    id: {
        type: String as PropType<WindowType>,
        required: true
    }
});
</script>
<template>
    <Draggable v-model:dragging="window.windowDraggings.value[id]" v-model:x="window.windowPositions.value[id].x"
        v-model:y="window.windowPositions.value[id].y" class="window">
        <div class="titlebar" data-region="true">
            {{ title }}
            <SquareButton style="margin: 0 0 0 auto;" @click="window.moveToTop(id)">↥</SquareButton>
            <SquareButton style="margin: 0 0 0 5px;" @click="window.closeWindow(id)">×</SquareButton>
        </div>
        <Resizable :enable="false" class="content">
            <slot></slot>
        </Resizable>
    </Draggable>
</template>
<style scoped>
* {
    --r: 10px;
}

.window {
    display: flex;
    flex-direction: column;
    border: 1px solid gray;
    border-radius: var(--r);
}

.titlebar {
    background-color: rgb(235, 235, 235);
    padding: var(--r);
    border-radius: var(--r) var(--r) 0 0;
    display: flex;
}

.content {
    background-color: rgb(250, 250, 250);
    padding: 20px;
    border-radius: 0 0 var(--r) var(--r);
    flex: 1;
    max-height: 50vh;
    overflow: auto;
}
</style>