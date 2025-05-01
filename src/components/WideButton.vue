<template>
    <button :class="{ superwide }">
        <slot></slot>
    </button>
</template>
<script setup lang="ts">
defineProps({
    superwide: {
        type: Boolean,
        default: false
    }
});
</script>
<style scoped>
button {
    background-color: transparent;
    display: inline-flex;
    justify-content: center;
    align-items: center;
    padding: 5px 10px;
    margin: 5px 0;
    border: 1px solid gray;
    border-radius: 5px;
}

button.superwide {
    width: 100%;
}

button:hover {
    background-color: rgba(0, 0, 0, 0.1);
}

button:active {
    background-color: rgba(0, 0, 0, 0.2);
}
</style>