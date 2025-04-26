<script setup lang="ts">
import { computed, ref, type PropType } from 'vue';
import type { NodeScript, ProjectData } from '@/structs';
import { nodeTypeNames, nodeTypes } from "@/structs";
import Draggable from './Draggable.vue';
import Selector from './Selector.vue';
import CirclePoint from './CirclePoint.vue';
import OptionLabel from './OptionLabel.vue';
import OptionList from './OptionList.vue';
import SquareButton from './SquareButton.vue';
const props = defineProps({
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
    return props.data.outPoints[connectingIndex.value];
});
function createOutPoint() {
    props.data.outPoints.push({
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
            <CirclePoint :data-node="data.id" />
            {{ nodeTypeNames[nodeTypes.indexOf(data.type)] }}
        </div>
        <div class="content">
            <CirclePoint normal v-for="_, index in data.outPoints" v-if="data.type !== 'select'"
                @mousedown.prevent="startConnect($event, index)" />
            <div class="node-part" v-if="data.type === 'talk' || data.type === 'select'">
                说话者：
                <Selector :options="project.characters" v-model:selected="data.talker" />
                说话者的情绪：
                <Selector :options="project.feelings" v-model:selected="data.feeling" />
                内容：
                <input v-model="data.message" />
            </div>
            <OptionList class="options" v-if="data.type === 'select'">
                <template #afterTitle>
                    <SquareButton @click="createOutPoint">+</SquareButton>
                </template>
                <OptionLabel v-for="option, index in data.outPoints">
                    <input type="text" v-model="option.label">
                    <CirclePoint @mousedown.prevent="startConnect($event, index)" />
                </OptionLabel>
            </OptionList>
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
    border: 1px solid gray;
    border-radius: var(--r);
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

.content {
    background-color: rgb(250, 250, 250);
    padding: 10px;
    border-radius: 0 0 var(--r) var(--r);
    position: relative;
}

.options {
    margin-top: 35px;
}
</style>