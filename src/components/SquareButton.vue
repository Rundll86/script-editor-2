<template>
    <button>
        <slot></slot>
    </button>
</template>
<style scoped>
button {
    width: 20px;
    height: 20px;
    background-color: transparent;
    display: flex;
    justify-content: center;
    align-items: center;
}

button:hover {
    background-color: rgba(0, 0, 0, 0.1);
}

button:active {
    background-color: rgba(0, 0, 0, 0.2);
}
</style>