<script setup lang="ts">
import { computed, ref, type ComputedRef, type PropType } from 'vue';
import type { Asset, NodeScript, ProjectData } from '@/structs';
import { nodeTypeNames, nodeTypes } from "@/structs";
import Draggable from './Draggable.vue';
import Selector from './Selector.vue';
import CirclePoint from './CirclePoint.vue';
import OptionLabel from './OptionLabel.vue';
import OptionList from './OptionList.vue';
import SquareButton from './SquareButton.vue';
import { createObjectURL } from '@/tools';
import Deskable from './Deskable.vue';
import SmallButton from './SmallButton.vue';
import Resizable from './Resizable.vue';
import Frame from './Frame.vue';
const { data, project } = defineProps({
    data: {
        type: Object as PropType<NodeScript>,
        required: true,
    },
    project: {
        type: Object as PropType<ProjectData>,
        required: true,
    }
});
const connecting = ref(false);
const connectingIndex = ref(0);
const connectingPoint = computed(() => {
    return data.outPoints[connectingIndex.value];
});
const avatarData = computed(() => {
    return project.assets[project.characters[data.talker ?? 0]?.feelings[data.feeling ?? 0]]?.data;
});
const myAsset: ComputedRef<Asset | undefined> = computed(() => {
    return project.assets[data.assetId ?? 0];
});
const allowedPairs = ["$;", "[]", "{}"];
const allowedSeparators = ":.>%~#@→↣↝↠↣↦⇀⇏⇒⇥⇨⇢⇰⇸⇻⇾▸▹▶▷►▻";
const nounSpliter = new RegExp(`[${allowedSeparators.split("").map(char => "\\" + char).join("")}]`, "g");
const centerd = `\\w+${nounSpliter.source}\\s*\\d+\\s*`;
const nounMatcher = new RegExp(allowedPairs.map(pair => `(\\${pair[0]}${centerd}\\${pair[1]})`).join("|"), "g");
const unknownNounTip = "▸未知名词，请在「世界观」选项卡设置◂";
const nouns: ComputedRef<{
    refer: string;
    callIndex: number;
    callName: string;
    calls: string[];
}[]> = computed(() => {
    const matches = [...data.message?.match(nounMatcher) ?? []];
    return matches.map(match => {
        const data = match.slice(1, -1).split(nounSpliter);
        const [refer, index] = [data[0].trim(), Number(data[1]) - 1];
        const calls = project.nouns.find(nounSrc => nounSrc.refer === refer)?.calls;
        return {
            refer,
            callIndex: index,
            callName: calls?.[index] ?? unknownNounTip,
            calls: calls ?? []
        };
    }).filter(item => project.nouns.some(nounSrc => nounSrc.refer === item.refer));
});
const previewText = computed(() => {
    return data.message?.replace(nounMatcher, match => {
        const data = match.slice(1, -1).split(nounSpliter);
        const [refer, index] = [data[0].trim(), Number(data[1]) - 1];
        if (!project.nouns.some(nounSrc => nounSrc.refer === refer)) return match;
        return project.nouns.find(nounSrc => nounSrc.refer === refer)?.calls[index] ?? unknownNounTip;
    }) ?? "";
});
function createOutPoint() {
    data.outPoints.push({
        label: "",
        outElement: null,
        inElement: null,
        nextId: null,
        followingCursor: false,
    });
};
function isElementValidInPoint(element: Element | EventTarget | null): element is HTMLElement {
    return !!(
        element &&
        element instanceof HTMLElement &&
        element.dataset.node
    );
};
function startConnect(e: MouseEvent, index: number) {
    connecting.value = true;
    connectingIndex.value = index;
    connectingPoint.value.outElement = e.target as HTMLElement;
    connectingPoint.value.followingCursor = true;
};
function endConnect(e: MouseEvent) {
    if (!connecting.value) return;
    if (isElementValidInPoint(e.target)) {
        connectingPoint.value.nextId = e.target.dataset.node as string;
        connectingPoint.value.inElement = e.target;
    } else {
        connectingPoint.value.nextId = null;
        connectingPoint.value.inElement = null;
    }
    connectingPoint.value.followingCursor = false;
    connecting.value = false;
};
window.addEventListener("mouseup", endConnect);
</script>
<template>
    <Draggable v-model:x="data.position.x" v-model:y="data.position.y" class="node">
        <div class="titlebar" data-region="true">
            <CirclePoint :data-node="data.id" data-point="in" />
            {{ nodeTypeNames[nodeTypes.indexOf(data.type)] }}{{ project.entryNode === data.id ? "（入口）" : "" }}
        </div>
        <div class="content">
            <Frame title="节点">
                <SmallButton @click="project.entryNode = data.id">设为入口节点</SmallButton>
            </Frame>
            <CirclePoint normal :key="index" v-for="_, index in data.outPoints" v-if="data.type !== 'select'"
                @mousedown.prevent="startConnect($event, index)" data-point="0" :data-node="data.id" />
            <div class="node-part" v-if="data.type === 'script'">
                选择脚本：
                <Selector :options="project.assets.map(asset => asset.name)" v-model:selected="data.assetId" />
            </div>
            <div class="node-part" v-if="data.type === 'media'">
                选择资源：
                <Selector :options="project.assets.map(asset => asset.name)" v-model:selected="data.assetId" />
                <Deskable class="asset-select">
                    <template #toggler="props">
                        <SmallButton>
                            预览
                            {{ props.opening ? "▴" : "▾" }}
                        </SmallButton>
                    </template>
                    <template #content>
                        <Resizable>
                            <img v-if="myAsset?.type === 'image'" class="media-preview"
                                :src="createObjectURL(myAsset.data)">
                            <video controls v-if="myAsset?.type === 'video'" class="media-preview"
                                :src="createObjectURL(myAsset.data)"></video>
                        </Resizable>
                    </template>
                </Deskable>
            </div>
            <div class="node-part" v-if="data.type === 'talk' || data.type === 'select'">
                角色：
                <Selector :options="project.characters.map(char => char.name)" v-model:selected="data.talker" />
                当前情绪：
                <Selector :options="project.feelings" v-model:selected="data.feeling" />
                <div class="previewer">
                    <span v-if="avatarData">头像预览<br></span>
                    <img v-if="avatarData" class="preview" :src="createObjectURL(avatarData)" />
                    <span class="tip" v-else>请先在「世界观」选项卡中创建一个角色<br>并在此情绪下设置一个有效的头像资源。</span>
                </div>
                内容：
                <textarea v-model="data.message"></textarea>
                <Frame title="专有名词" v-if="nouns.length > 0">
                    <Resizable>
                        <Frame class="preview-text" title="">{{ previewText }}</Frame>
                    </Resizable>
                    <div :key="index" v-for="noun, index in nouns">
                        {{ noun.refer }}(别名{{ noun.callIndex + 1 }})：
                        <span class="margin5-left" :class="{
                            'underlined': i === noun.callIndex,
                            'bolded': i === noun.callIndex
                        }" :key="i" v-for="call, i in noun.calls">
                            {{ call }}
                        </span>
                    </div>
                </Frame>
            </div>
            <OptionList class="options" v-if="data.type === 'select'">
                <template #afterTitle>
                    <SquareButton @click="createOutPoint">+</SquareButton>
                </template>
                <OptionLabel :key="index" v-for="option, index in data.outPoints">
                    <input type="text" v-model="option.label">
                    <CirclePoint :data-node="data.id" :data-point="index"
                        @mousedown.prevent="startConnect($event, index)" />
                </OptionLabel>
            </OptionList>
            <br>&nbsp;
        </div>
    </Draggable>
