<template>
    <div class="box" :class="{
        'user': message.role === 'user'
    }" v-if="message.role !== 'system'">
        <span class="avatar">{{ message.role }}</span>
        <div ref="content" class="content"></div>
    </div>
</template>
<script setup lang="ts">
import { OpenAIProtocol } from '@/tools';
import { onMounted, PropType, ref, watch } from 'vue';
import { marked } from 'marked';
import hljs from 'highlight.js';
import "highlight.js/styles/vs2015.min.css";
const emit = defineEmits(['scroll']);
const props = defineProps({
    message: {
        type: Object as PropType<OpenAIProtocol.MessageContext>,
        required: true
    }
});
const content = ref<HTMLDivElement | null>(null);
async function loadContent(data: string) {
    const div = document.createElement("div");
    div.innerHTML = data;
    div.querySelectorAll("*").forEach(e => {
        if (e.nodeName === "USER-PROJECT") {
            e.remove();
        }
    });
    const rawContent = div.innerHTML;
    return await marked(rawContent, { async: true });
}
watch(() => props.message.content, async (value) => {
    if (content.value) {
        content.value.innerHTML = await loadContent(value);
        content.value.querySelectorAll("pre code").forEach((code) => {
            hljs.highlightElement(code as HTMLElement);
        });
        emit("scroll");
    }
});
onMounted(async () => {
    if (content.value) content.value.innerHTML = await loadContent(props.message.content);
});
</script>
<style scoped>
.box {
    border-radius: 5px;
    border: 2px solid gray;
    padding: 5px;
    width: fit-content;
    max-width: 80%;
    margin-left: auto;
}

.user {
    margin-left: 0;
}

.avatar {
    background-color: rgb(230, 230, 230);
    border-radius: 5px;
    display: inline-block;
    padding: 2px 4px;
}

.content {
    padding: 5px 15px;
}

:deep(code) {
    overflow: auto;
    width: 100%;
}

:deep(li) {
    list-style-position: inside;
}
</style>