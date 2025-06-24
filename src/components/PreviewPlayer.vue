<template>
    <div class="player" :style="{
        '--w': size.x + 'px',
        '--h': size.y + 'px'
    }">
        <img v-if="backgroundUrl" :src="backgroundUrl" class="background">
        <div v-else class="background">
            {{ currentNode ? "无背景图像" : "未播放任何节点" }}
        </div>
        <div class="overlay" @click="checkNext">
            <div class="messagebox" v-if="currentNode?.type === 'talk' || currentNode?.type === 'select'">
                <img v-if="avatarUrl" :src="avatarUrl" class="avatar">
                <div v-else class="avatar">无角色头像</div>
                <div class="messagecontent">
                    <span class="character">{{ project.characters[currentNode.talker as number].name }}</span>
                    <div class="text">
                        {{ currentNode.message }}
                    </div>
                </div>
            </div>
            <div class="options" v-if="currentNode?.type === 'select'">
                <div class="option" v-for="option in currentNode.outPoints" @click.stop="playFrom(option.nextId)">
                    {{ option.label }}
                </div>
            </div>
        </div>
    </div>
</template>
<script setup lang="ts">
import { PlayerVM, ProjectData, Vector } from '@/structs';
import { refObjectUrl } from '@/tools';
import { computed, PropType, ref, watch } from 'vue';
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
const playerVM = ref(new PlayerVM());
const currentNode = computed(() => props.project.nodes.find(node => node.id === playerVM.value.currentNode));
const backgroundUrl = refObjectUrl(() => playerVM.value.currentBackground);
const avatarUrl = refObjectUrl(() => props.project.assets[props.project.characters[currentNode.value?.talker ?? 0]?.feelings[currentNode.value?.feeling ?? 0]]?.data as ArrayBuffer);
watch(() => props.playWith, playFrom);
function playFrom(id: string | null) {
    console.log(id, playerVM.value);
    playerVM.value.currentNode = id;
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