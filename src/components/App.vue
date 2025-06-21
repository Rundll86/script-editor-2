<template>
    <div id="script-editor" class="script-editor" :class="{
        connecting: project.nodes.some(node => node.outPoints.some(point => point.followingCursor))
    }">
        <Layer :priority="-1">
            <Draggable region-style="grab" region-drag-style="grabbing" v-model:x="editorState.workspace.x"
                v-model:y="editorState.workspace.y">
                <div class="fullscreen" data-region="true"></div>
                <Node v-for="node, index in project.nodes" :key="node.id" @delete="deleteNode(index)" :data="node"
                    :project="project" :settings="settings" @mousedown="moveNodeToFirst(index)" />
                <canvas ref="stage" class="fullscreen focus-pass"></canvas>
            </Draggable>
        </Layer>
        <Navbar />
        <Layer :priority="0">
            <div :key="target" v-for="target in orders" class="bus">
                <Window v-if="target === 'node'" :id="'node'" title="节点管理">
                    <Frame title="新建节点">
                        选择一个节点类型：
                        <Selector :options="nodeTypeNames" v-model:selected="editorState.selectedNodeType" /><br>
                        <WideButton superwide @click="createNode(nodeTypes[editorState.selectedNodeType])">
                            新建
                        </WideButton>
                    </Frame>
                    <Frame title="节点列表">
                        <div class="node-list">
                            <span class="node-name" :key="index" v-for="node, index in project.nodes">
                                {{ node.id }}
                            </span>
                        </div>
                    </Frame>
                </Window>
                <Window v-else-if="target === 'world'" :id="'world'" title="世界观设定">
                    <OptionList title="角色列表">
                        <template #afterTitle>
                            <SquareButton @click="project.characters.push(new Character('', feelingsObject()))">+
                            </SquareButton>
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
                                    <Selector :options="project.feelings"
                                        v-model:selected="character.selectingFeeling" />
                                    资源：
                                    <Selector :options="project.assets.map(asset => asset.name)"
                                        v-model:selected="character.feelings[character.selectingFeeling]" />
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
                            <SquareButton @click="project.nouns.push(new Noun())">+
                            </SquareButton>
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
                                    <div :key="index" v-for="_, index in noun.calls">
                                        别名{{ index + 1 }}:
                                        <input type="text" v-model="noun.calls[index]" placeholder="别名..." />
                                        <SquareButton @click="noun.calls.splice(index, 1)">🗑️</SquareButton>
                                    </div>
                                </template>
                            </Deskable>
                        </OptionLabel>
                    </OptionList>
                </Window>
                <Window v-else-if="target === 'asset'" :id="'asset'" title="资源管理">
                    <OptionList title="图像">
                        <template #afterTitle>
                            <SquareButton @click="createImage">+</SquareButton>
                        </template>
                        <OptionLabel v-for="image, index in images" :key="index">
                            <AssetBar v-model:data="images[index]"
                                @delete="project.assets.splice(project.assets.indexOf(image), 1)" />
                        </OptionLabel>
                        <span v-if="images.length === 0">没有上传任何图像！</span>
                    </OptionList>
                    <OptionList title="视频">
                        <template #afterTitle>
                            <SquareButton @click="createVideo">+</SquareButton>
                        </template>
                        <OptionLabel v-for="video, index in videos" :key="index">
                            <AssetBar v-model:data="videos[index]"
                                @delete="project.assets.splice(project.assets.indexOf(video), 1)" />
                        </OptionLabel>
                        <span v-if="videos.length === 0">没有上传任何视频！</span>
                    </OptionList>
                    <OptionList title="脚本">
                        <template #afterTitle>
                            <SquareButton @click="project.assets.push(new Asset('', 'script'))">+</SquareButton>
                        </template>
                        <OptionLabel v-for="script, index in scripts" :key="index">
                            <AssetBar v-model:data="scripts[index]"
                                @delete="project.assets.splice(project.assets.indexOf(script), 1)" />
                        </OptionLabel>
                        <span v-if="scripts.length === 0">没有定义任何脚本！</span>
                    </OptionList>
                </Window>
                <Window v-else-if="target === 'variable'" :id="'variable'" title="变量">
                    <Frame title="创建变量" class="centerbox">
                        变量名：
                        <input type="text" v-model="editorState.varName" placeholder="Variable...."><br>
                        数据类型▹
                        <Selector class="margin5" :options="variableTypeNames" v-model:selected="editorState.varType" />
                        <br>
                        <WideButton @click="createVariable">确定</WideButton>
                    </Frame>
                    <OptionList title="变量列表">
                        <OptionLabel :key="index" v-for="vari, index in project.variables">
                            <input type="text" v-model="vari.name">
                            ▸
                            <Selector :options="variableTypeNames" v-model:selected="vari.type" />
                            <Deskable>
                                <template #toggler="props">
                                    <SquareButton>{{ props.opening ? "▴" : "▾" }}</SquareButton>
                                </template>
                                <template #content>
                                    初始值：
                                    <input type="text" v-model="vari.value">
                                </template>
                            </Deskable>
                        </OptionLabel>
                    </OptionList>
                </Window>
                <Window v-else-if="target === 'about'" :id="'about'" title="关于">
                    <div class="centerbox">
                        ScriptEditor是一个基于界面的RPG/AVG游戏剧本设计器。<br>
                        <div class="inline-right margin5">
                            技术栈<br>
                            开源许可<br>
                            仓库
                        </div>
                        <div class="inline-left margin5">
                            <b>Vue+Webpack</b><br>
                            <b>MIT</b><br>
                            <a href="https://github.com/Rundll86/script-editor-2" target="_blank">
                                <b>Github</b>
                            </a>
                        </div><br>
                        <span class="thanks">特别鸣谢</span><br>
                        <Member name="FallingShrimp" alias="陨落基围虾" website="https://rundll86.github.io" />
                        <Member name="Dr-Shrimp" alias="希利普医生" website="https://rundll86.github.io" />
                        <Member with-border name="TangDo158" alias="唐豆"
                            website="https://www.ccw.site/student/6107cafb76415b2f27e0d4d4" />
                        <Member name="Tin-Dunwi" alias="冬薇"
                            website="https://www.ccw.site/student/6107cafb76415b2f27e0d4d4" />
                        <Member name="Cyberexplorer" alias="赛博猫猫"
                            website="https://www.ccw.site/student/6107cafb76415b2f27e0d4d4" />
                    </div>
                </Window>
                <Window v-else-if="target === 'project'" :id="'project'" title="项目">
                    项目名称：
                    <input type="text" v-model="project.name"><br>
                    储存编辑器状态？
                    <Checkbox v-model="project.saveEditorState" />
                    <WideButton superwide @click="saveProject">保存</WideButton><br>
                    <WideButton superwide @click="loadProject">加载</WideButton>
                    <Frame title="编译菜单">
                        包含完整数据？
                        <Checkbox v-model="editorState.exporter.fullExporting" /><br>
                        输出格式：
                        <Selector :options="['二进制', 'Base64']" v-model:selected="editorState.exporter.outputFormat" />
                        <br>
                        是否加密？
                        <Checkbox v-model="editorState.exporter.encryption" />
                        <input type="password" v-if="editorState.exporter.encryption" placeholder="密码..."
                            v-model="editorState.exporter.password"><br>
                        <div class="text-right">
                            <WideButton style="margin: 0;" @click="downloadFile(compile(), `${project.name}.script`);">
                                开始编译
                            </WideButton>
                        </div>
                    </Frame>
                </Window>
                <Window v-else-if="target === 'setting'" :id="'setting'" title="设置">
                    <Frame title="线条">
                        连线模式：
                        <Selector :options="['直线', '曲线']" v-model:selected="settings.lineType" />
                        <div v-if="settings.lineType === 1">
                            曲线倍率：
                            <Ranger :mode="'percent'" :fix="2" :min="-0.5" :max="1.5"
                                v-model:value="settings.curveMagnification" />
                        </div>
                        <br v-else>
                        线条绘制层：
                        <Selector v-model:selected="settings.lineLayer" :options="['前景', '背景']" />
                    </Frame>
                    <Frame title="节点">
                        节点是否可连接到自身？
                        <Checkbox v-model="settings.canConnectToSelf"
                            @update:model-value="checkNodeConnectionToSelf(project.nodes)" />
                        <br>
                        创建节点偏移：<br>
                        <Ranger :max="window.innerHeight * 0.8" v-model:value="settings.createNodeOffset" />
                    </Frame>
                    <Frame title="AI">
                        智谱清言 API Key：
                        <input v-model="settings.apikey">
                        <SmallButton @click="checkAPIKey">验证可用性</SmallButton>
                    </Frame>
                </Window>
            </div>
        </Layer>
        <div :key="index" v-for="message, index in editorState.messages" class="message" :class="{
            info: message.type === 'info',
            warn: message.type === 'warn',
            error: message.type === 'error'
        }" @animationend="deleteSelfMessage(index)">
            {{ message.data }}
        </div>
    </div>
