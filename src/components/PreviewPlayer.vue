<template>
    <div class="player" :style="{
        '--w': size.x + 'px',
        '--h': size.y + 'px'
    }">
        <template v-if="backgroundUrl">
            <img v-if="currentBackground?.type === 'image'" :src="backgroundUrl" class="background">
            <video autoplay v-else-if="currentBackground?.type === 'video'" :src="backgroundUrl"
                class="background"></video>
        </template>
        <div v-else class="background">
            {{ currentNode ? "无媒体" : "未播放任何节点" }}
        </div>
        <div class="overlay" @click="checkNext">
            <div class="messagebox" v-if="currentNode?.type === 'talk' || currentNode?.type === 'select'">
                <AvatarPreview :data="currentNode" :project="project" />
                <div class="messagecontent">
                    <span class="character">{{ project.characters[currentNode.talker as number].name }}</span>
                    <div class="text">
                        {{ currentNode.message }}
                    </div>
                </div>
            </div>
            <div class="options" v-if="currentNode?.type === 'select'">
                <div class="option" :key="option.label" v-for="option in currentNode.outPoints"
                    @click.stop="playFrom(option.nextId)">
                    {{ option.label }}
                </div>
            </div>
        </div>
    </div>
</template>
<script setup lang="ts">
import { ProjectData, Vector } from "@/structs";
import { refObjectUrl } from "@/tools";
import { computed, PropType, ref, watch } from "vue";
import AvatarPreview from "./AvatarPreview.vue";
const props = defineProps({
    project: {
        type: Object as PropType<ProjectData>,
        required: true
    },
    size: {
        type: Vector,
        default: new Vector(640, 480)
    },
    playWith: {
        type: String as PropType<string | null>,
        default: null
    }
});
const currentNodeId = ref<string | null>("");
const currentNode = computed(() => props.project.nodes.find(node => node.id === currentNodeId.value));
const currentBackground = computed(() => currentNode.value?.type === "media" ? props.project.assets[currentNode.value.assetId as number] : null);
const backgroundUrl = refObjectUrl(() => currentBackground.value?.data as ArrayBuffer);
watch(() => props.playWith, playFrom);
function playFrom(id: string | null) {
    currentNodeId.value = id;
    if (currentNode.value?.type === "script") {
        window.msg("info", `执行脚本：${props.project.assets[currentNode.value.assetId as number].name}`);
    }
}
function checkNext() {
    if (!currentNode.value) return;
    if (currentNode.value.type === "select") return;
    playFrom(currentNode.value.outPoints[0].nextId);
}
</script>
<style scoped>
.player {
    --w: 640px;
    --h: 480px;
    width: var(--w);
    height: var(--h);
    position: relative;
}

.background {
    width: 100%;
    height: 100%;
    border: 1px solid gray;
    background-color: rgba(0, 0, 0, 0.1);
    display: flex;
    justify-content: center;
    align-items: center;
    font-weight: bold;
    font-size: 20px;
    object-fit: contain;
}

.overlay {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    display: flex;
}

.options {
    position: absolute;
    right: 0;
    top: 50%;
    transform: translateY(-50%);
    display: flex;
    flex-direction: column;
    gap: 5px;
    padding: 10px;
}

.option {
    background-color: rgba(0, 0, 0, 0.1);
    border: rgba(0, 0, 0, 0.3) solid 1px;
    padding: 3px 6px;
}

.option:hover {
    background-color: rgba(0, 0, 0, 0.2);
    border-color: rgba(0, 0, 0, 0.4);
}

.option:active {
    background-color: rgba(0, 0, 0, 0.3);
    border-color: rgba(0, 0, 0, 0.5);
}

.messagebox {
    background-color: rgba(0, 0, 0, 0.5);
    padding: 10px;
    margin: 20px;
    margin-top: auto;
    width: 100%;
    display: flex;
    gap: 10px;
}

.avatar {
    width: 100px;
    height: 100px;
    border: 2px solid gray;
    display: flex;
    justify-content: center;
    align-items: center;
    font-weight: bold;
    color: white;
}

.character {
    font-weight: bold;
    color: white;
}

.text {
    padding: 5px;
    color: white;
}
</style>