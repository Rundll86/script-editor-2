<template>
    <button>
        <slot></slot>
    </button>
</template>
<style scoped>
button {
    background-color: rgba(0, 0, 0, 0.05);
    display: inline-flex;
    justify-content: center;
    align-items: center;
    padding: 3px 5px;
    margin: 0 5px;
    border-bottom: 1px solid gray;
    border-radius: 5px;
    transition-duration: .1s;
}

button:hover {
    background-color: rgba(0, 0, 0, 0.15);
}

button:active {
    background-color: rgba(0, 0, 0, 0.25);
}
</style>