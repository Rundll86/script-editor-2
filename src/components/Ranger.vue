<template>
    <div class="bar">
        <div class="ball" :style="{
            '--pos': `${value / (max - min)}%`
        }"></div>
    </div>
</template>
<script setup lang="ts">
defineProps({
    max: {
        type: Number,
        default: 100
    },
    min: {
        type: Number,
        default: 0
    },
    value: {
        type: Number,
        default: 50
    }
});
</script>
<style scoped>
.bar {
    position: relative;
    height: 10px;
    border-radius: 5px;
    background-color: gray;
}

.ball {
    --pos: 0%;
    position: absolute;
    top: 50%;
    left: var(--pos);
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background-color: rgb(60, 60, 60);
    transform: translate(-50%, -50%);
}
</style>