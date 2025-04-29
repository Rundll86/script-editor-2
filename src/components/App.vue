<template>
    <div id="script-editor" class="script-editor" :class="{
        connecting: project.nodes.some(node => node.outPoints.some(point => point.followingCursor))
    }">
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
                    <div class="node-list">
                        <span class="node-name" v-for="node in project.nodes">{{ node.id }}</span>
                    </div>
                </Frame>
            </Window>
            <Window title="世界观设定" v-model:state="windowState.world">
                <OptionList title="角色列表">
                    <template #afterTitle>
                        <SquareButton @click="project.characters.push({
                            name: 'Unnamed Character',
                            feelings: feelingsObject,
                            selectingFeeling: 0,
                        })">+</SquareButton>
                    </template>
                    <OptionLabel v-for="character, index in project.characters" :key="index">
                        <input type="text" v-model="project.characters[index].name" placeholder="角色名称..." />
                        <SquareButton @click="project.characters.splice(index, 1)">🗑️</SquareButton>
                        <Deskable>
                            <template #toggler="props">
                                <SquareButton>{{ props.opening ? "▴" : "▾" }}</SquareButton>
                            </template>
                            <template #content>
                                情绪：
                                <Selector :options="project.feelings" v-model:selected="character.selectingFeeling" />
                                资源：
                                <Selector :options="project.assets.map(asset => asset.name)"
                                    v-model="character.feelings[character.selectingFeeling]" />
                            </template>
                        </Deskable>
                    </OptionLabel>
                </OptionList>
                <OptionList title="情绪种类">
                    <template #afterTitle>
                        <SquareButton @click="project.feelings.push('')">+</SquareButton>
                    </template>
                    <OptionLabel v-for="_, index in project.feelings" :key="index">
                        <input type="text" v-model="project.feelings[index]" placeholder="情绪名称..." />
                        <SquareButton @click="project.feelings.splice(index, 1)">🗑️</SquareButton>
                    </OptionLabel>
                </OptionList>
                <OptionList title="专有名词">
                    <template #afterTitle>
                        <SquareButton @click="project.nouns.push({ refer: '', calls: ['a', 'b'] })">+</SquareButton>
                    </template>
                    <OptionLabel v-for="noun, index in project.nouns" :key="index">
                        <input type="text" v-model="project.nouns[index].refer" placeholder="引用名称..." />
                        <SquareButton @click="project.nouns.splice(index, 1)">🗑️</SquareButton>
                        <Deskable>
                            <template #toggler="props">
                                <SquareButton>{{ props.opening ? "▴" : "▾" }}</SquareButton>
                            </template>
                            <template #content>
                                <SmallButton @click="noun.calls.push('')">新建别名</SmallButton>
                                <div v-for="_, index in noun.calls">
                                    别名{{ index + 1 }}:
                                    <input type="text" v-model="noun.calls[index]" placeholder="别名..." />
                                    <SquareButton @click="noun.calls.splice(index, 1)">🗑️</SquareButton>
                                </div>
                            </template>
                        </Deskable>
                    </OptionLabel>
                </OptionList>
            </Window>
            <Window title="资源管理" v-model:state="windowState.asset">
                <OptionList title="图像">
                    <template #afterTitle>
                        <SquareButton @click="project.assets.push({
                            name: 'Unnamed Image',
                            type: 'image',
                            data: null
                        })">+</SquareButton>
                    </template>
                    <OptionLabel v-for="image, index in images" :key="index">
                        <AssetBar v-model:data="images[index]"
                            @delete="project.assets.splice(project.assets.indexOf(image), 1)" />
                    </OptionLabel>
                    <span v-if="images.length === 0">没有上传任何图像！</span>
                </OptionList>
                <OptionList title="视频">
                    <template #afterTitle>
                        <SquareButton @click="project.assets.push({
                            name: 'Unnamed Video',
                            type: 'video',
                            data: null
                        })">+</SquareButton>
                    </template>
                    <OptionLabel v-for="video, index in videos" :key="index">
                        <AssetBar v-model:data="videos[index]"
                            @delete="project.assets.splice(project.assets.indexOf(video), 1)" />
                    </OptionLabel>
                    <span v-if="videos.length === 0">没有上传任何视频！</span>
                </OptionList>
                <OptionList title="脚本">
                    <template #afterTitle>
                        <SquareButton @click="project.assets.push({
                            name: 'Unnamed Script',
                            type: 'script',
                            data: null
                        })">+</SquareButton>
                    </template>
                    <OptionLabel v-for="script, index in scripts" :key="index">
                        <AssetBar v-model:data="scripts[index]"
                            @delete="project.assets.splice(project.assets.indexOf(script), 1)" />
                    </OptionLabel>
                    <span v-if="scripts.length === 0">没有定义任何脚本！</span>
                </OptionList>
            </Window>
        </Layer>
        <div v-for="message, index in editorState.messages" class="message" :class="{
            info: message.type === 'info',
            warn: message.type === 'warn',
            error: message.type === 'error'
        }" @animationend="deleteSelfMessage(index)">
            {{ message.data }}
        </div>
    </div>
