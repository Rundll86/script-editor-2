<template>
    <div :class="{ point: true, normal }"></div>
</template>
<script setup lang="ts">
defineProps({ normal: Boolean });
</script>
<style scoped>
.point {
    border-radius: 50%;
    border: 2px solid gray;
    background-color: rgba(0, 0, 0, 0.1);
    width: 15px;
    height: 15px;
    transition: all .2s ease-out;
    transform: scale(1);
    display: inline-block;
    margin: 0 2px;
    cursor: crosshair;
}

.point.normal {
    position: absolute;
    right: 10px;
    bottom: 10px;
}

.point:hover {
    box-shadow: 0 0 5px rgba(0, 0, 0, 0.5);
    transform: scale(1.1);
}
</style>