</template>
<style scoped>
* {
    --r: 5px;
}

.node {
    display: flex;
    flex-direction: column;
    border: 2px solid rgb(180, 180, 180);
    border-radius: var(--r);
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
    transition: transform .2s ease-out, box-shadow .2s ease-out;
    transform: scale(1);
}

.node:hover {
    box-shadow: 0 0 15px rgba(0, 0, 0, 0.3);
    transform: scale(1.01);
}

.node * {
    text-wrap-mode: nowrap;
}

.node-part {
    display: inline-flex;
    flex-direction: column;
    gap: 2px;
    width: 100%;
}

.titlebar {
    background-color: rgb(235, 235, 235);
    padding: 5px;
    border-radius: var(--r) var(--r) 0 0;
    display: flex;
    align-items: center;
}

.content {
    background-color: rgb(250, 250, 250);
    padding: 10px;
    border-radius: 0 0 var(--r) var(--r);
    position: relative;
}

.options {
    margin-top: 35px;
}

.previewer {
    text-align: center;
}

.preview {
    width: 70px;
    height: 70px;
    border: 1px solid gray;
    object-fit: contain;
    padding: 5px;
    border-radius: 5px;
}

.media-preview {
    width: 100%;
    height: 100%;
}

.tip {
    font-size: 12px;
}

.asset-select {
    display: flex;
    flex-direction: column;
    align-items: center;
}

.preview-text {
    text-wrap-mode: wrap;
    overflow: hidden;
}
</style>