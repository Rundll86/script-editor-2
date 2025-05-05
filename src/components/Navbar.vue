<template>
    <div class="nav">
        <Logo />
        <SmallButton @click="$emit('openWindow', 'node')">🎞️节点</SmallButton>
        <SmallButton @click="$emit('openWindow', 'world')">🌍世界观</SmallButton>
        <SmallButton @click="$emit('openWindow', 'asset')">📦资源</SmallButton>
        <SmallButton @click="$emit('openWindow', 'variable')">📜变量</SmallButton>
        <SmallButton class="end" @click="$emit('openWindow', 'project')">🗂️项目</SmallButton>
        <SmallButton @click="$emit('openWindow', 'setting')">⚙️设置</SmallButton>
        <SmallButton @click="$emit('openWindow', 'about')">🧿关于</SmallButton>
    </div>
</template>
<script setup lang="ts">
import Logo from './Logo.vue';
import SmallButton from './SmallButton.vue';
</script>
<style scoped>
.nav {
    position: fixed;
    width: 100%;
    padding: 10px;
    background-color: rgb(240, 240, 240);
    display: flex;
    align-items: center;
}

.end {
    margin-left: auto;
}
</style>