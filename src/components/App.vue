<template>
    <div class="script-editor">
        <Layer :priority="-1">
            <Draggable region-style="grab">
                <div class="fullscreen" data-region="true"></div>
                <Node v-for="node in project.nodes" :data="node" :project="project" />
                <canvas ref="stage" class="fullscreen focus-pass"></canvas>
            </Draggable>
        </Layer>
        <Navbar :states="windowState" @openWindow="openWindow($event)" />
        <Layer :priority="0">
            <Window title="节点管理" v-model:state="windowState.node">
                <Frame title="新建节点">
                    选择一个节点类型：
                    <Selector :options="nodeTypeNames" v-model:selected="editorState.selectedNodeType" /><br>
                    <WideButton superwide @click="createNode(nodeTypes[editorState.selectedNodeType])">新建</WideButton>
                </Frame>
                <Frame title="节点列表">
                    <span v-for="node in project.nodes">{{ node.id }}</span><br>
                </Frame>
            </Window>
            <Window title="世界观设定" v-model:state="windowState.world">
                <OptionList title="角色列表">
                    <template #afterTitle>
                        <SquareButton @click="project.characters.push('')">+</SquareButton>
                    </template>
                    <OptionLabel v-for="_, index in project.characters" :key="index">
                        <input type="text" v-model="project.characters[index]" placeholder="角色名称..." />
                    </OptionLabel>
                </OptionList>
                <OptionList title="心情种类">
                    <template #afterTitle>
                        <SquareButton @click="project.feelings.push('')">+</SquareButton>
                    </template>
                    <OptionLabel v-for="_, index in project.feelings" :key="index">
                        <input type="text" v-model="project.feelings[index]" placeholder="心情名称..." />
                    </OptionLabel>
                </OptionList>
            </Window>
            <Window title="资源管理" v-model:state="windowState.asset">
                <OptionList title="图像">
                    <template #afterTitle>
                        <SquareButton @click="project.assets.push({
                            name: 'Unnamed Asset',
                            type: 'image',
                            data: null
                        })">+</SquareButton>
                    </template>
                    <OptionLabel v-for="_, index in project.assets" :key="index">
                        <AssetBar v-model:data="project.assets[index]" />
                    </OptionLabel>
                </OptionList>
            </Window>
        </Layer>
    </div>
</template>
<script setup lang="ts">
import { Vector, nodeTypes, nodeTypeNames, type EditorState, type NodeScript, type NodeType, type ProjectData, type WindowType } from '@/structs';
import { onMounted, ref } from 'vue';
import { Drawing, elementCenter, everyFrame, uuid } from '@/tools';
import Navbar from './Navbar.vue';
import Layer from './Layer.vue';
import Node from './Node.vue';
import Window from './Window.vue';
import Frame from './Frame.vue';
import Selector from './Selector.vue';
import WideButton from './WideButton.vue';
import Draggable from './Draggable.vue';
import OptionLabel from './OptionLabel.vue';
import OptionList from './OptionList.vue';
import SquareButton from './SquareButton.vue';
import AssetBar from './AssetBar.vue';
onMounted(() => {
    Drawing.initWith(stage.value as HTMLCanvasElement);
    window.addEventListener("resize", () => {
        Drawing.resizeCanvas();
    });
    everyFrame(() => {
        Drawing.clear();
        project.value.nodes.forEach(node => {
            node.outPoints.forEach(point => {
                if (point.outElement) {
                    if (point.followingCursor) {
                        Drawing.bezierConnect(
                            elementCenter(point.outElement),
                            mouse,
                        );
                    } else if (point.inElement) {
                        Drawing.bezierConnectElement(
                            point.outElement,
                            point.inElement,
                        );
                    };
                }
            });
        });
    });
});
const stage = ref<HTMLCanvasElement | null>(null);
const windowState = ref<Record<WindowType, boolean>>({
    node: false,
    world: false,
    asset: false,
    project: false,
});
const editorState = ref<EditorState>({
    selectedNodeType: 0,
});
const project = ref<ProjectData>({
    name: "Unnamed Project",
    nodes: [],
    characters: ["A", "B", "C"],
    feelings: ["开心", "难过", "生气", "无感"],
    assets: [],
    scripts: [],
});
const mouse: Vector = Vector.ZERO;
window.addEventListener("mousemove", (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
});
function openWindow(type: WindowType) {
    windowState.value[type] = true;
};
function createNode(type: NodeType) {
    const node: NodeScript = {
        id: uuid(),
        position: Vector.ZERO,
        type,
        outPoints: [
            {
                nextId: null,
                outElement: null,
                inElement: null,
                label: "defaultPoint",
                followingCursor: false
            }
        ],
    };
    project.value.nodes.push(node);
};
</script>
<style>
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
    border: none;
    outline: none;
    transition: none;
}

body {
    overflow: hidden;
}

.script-editor {
    position: relative;
    width: 100vw;
    height: 100vh;
    left: 0;
    top: 0;
}

input,
textarea {
    background-color: rgba(0, 0, 0, 0.05);
    padding: 3px 5px;
    border-bottom: 2px solid transparent;
    transition: all .2s ease-out;
    border-radius: 5px;
}

input:hover,
input:focus,
textarea:hover,
textarea:focus {
    background-color: rgba(0, 0, 0, 0.1);
    border-bottom-color: gray;
}

.fullscreen {
    position: fixed;
    left: 0;
    top: 0;
    width: 100vw;
    height: 100vh;
}

.focus-pass {
    pointer-events: none;
}
</style>