<template>
    <div class="container" ref="container">
        <MessageBox v-for="message, index in data" :key="index" :message="message" @scroll="scroll" />
    </div>
</template>
<script lang="ts" setup>
import { OpenAIProtocol } from "@/tools";
import { PropType, ref } from "vue";
import MessageBox from "./MessageBox.vue";
defineProps({
    data: Array as PropType<OpenAIProtocol.MessageContext[]>
});
const container = ref<HTMLDivElement | null>(null);
function scroll() {
    if (container.value) {
        console.log("test");

        container.value.scrollTop = container.value.scrollHeight;
    }
}
</script>
<style scoped>
.container {
    height: 30vh;
    max-width: 30vw;
    padding: 20px;
    display: flex;
    flex-direction: column;
    gap: 10px;
    overflow-x: hidden;
    overflow-y: auto;
    border: 2px solid gray;
    margin-top: 5px;
}
</style>