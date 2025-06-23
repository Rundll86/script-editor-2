<template>
    <div class="box" :class="{
        'user': message.role === 'user'
    }" v-if="message.role !== 'system'">
        <div class="title">
            <span class="avatar" @click="hidden = !hidden">{{ message.role }}</span>
            <span class="preview" v-if="hidden" v-html="renderText"></span>
        </div>
        <div ref="content" class="content" v-if="!hidden" v-html="renderText"></div>
    </div>
</template>
<script setup lang="ts">
import { OpenAIProtocol } from "@/tools";
import { nextTick, onMounted, PropType, ref, watch } from "vue";
import { marked } from "marked";
import hljs from "highlight.js";
import "highlight.js/styles/vs2015.min.css";
const emit = defineEmits(["scroll"]);
const props = defineProps({
    message: {
        type: Object as PropType<OpenAIProtocol.MessageContext>,
        required: true
    }
});
const content = ref<HTMLDivElement | null>(null);
const renderText = ref("");
const hidden = ref(false);
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
async function loadMessage(value?: string) {
    renderText.value = await loadContent(value ?? props.message.content);
}
watch(() => props.message.content, async (value) => {
    await loadMessage(value);
    nextTick(() => {
        if (content.value) {
            content.value.querySelectorAll("pre code").forEach((code) => {
                hljs.highlightElement(code as HTMLElement);
            });
            emit("scroll");
        }
    });
});
onMounted(async () => {
    await loadMessage();
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

.title {
    display: flex;
}

.preview {
    overflow: auto;
    text-wrap: nowrap;
    margin-left: 5px;
}

.preview::-webkit-scrollbar {
    display: none;
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

.avatar:hover {
    background-color: rgb(215, 215, 215);
}

.avatar:active {
    background-color: rgb(200, 200, 200);
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