</template>
<script setup lang="ts">
import {
    NodeScript,
    type NodeType,
    type WindowType,
    type MessageType,
    Variable
} from "@/structs";
import {
    Vector,
    nodeTypes,
    nodeTypeNames,
    EditorState,
    ProjectData,
    variableTypeNames,
    Settings,
    windowTypes,
    Character,
    Noun,
    Asset
} from '@/structs';
import { computed, nextTick, onMounted, ref, watch } from 'vue';
import {
    arrayBufferToBase64,
    base64ToArrayBuffer,
    downloadFile,
    Drawing,
    elementCenter,
    everyFrame, offset,
    uploadFile,
    uuid
} from '@/tools';
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
import Member from './Member.vue';
import Checkbox from './CheckBox.vue';
import * as ZipJS from "@zip.js/zip.js";
import Ranger from "./Ranger.vue";
import { ZhipuAI } from "zhipuai";
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
                        superConnect(elementCenter(point.outElement), mouse);
                    } else if (point.inElement && point.nextId) {
                        superConnectElement(point.outElement, point.inElement);
                    };
                }
            });
        });
    });
});
const stage = ref<HTMLCanvasElement | null>(null);
const orders = ref<WindowType[]>([]);
const positions = ref<Record<WindowType, Vector>>(windowTypes.reduce((data, type) => {
    data[type] = Vector.ZERO;
    return data;
}, {} as Record<WindowType, Vector>));
const draggings = ref<Record<WindowType, boolean>>(windowTypes.reduce((data, type) => {
    data[type] = false;
    return data;
}, {} as Record<WindowType, boolean>));
const editorState = ref(new EditorState());
const settings = ref(new Settings());
const project = ref(new ProjectData());
const images = computed(() => {
    return project.value.assets.filter(e => e.type === "image");
});
const videos = computed(() => {
    return project.value.assets.filter(e => e.type === "video");
});
const scripts = computed(() => {
    return project.value.assets.filter(e => e.type === "script");
});
const feelingsObject = () => {
    return project.value.feelings.reduce((data, _, i) => {
        data[i] = 0;
        return data;
    }, {} as Record<number, 0>);
};
const mouse: Vector = Vector.ZERO;
window.addEventListener("mousemove", (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
});
function superConnect(point1: Vector, point2: Vector) {
    const func = settings.value.lineType === 0 ? Drawing.straightConnect : Drawing.bezierConnect;
    func(point1, point2);
}
function superConnectElement(element1: HTMLElement, element2: HTMLElement) {
    const func = settings.value.lineType === 0 ? Drawing.straightConnectElement : Drawing.bezierConnectElement;
    func(element1, element2,);
}
function createNode(type: NodeType) {
    const node: NodeScript = new NodeScript(uuid(), type);
    node.position = new Vector(offset(settings.value.createNodeOffset), offset(settings.value.createNodeOffset));
    project.value.nodes.push(node);
}
function deleteSelfMessage(index: number) {
    editorState.value.messages.splice(index, 1);
}
function showMessage(type: MessageType, data: string) {
    editorState.value.messages.push({ type, data });
}
async function createImage() {
    const files = await uploadFile("image/*", false);
    files.forEach(file => {
        project.value.assets.push(new Asset(file.filename, "image", file));
    });
}
async function createVideo() {
    const files = await uploadFile("video/*", false);
    files.forEach(file => {
        project.value.assets.push(new Asset(file.filename, "video", file));
    });
}
async function createVariable() {
    project.value.variables.push(new Variable("", 0));
    editorState.value.varName = "";
}
async function saveData() {
    if (project.value.saveEditorState) {
        project.value.editor = editorState.value;
    } else {
        delete project.value.editor;
    }
    const sanitizedProject = JSON.parse(JSON.stringify(project.value, (key, value) => {
        if (["inElement", "outElement", "followingCursor", "selectingFeeling"].includes(key)) {
            return undefined;
        } else if (value instanceof ArrayBuffer) {
            const b64 = arrayBufferToBase64(value);
            return b64;
        }
        return value;
    }));
    return await new Blob([btoa(encodeURIComponent(JSON.stringify(sanitizedProject)))]).arrayBuffer();
}
async function saveProject() {
    downloadFile(await saveData(), `${project.value.name}.ssp`);
}
async function loadProject() {
    const file = await uploadFile("*.ssp") ?? undefined;
    const data: ProjectData = JSON.parse(decodeURIComponent(atob(new TextDecoder().decode(file))));
    data.assets.forEach(asset => {
        if (asset.data && typeof asset.data === "string") {
            asset.data = base64ToArrayBuffer(asset.data);
        }
    });
    if (data.saveEditorState && data.editor) {
        editorState.value = data.editor;
    }
    project.value = data;
    nextTick(() => {
        project.value.nodes.forEach(node => node.outPoints.forEach((point, index) => {
            point.outElement = document.querySelector(`[data-node="${node.id}"][data-point="${index}"]`);
            point.inElement = document.querySelector(`[data-node="${point.nextId}"][data-point="in"]`);
        }));
    });
}
async function compile() {
    const outputer = new ZipJS.ZipWriter(
        new ZipJS.BlobWriter("application/zip"),
        editorState.value.exporter.encryption ? { password: editorState.value.exporter.password } : undefined
    );
    const { value: projectData } = project;
    projectData.nodes.forEach(node => {
        let text = "";
        text += node.type + "\n";
        text += node.talker + "\n";
        text += node.message + "\n";
        text += node.feeling + "\n";
        text += node.assetId + "\n";
        text += node.outPoints.map(point => `${point.label}:${point.nextId}` as const).join(",") + "\n";
        outputer.add(`${node.id}${node.id === projectData.entryNode ? ".entry" : ""}.node`, new ZipJS.TextReader(text));
    });
    projectData.characters.forEach((character, index) => {
        let text = "";
        text += character.name + "\n";
        text += Object.keys(character.feelings).map(key => `${key}:${character.feelings[key]}`).join(",");
        outputer.add(`${index}.character`, new ZipJS.TextReader(text));
    });
    projectData.feelings.forEach((feeling, index) => {
        outputer.add(`${index}.feeling`, new ZipJS.TextReader(feeling));
    });
    projectData.assets.forEach((asset, index) => {
        if (asset.data instanceof ArrayBuffer && asset.type === "video" || asset.type === "image") {
            outputer.add(`${index}.${asset.type}`, new ZipJS.BlobReader(new Blob([(asset.data ?? new TextEncoder().encode("").buffer) as ArrayBuffer])));
        } else if (asset.type === "script") {
            console.log("..");
            outputer.add(`${index}.${asset.type}`, new ZipJS.TextReader(asset.name));
        } else {
            window.msg("error", `Unknown asset type: ${asset.type}`);
        }
    });
    projectData.nouns.forEach(noun => {
        outputer.add(`${noun.refer}.noun`, new ZipJS.TextReader(noun.calls.join("\n")));
    });
    const buffer = await outputer.close();
    const arrayBuffer = await buffer.arrayBuffer();
    if (editorState.value.exporter.outputFormat === 1) return arrayBufferToBase64(arrayBuffer);
    else return arrayBuffer;
}
async function checkAPIKey() {
    try {
        const response = await fetch("https://open.bigmodel.cn/api/paas/v4/chat/completions", {
            headers: {
                "Authorization": `Bearer ${settings.value.apikey}`,
                "Content-Type": "application/json"
            },
            method: "post",
            body: JSON.stringify({
                messages: [
                    {
                        role: "user",
                        content: "你好"
                    }
                ],
                model: "glm-4-flash-250414"
            })
        }).then((res) => res.json());
        if (response.error) {
            window.msg("error", `${response.error.code}：${response.error.message}`);
        } else {
            window.msg("info", "API Key验证成功！");
        }
    } catch (error) { }
}
function checkNodeConnectionToSelf(newNodes: NodeScript[]) {
    if (!settings.value.canConnectToSelf) {
        newNodes.forEach(node => {
            node.outPoints.forEach((point) => {
                if (point.nextId === node.id) {
                    point.nextId = null;
                    point.inElement = null;
                    showMessage("warn", "节点禁止连接到自身");
                }
            });
        });
    }
}
function deleteNode(index: number) {
    const nodeId = project.value.nodes[index].id;
    project.value.nodes.splice(index, 1);
    project.value.nodes.forEach(node => {
        node.outPoints.forEach(point => {
            if (point.nextId === nodeId) {
                point.nextId = null;
                point.inElement = null;
                point.outElement = null;
            }
        });
    });
}
function moveNodeToFirst(index: number) {
    const node = project.value.nodes[index];
    project.value.nodes.splice(index, 1);
    project.value.nodes.push(node);
}
window.msg = showMessage;
window.project = project;
window.settings = settings;
window.state = editorState;
window.windowOrders = orders;
window.windowPositions = positions;
window.windowDraggings = draggings;
window.openWindow = (type: WindowType) => {
    if (orders.value.includes(type)) return;
    orders.value.push(type);
};
window.closeWindow = (type: WindowType) => {
    const index = orders.value.indexOf(type);
    if (index === -1) return;
    orders.value.splice(index, 1);
};
window.moveToTop = (type: WindowType) => {
    const index = orders.value.indexOf(type);
    if (index === -1) return;
    orders.value.splice(index, 1);
    orders.value.push(type);
};
window.dragToZero = (type: WindowType) => {
    positions.value[type] = Vector.ZERO;
};
watch(() => project.value.nodes, checkNodeConnectionToSelf, { deep: true });
watch(settings, (newV) => {
    Drawing.setOffsetMulitplier(newV.curveMagnification);
}, { deep: true });
</script>
<style>
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
    border: none;
    outline: none;
    transition: none;
    font-family: '微软雅黑';
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

