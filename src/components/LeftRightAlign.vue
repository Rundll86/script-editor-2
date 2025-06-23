<template>
    <div class="container">
        <div class="left">
            <slot name="left"></slot>
        </div>
        <div class="right">
            <slot name="right"></slot>
        </div>
    </div>
</template>
<style scoped>
.container {
    display: flex;
    margin: 2px 0;
    align-items: center;
    gap: 5px;
}

.left {
    margin-right: auto;
}

.right {
    margin-left: auto;
}
</style>