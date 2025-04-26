<template>
    <div class="nav">
        ScriptEditor
        <SmallButton @click="$emit('openWindow', 'node')">🎞️节点</SmallButton>
        <SmallButton @click="$emit('openWindow', 'world')">🌍世界观</SmallButton>
        <SmallButton @click="$emit('openWindow', 'asset')">📦资源</SmallButton>
    </div>
</template>
<script setup lang="ts">
import SmallButton from './SmallButton.vue';
</script>
<style scoped>
.nav {
    position: fixed;
    width: 100%;
    padding: 10px;
    background-color: rgb(240, 240, 240);
    display: flex;
}
</style>