textarea {
    text-wrap-mode: wrap !important;
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

.centerbox {
    text-align: center;
}

.inline-left {
    text-align: left;
    display: inline-block;
}

.inline-right {
    text-align: right;
    display: inline-block;
}

.text-right {
    text-align: right;
}

.margin5 {
    margin: 5px;
}

.margin5-left {
    margin-left: 5px;
}

.margin-auto-left {
    margin-left: auto !important;
}

.thanks {
    font-size: 18px;
    margin-top: 10px;
    display: inline-block;
}

button {
    cursor: pointer;
}

a:link,
a:visited {
    color: black;
    text-decoration: none;
}

a:hover {
    color: gray;
    text-decoration: none;
}

a:active {
    color: gray;
    text-decoration: underline;
}

.text-button {
    cursor: pointer;
    color: black;
    text-decoration: none;
}

.text-button:hover {
    color: gray;
    text-decoration: underline;
}

.text-button:active {
    color: gray;
    text-decoration: none;
}

.underlined {
    text-decoration: underline;
}

.bolded {
    font-weight: bold;
}

.sized {
    width: 100px;
    height: 100px;
    position: relative;
}

.left-top {
    position: absolute;
    left: 10px;
    top: 10px;
}

.right-bottom {
    position: absolute;
    right: 10px;
    bottom: 10px;
}
</style>