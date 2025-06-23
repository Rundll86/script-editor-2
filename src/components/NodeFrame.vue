<script setup lang="ts">
import { computed, onMounted, ref, watch, type ComputedRef, type PropType } from "vue";
import type { Asset, NodeScript, NormalizedNoun, ProjectData } from "@/structs";
import { nodeTypeNames, nodeTypes, OutPoint, Settings } from "@/structs";
import DraggableContainer from "./DraggableContainer.vue";
import SelectBar from "./SelectBar.vue";
import CirclePoint from "./CirclePoint.vue";
import OptionLabel from "./OptionLabel.vue";
import OptionList from "./OptionList.vue";
import SquareButton from "./SquareButton.vue";
import { createObjectURL, NodeState } from "@/tools";
import DeskableContainer from "./DeskableContainer.vue";
import SmallButton from "./SmallButton.vue";
import ResizableContainer from "./ResizableContainer.vue";
import ContainerFrame from "./ContainerFrame.vue";
const { data, project } = defineProps({
    data: {
        type: Object as PropType<NodeScript>,
        required: true,
    },
    project: {
        type: Object as PropType<ProjectData>,
        required: true,
    },
    settings: {
        type: Object as PropType<Settings>,
        required: true
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
const nouns: ComputedRef<NormalizedNoun[]> = computed(() => {
    const matches = [...data.message?.match(nounMatcher) ?? []];
    return matches
        .map(normalizeNoun)
        .filter(item => project.nouns.some(nounSrc => nounSrc.refer === item.refer));
});
const previewText = computed(() => {
    return data.message?.replace(nounMatcher, match => {
        const normalized = normalizeNoun(match);
        if (!project.nouns.some(nounSrc => nounSrc.refer === normalized.refer)) return `◈${match}`;
        return normalized.callName;
    }) ?? "";
});
const isEntry = computed(() => project.entryNode === data.id);
const children = computed(() => NodeState.getChildren(data, project)) as ComputedRef<NodeScript[]>;
const cachedAvatarURL = ref("");
watch(avatarData, rebuildAvatarUrl);
onMounted(() => {
    rebuildAvatarUrl();
    window.addEventListener("mouseup", endConnect);
});
function rebuildAvatarUrl() {
    try {
        URL.revokeObjectURL(cachedAvatarURL.value)
    } catch (e) {
        console.error(e);
    };
    cachedAvatarURL.value = createObjectURL(avatarData.value);
}
function createOutPoint() {
    data.outPoints.push(new OutPoint());
};
function isElementValidInPoint(element: Element | EventTarget | null): element is HTMLElement & { dataset: { node: string, point: "in" } } {
    return !!(
        element &&
        element instanceof HTMLElement &&
        element.dataset.node &&
        element.dataset.point === "in"
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
        connectingPoint.value.nextId = e.target.dataset.node;
        connectingPoint.value.inElement = e.target;
    } else {
        connectingPoint.value.nextId = null;
        connectingPoint.value.inElement = null;
    }
    connectingPoint.value.followingCursor = false;
    connecting.value = false;
};
function normalizeNoun(matchText: string): NormalizedNoun {
    const data = matchText.slice(1, -1).split(nounSpliter);
    const [refer, index] = [data[0].trim(), Number(data[1]) - 1];
    const calls = project.nouns.find(nounSrc => nounSrc.refer === refer)?.calls;
    return {
        refer,
        callIndex: index,
        callName: calls?.[index] ?? unknownNounTip,
        calls: calls ?? [],
        scopePair: `${matchText[0]}${matchText[matchText.length - 1]}`,
        separator: matchText.match(nounSpliter)?.[0] ?? ":"
    };
};
function compileNoun(normalized: NormalizedNoun): string {
    return `${normalized.scopePair[0]}${normalized.refer}${normalized.separator}${normalized.callIndex + 1}${normalized.scopePair[1]}`;
};
function updateNounIndex(refer: string, newIndex: number, targetIndex: number) {
    let count = -1;
    data.message = data.message?.replace(nounMatcher, match => {
        count++;
        if (targetIndex !== count) return match;
        const normalized = normalizeNoun(match);
        if (normalized.refer !== refer) return match;
        else {
            normalized.callIndex = newIndex;
            return compileNoun(normalized);
        }
    });
};
function handleChildDiff(dx: number = 0, dy: number = 0) {
    children.value.forEach(child => {
        child.position.x += dx;
        child.position.y += dy;
    });
};
</script>
<template>
    <DraggableContainer v-model:x="data.position.x" v-model:y="data.position.y" class="node"
        @drag="window.keyboard.shift && handleChildDiff(...$event)">
        <div class="titlebar" data-region="true">
            <CirclePoint :data-node="data.id" data-point="in" />
            {{ nodeTypeNames[nodeTypes.indexOf(data.type)] }}
            <SquareButton @click="$emit('delete')">🗑️</SquareButton>
            <SquareButton class="margin-auto-left" @click="project.entryNode = data.id">
                {{ isEntry ? "◆" : "◇" }}
            </SquareButton>
        </div>
        <div class="content">
            <template v-if="data.type !== 'select'">
                <CirclePoint normal :key="index" v-for="_, index in data.outPoints"
                    @mousedown.prevent="startConnect($event, index)" data-point="0" :data-node="data.id" />
            </template>
            <div class="node-part" v-if="data.type === 'script'">
                选择脚本：
                <SelectBar :options="project.assets.map(asset => asset.name)" v-model:selected="data.assetId" />
            </div>
            <div class="node-part" v-if="data.type === 'media'">
                选择资源：
                <SelectBar :options="project.assets.map(asset => asset.name)" v-model:selected="data.assetId" />
                <DeskableContainer class="asset-select">
                    <template #toggler="props">
                        <SmallButton>
                            预览
                            {{ props.opening ? "▴" : "▾" }}
                        </SmallButton>
                    </template>
                    <template #content>
                        <ResizableContainer>
                            <img v-if="myAsset?.type === 'image'" class="media-preview"
                                :src="createObjectURL(myAsset.data)">
                            <video controls v-if="myAsset?.type === 'video'" class="media-preview"
                                :src="createObjectURL(myAsset.data)"></video>
                        </ResizableContainer>
                    </template>
                </DeskableContainer>
            </div>
            <div class="node-part" v-if="data.type === 'talk' || data.type === 'select'">
                角色：
                <SelectBar nullable :options="project.characters.map(char => char.name)"
                    v-model:selected="data.talker" />
                当前情绪：
                <SelectBar nullable :options="project.feelings" v-model:selected="data.feeling" />
                <DeskableContainer class="asset-select" :initial="settings.autoPreview">
                    <template #toggler="props">
                        <SmallButton>
                            头像预览
                            {{ props.opening ? "▴" : "▾" }}
                        </SmallButton>
                    </template>
                    <template #content>
                        <div class="previewer">
                            <img v-if="avatarData" class="preview" :src="cachedAvatarURL" />
                            <span class="tip" v-if="data.talker === undefined || data.talker < 0">请先选择一个角色。</span>
                            <span class="tip"
                                v-else-if="data.feeling === undefined || data.feeling < 0">请先选择一个情绪。</span>
                            <span class="tip" v-else-if="!avatarData">
                                请先在「世界观」选项卡中为<br>
                                {{ project.characters[data.talker].name }} - {{ project.feelings[data.feeling] }}
                                <br>分配一个头像资源。
                            </span>
                        </div>
                    </template>
                </DeskableContainer>
                内容：
                <textarea v-model="data.message"></textarea>
                <ContainerFrame title="专有名词" v-if="nouns.length > 0">
                    <ResizableContainer :width="200" :height="50">
                        <ContainerFrame class="preview-text" title="">{{ previewText }}</ContainerFrame>
                    </ResizableContainer>
                    <div :key="index" v-for="noun, index in nouns">
                        {{ noun.refer }}(别名{{ noun.callIndex + 1 }})：
                        <span class="margin5-left" :class="{
                            'underlined': i === noun.callIndex,
                            'bolded': i === noun.callIndex,
                            'text-button': i !== noun.callIndex
                        }" :key="i" v-for="call, i in noun.calls" @click="updateNounIndex(noun.refer, i, index)">
                            {{ call }}
                        </span>
                    </div>
                </ContainerFrame>
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
    </DraggableContainer>
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
    text-wrap: nowrap;
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

.delete-btn {
    margin-left: auto;
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
    text-wrap: auto;
}

.asset-select {
    display: flex;
    flex-direction: column;
    align-items: center;
}

.preview-text {
    text-wrap: wrap;
    overflow: hidden;
    width: 100%;
    height: 100%;
}
</style>