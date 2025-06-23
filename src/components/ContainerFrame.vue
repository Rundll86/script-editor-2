<template>
    <div class="frame" :class="{ 'no-margin': !title?.trim() }">
        <span class="title">
            {{ title }}
            <slot name="afterTitle"></slot>
        </span>
        <slot></slot>
    </div>
</template>
<script setup lang="ts">
defineProps({
    title: String
});
</script>
<style scoped>
.frame {
    --font-size: 14px;
    --title: 'Frame';
    border: 1px solid rgb(200, 200, 200);
    /* background-color: rgba(0, 0, 0, 0.05); */
    border-radius: 5px;
    padding: 10px;
    position: relative;
    margin-top: calc(var(--font-size) + 10px);
}

.frame.no-margin {
    margin-top: 0;
}

.title {
    position: absolute;
    left: 0;
    top: 0;
    font-size: var(--font-size);
    transform: translateY(-100%);
    display: flex;
    align-items: center;
    margin-top: -5px;
}
</style>