</template>
<script setup lang="ts">
import { Vector, nodeTypes, nodeTypeNames, type EditorState, type NodeScript, type NodeType, type ProjectData, type WindowType, type MessageType } from '@/structs';
import { computed, onMounted, ref } from 'vue';
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
import Deskable from './Deskable.vue';
import SmallButton from './SmallButton.vue';
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
    messages: []
});
const project = ref<ProjectData>({
    name: "Unnamed Project",
    nodes: [],
    characters: [],
    feelings: ["开心", "难过", "生气", "无感"],
    nouns: [
        {
            refer: "orange",
            calls: [
                "橘子",
                "柑子",
                "柑橘",
                "橘柑"
            ]
        },
        {
            refer: "apple",
            calls: [
                "苹果",
                "智慧果",
                "林檎",
                "超凡子"
            ]
        }
    ],
    assets: [],
    scripts: [],
});
const images = computed(() => {
    return project.value.assets.filter(e => e.type === 'image');
});
const videos = computed(() => {
    return project.value.assets.filter(e => e.type === 'video');
});
const scripts = computed(() => {
    return project.value.assets.filter(e => e.type === 'script');
});
const feelingsObject = computed(() => {
    return project.value.feelings.reduce((data, _, i) => {
        data[i] = 0;
        return data;
    }, {} as Record<number, 0>);
});
const mouse: Vector = Vector.ZERO;
window.addEventListener("mousemove", (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
});
project.value.characters.push({
    name: "CharacterA",
    feelings: feelingsObject.value,
    selectingFeeling: 0
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
function deleteSelfMessage(index: number) {
    editorState.value.messages.splice(index, 1);
};
function showMessage(type: MessageType, data: string) {
    editorState.value.messages.push({ type, data });
};
Object.defineProperty(window, "msg", { value: showMessage });
Object.defineProperty(window, "project", { value: project });
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

.script-editor.connecting {
    cursor: crosshair !important;
}

input,
textarea {
    background-color: rgba(0, 0, 0, 0.05);
    padding: 3px 5px;
    border-bottom: 2px solid transparent;
    transition: background-color .2s ease-out, border-bottom-color .2s ease-out;
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

.node-list {
    display: flex;
    flex-direction: column;
}

.node-name {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    display: inline-block;
    width: 220px;
}

@keyframes overAndOut {
    0% {
        transform: translateX(-50%) translateY(-100%);
        opacity: 0;
    }

    5% {
        transform: translateX(-50%) translateY(0);
        opacity: 1;
    }

    95% {
        transform: translateX(-50%) translateY(0);
        opacity: 1;
    }

    100% {
        transform: translateX(-50%) translateY(100%);
        opacity: 0;
    }
}

.message {
    border-radius: 5px;
    padding: 3px 6px;
    color: white;
    animation: overAndOut 5s ease-out forwards;
    position: fixed;
    left: 50%;
    top: 50px;
    min-width: 200px;
    text-align: center;
}

.message.info {
    background-color: green;
}

.message.warn {
    background-color: orange;
}

.message.error {
    background-color: red;
}
</style>