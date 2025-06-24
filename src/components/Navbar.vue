<template>
    <div class="nav">
        <LogoImage />
        <SmallButton @dblclick="window.dragToZero('node')" @click="window.openWindow('node')">🎞️节点</SmallButton>
        <SmallButton @dblclick="window.dragToZero('world')" @click="window.openWindow('world')">🌍世界观</SmallButton>
        <SmallButton @dblclick="window.dragToZero('asset')" @click="window.openWindow('asset')">📦资源</SmallButton>
        <SmallButton @dblclick="window.dragToZero('variable')" @click="window.openWindow('variable')">📜变量</SmallButton>
        <SmallButton class="end" @dblclick="window.dragToZero('ai')" @click="window.openWindow('ai')">🧿仙灵</SmallButton>
        <SmallButton @dblclick="window.dragToZero('preview')" @click="window.openWindow('preview')">🕹️预览</SmallButton>
        <SmallButton class="end" @dblclick="window.dragToZero('project')" @click="window.openWindow('project')">
            🗂️项目
        </SmallButton>
        <SmallButton @dblclick="window.dragToZero('setting')" @click="window.openWindow('setting')">⚙️设置</SmallButton>
        <SmallButton @dblclick="window.dragToZero('about')" @click="window.openWindow('about')">🐺关于</SmallButton>
    </div>
</template>
<script setup lang="ts">
import LogoImage from "./LogoImage.vue";
import SmallButton from "./SmallButton.vue";
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