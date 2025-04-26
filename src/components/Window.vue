<script setup lang="ts">
import Draggable from './Draggable.vue';
import Resizable from './Resizable.vue';
import SquareButton from './SquareButton.vue';
defineProps({
    title: String,
    state: Boolean
});
</script>
<template>
    <Draggable class="window" v-if="state">
        <div class="titlebar" data-region="true">
            {{ title }}
            <SquareButton class="close-btn" @click="$emit('update:state', false)">×</SquareButton>
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

.close-btn {
    margin-left: auto;
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