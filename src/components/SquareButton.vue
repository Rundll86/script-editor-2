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
    display: inline-flex;
    justify-content: center;
    align-items: center;
    transition: all 0.2s ease-out;
    border-radius: 5px;
    margin-left: 5px;
}

button:hover {
    background-color: rgba(0, 0, 0, 0.1);
}

button:active {
    background-color: rgba(0, 0, 0, 0.2);
}
</style>