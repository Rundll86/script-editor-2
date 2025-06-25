<template>
    <div id="script-editor" class="script-editor" :class="{
        connecting: project.nodes.some(node => node.outPoints.some(point => point.followingCursor))
    }">
        <title>剧本编辑器 - v2{{ window.isDesktop ? "(D)" : "" }}</title>
        <StaticLayer :priority="-1">
            <DraggableContainer region-style="grab" region-drag-style="grabbing" v-model:x="editorState.workspace.x"
                v-model:y="editorState.workspace.y">
                <div class="fullscreen" data-region="true"></div>
                <NodeFrame :class="{ following: editorState.cursorFollowingIndex === index }" :editor="editorState"
                    v-for="node, index in project.nodes" :key="node.id"
                    @delete="window.keyboard.shift ? deleteNodeAndChildren(index) : deleteNode(index)"
                    @play="editorState.playWith = node.id" :data="node" :project="project" :settings="settings"
                    @mousedown="moveNodeToFirst(index)" />
                <canvas ref="stage" class="fullscreen focus-pass"></canvas>
            </DraggableContainer>
        </StaticLayer>
        <NavBar :editorState="editorState" />
        <StaticLayer :priority="0">
            <div :key="target" v-for="target in orders" class="bus">
                <SubWindow v-if="target === 'node'" :id="'node'" title="节点管理">
                    <ContainerFrame title="新建节点">
                        选择一个节点类型：
                        <SelectBar :options="nodeTypeNames" v-model:selected="editorState.selectedNodeType" /><br>
                        <WideButton superwide @click="createNode(nodeTypes[editorState.selectedNodeType])">
                            新建
                        </WideButton>
                    </ContainerFrame>
                    <ContainerFrame title="节点列表">
                        <div class="node-list">
                            <span class="node-name" :key="index" v-for="node, index in project.nodes">
                                {{ node.id }}
                            </span>
                        </div>
                    </ContainerFrame>
                </SubWindow>
                <SubWindow v-else-if="target === 'world'" :id="'world'" title="世界观设定">
                    <OptionList title="角色列表">
                        <template #afterTitle>
                            <SquareButton @click="project.characters.push(new Character('', feelingsObject()))">
                                +
                            </SquareButton>
                        </template>
                        <OptionLabel v-for="character, index in project.characters" :key="index">
                            <input type="text" v-model="project.characters[index].name" placeholder="角色名称..." />
                            <SquareButton @click="project.characters.splice(index, 1)">🗑️</SquareButton>
                            <DeskableContainer>
                                <template #toggler="props">
                                    <SquareButton>{{ props.opening ? "▴" : "▾" }}</SquareButton>
                                </template>
                                <template #content>
                                    情绪：
                                    <SelectBar :options="project.feelings"
                                        v-model:selected="character.selectingFeeling" />
                                    资源：
                                    <AssetSelector :project="project" :filter="['image']"
                                        v-model:selected="character.feelings[character.selectingFeeling]" />
                                </template>
                            </DeskableContainer>
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
                            <DeskableContainer>
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
                            </DeskableContainer>
                        </OptionLabel>
                    </OptionList>
                </SubWindow>
                <SubWindow v-else-if="target === 'asset'" :id="'asset'" title="资源管理">
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
                </SubWindow>
                <SubWindow v-else-if="target === 'variable'" :id="'variable'" title="变量">
                    <ContainerFrame title="创建变量" class="centerbox">
                        变量名：
                        <input type="text" v-model="editorState.varName" placeholder="Variable...."><br>
                        数据类型▹
                        <SelectBar class="margin5" :options="variableTypeNames"
                            v-model:selected="editorState.varType" />
                        <br>
                        <WideButton @click="createVariable">确定</WideButton>
                    </ContainerFrame>
                    <OptionList title="变量列表">
                        <OptionLabel :key="index" v-for="vari, index in project.variables">
                            <input type="text" v-model="vari.name">
                            ▸
                            <SelectBar :options="variableTypeNames" v-model:selected="vari.type" />
                            <DeskableContainer>
                                <template #toggler="props">
                                    <SquareButton>{{ props.opening ? "▴" : "▾" }}</SquareButton>
                                </template>
                                <template #content>
                                    初始值：
                                    <input type="text" v-model="vari.value">
                                </template>
                            </DeskableContainer>
                        </OptionLabel>
                    </OptionList>
                </SubWindow>
                <SubWindow v-else-if="target === 'about'" :id="'about'" title="关于">
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
                        <MemberFrame name="FallingShrimp" alias="陨落基围虾" website="https://rundll86.github.io" />
                        <MemberFrame name="Dr-Shrimp" alias="希利普医生" website="https://rundll86.github.io" />
                        <MemberFrame with-border name="TangDo158" alias="唐豆"
                            website="https://www.ccw.site/student/6107cafb76415b2f27e0d4d4" />
                        <MemberFrame name="Tin-Dunwi" alias="冬薇"
                            website="https://www.ccw.site/student/6107cafb76415b2f27e0d4d4" />
                        <MemberFrame name="Cyberexplorer" alias="赛博猫猫"
                            website="https://www.ccw.site/student/6107cafb76415b2f27e0d4d4" />
                        <ContainerFrame style="width: fit-content;" title="调试菜单"
                            v-if="settings.showDebugMenu || window.isDevelopment">
                            <SmallButton @click="rebuildNodeConnection">强制重建节点连接</SmallButton>
                        </ContainerFrame>
                    </div>
                </SubWindow>
                <SubWindow v-else-if="target === 'project'" :id="'project'" title="项目">
                    <ContainerFrame title="基本">
                        <LeftRightAlign>
                            <template #left>
                                项目名称
                            </template>
                            <template #right>
                                <input type="text" v-model="project.name">
                            </template>
                        </LeftRightAlign>
                        <LeftRightAlign>
                            <template #left>
                                储存编辑器状态？
                            </template>
                            <template #right>
                                <Checkbox v-model="project.saveEditorState" />
                            </template>
                        </LeftRightAlign>
                        <WideButton superwide @click="saveProject">保存</WideButton><br>
                        <WideButton superwide @click="loadProject">加载</WideButton>
                    </ContainerFrame>
                    <ContainerFrame title="编译菜单">
                        <LeftRightAlign>
                            <template #left>
                                输出格式
                            </template>
                            <template #right>
                                <SelectBar :options="['Binary', 'Base64']"
                                    v-model:selected="editorState.exporter.outputFormat" />
                            </template>
                        </LeftRightAlign>
                        <LeftRightAlign>
                            <template #left>
                                包含完整数据？
                            </template>
                            <template #right>
                                <Checkbox v-model="editorState.exporter.fullExporting" />
                            </template>
                        </LeftRightAlign>
                        <LeftRightAlign>
                            <template #left>
                                是否加密？
                            </template>
                            <template #right>
                                <Checkbox v-model="editorState.exporter.encryption" />
                            </template>
                        </LeftRightAlign>
                        <LeftRightAlign v-if="editorState.exporter.encryption">
                            <template #left>
                                密码
                            </template>
                            <template #right>
                                <input type="password" placeholder="不可为空" v-model="editorState.exporter.password">
                            </template>
                        </LeftRightAlign>
                        <WideButton superwide @click="downloadFile(compile(), `${project.name}.script`);">
                            开始编译
                        </WideButton>
                    </ContainerFrame>
                </SubWindow>
                <SubWindow v-else-if="target === 'setting'" :id="'setting'" title="设置">
                    <ContainerFrame title="线条">
                        <LeftRightAlign>
                            <template #left>
                                线条绘制层
                            </template>
                            <template #right>
                                <SelectBar v-model:selected="settings.lineLayer" :options="['前景', '背景']" />
                            </template>
                        </LeftRightAlign>
                        <LeftRightAlign>
                            <template #left>
                                连线模式
                            </template>
                            <template #right>
                                <SelectBar :options="['直线', '曲线']" v-model:selected="settings.lineType" />
                            </template>
                        </LeftRightAlign>
                        <template v-if="settings.lineType === 1">
                            曲线倍率<br>
                            <RangeBar :mode="'percent'" :fix="2" :min="-1" :max="2"
                                v-model:value="settings.curveMagnification" />
                        </template>
                    </ContainerFrame>
                    <ContainerFrame title="节点">
                        <LeftRightAlign>
                            <template #left>
                                节点是否可连接到自身？
                            </template>
                            <template #right>
                                <Checkbox v-model="settings.canConnectToSelf"
                                    @update:model-value="checkNodeConnectionToSelf(project.nodes)" />
                            </template>
                        </LeftRightAlign>
                        <LeftRightAlign>
                            <template #left>
                                自动开启头像预览？
                            </template>
                            <template #right>
                                <Checkbox v-model="settings.autoPreview" />
                            </template>
                        </LeftRightAlign>
                        创建节点偏移<br>
                        <RangeBar :max="window.innerHeight * 0.8" v-model:value="settings.createNodeOffset" />
                    </ContainerFrame>
                    <ContainerFrame title="仙灵">
                        <ContainerFrame v-if="settings.currentAI === 2" title="自定义服务">
                            <LeftRightAlign>
                                <template #left>
                                    Api key
                                </template>
                                <template #right>
                                    <input v-model="settings.customApiKey">
                                </template>
                            </LeftRightAlign>
                            <LeftRightAlign>
                                <template #left>
                                    Base URL
                                </template>
                                <template #right>
                                    <input v-model="settings.customBaseUrl">
                                </template>
                            </LeftRightAlign>
                            <LeftRightAlign>
                                <template #left>
                                    模型编码
                                </template>
                                <template #right>
                                    <input v-model="settings.customModelName">
                                </template>
                            </LeftRightAlign>
                        </ContainerFrame>
                        <LeftRightAlign v-else>
                            <template #left>
                                ApiKey
                            </template>
                            <template #right>
                                <input v-if="settings.currentAI === 0" v-model="settings.zhipuApiKey">
                                <input v-else-if="settings.currentAI === 1" v-model="settings.deepseekApiKey">
                            </template>
                        </LeftRightAlign>
                        <LeftRightAlign>
                            <template #left>
                                使用模型
                            </template>
                            <template #right>
                                <SelectBar :options="['智谱清言', 'DeepSeek', '自定义']"
                                    v-model:selected="settings.currentAI" />
                            </template>
                        </LeftRightAlign>
                        <WideButton superwide @click="checkAPIKey">验证可用性</WideButton>
                    </ContainerFrame>
                    <ContainerFrame title="预览">
                        <LeftRightAlign>
                            <template #left>
                                显示尺寸信息？
                            </template>
                            <template #right>
                                <Checkbox v-model="settings.showPreviewSizeInfo" />
                            </template>
                        </LeftRightAlign>
                        <LeftRightAlign>
                            <template #left>
                                舞台尺寸
                            </template>
                            <template #right>
                                <RectArea :values="settings.showPreviewSizeInfo" v-model:value="settings.previewSize" />
                            </template>
                        </LeftRightAlign>
                    </ContainerFrame>
                    <ContainerFrame title="实验性⚠️慎用">
                        <LeftRightAlign>
                            <template #left>
                                显示调试菜单（强制）
                            </template>
                            <template #right>
                                <Checkbox v-model="settings.showDebugMenu" />
                            </template>
                        </LeftRightAlign>
                        <template v-if="window.isDesktop">
                        </template>
                        <template v-else>
                            <WideButton superwide @click="saveSettingsToCookie">将设置储存到Cookie</WideButton>
                            <WideButton superwide @click="loadSettingsFromCookie">从Cookie加载设置</WideButton>
                        </template>
                    </ContainerFrame>
                </SubWindow>
                <SubWindow v-else-if="target === 'ai'" :id="'ai'" title="向仙灵询问">
                    <textarea v-model="editorState.askingMessage" placeholder="问个问题..."
                        @keydown="askFairy"></textarea><br>
                    <SmallButton @click="clearConversation">新建对话</SmallButton>
                    <ConversationBox :data="editorState.conversation" />
                </SubWindow>
                <SubWindow v-else-if="target === 'preview'" :id="'preview'" title="预览">
                    <ContainerFrame title="预览路径">
                        <SmallButton @click="editorState.connectingPath = true">添加路径</SmallButton>
                        <ItemGroup title="点" :datas="project.pathes">
                            <template #children="{ data: path }">
                                <template v-for="pathPart in path">
                                    <NodeSelector :project="project" :editor="editorState"
                                        v-model:selected="pathPart.node" />
                                    ▶
                                    <SelectBar
                                        :options="project.nodes.find(node => node.id === pathPart.node)?.outPoints.map(point => point.label)"
                                        v-model:selected="pathPart.outIndex"></SelectBar>
                                </template>
                            </template>
                        </ItemGroup>
                    </ContainerFrame>
                    <ContainerFrame :title="`播放菜单 · ${editorState.playWith ? '运行中' : '空闲'}`"
                        style="margin-bottom: 5px;">
                        <LeftRightAlign>
                            <template #left>
                                <SmallButton @click="editorState.playWith = project.entryNode">▶ 入口节点</SmallButton>
                            </template>
                            <template #right v-if="editorState.playWith">
                                <SmallButton @click="editorState.playWith = null">⏹ 停止播放</SmallButton>
                            </template>
                        </LeftRightAlign>
                    </ContainerFrame>
                    <PreviewPlayer :project="project" :playWith="editorState.playWith" :size="settings.previewSize" />
                </SubWindow>
            </div>
        </StaticLayer>
        <div :key="message.type" v-for="message, index in editorState.messages" class="message"
            :class="{ [message.type]: true }" @animationend="deleteSelfMessage(index)">
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
} from "@/structs";
import { computed, nextTick, onMounted, ref, watch } from "vue";
import {
    arrayBufferToBase64,
    base64ToArrayBuffer,
    downloadFile,
    Drawing,
    elementCenter,
    everyFrame,
    offset,
    uploadFile,
    uuid,
    OpenAIProtocol,
    XML,
    NodeState
} from "@/tools";
import NavBar from "./NavBar.vue";
import StaticLayer from "./StaticLayer.vue";
import NodeFrame from "./NodeFrame.vue";
import SubWindow from "./SubWindow.vue";
import ContainerFrame from "./ContainerFrame.vue";
import SelectBar from "./SelectBar.vue";
import WideButton from "./WideButton.vue";
import DraggableContainer from "./DraggableContainer.vue";
import OptionLabel from "./OptionLabel.vue";
import OptionList from "./OptionList.vue";
import SquareButton from "./SquareButton.vue";
import AssetBar from "./AssetBar.vue";
import DeskableContainer from "./DeskableContainer.vue";
import SmallButton from "./SmallButton.vue";
import MemberFrame from "./MemberFrame.vue";
import Checkbox from "./CheckBox.vue";
import * as ZipJS from "@zip.js/zip.js";
import RangeBar from "./RangeBar.vue";
import ConversationBox from "./ConversationBox.vue";
import prompt from "../prompt.txt";
import LeftRightAlign from "./LeftRightAlign.vue";
import PreviewPlayer from "./PreviewPlayer.vue";
import AssetSelector from "./AssetSelector.vue";
import RectArea from "./RectArea.vue";
import NodeSelector from "./NodeSelector.vue";
import ItemGroup from "./ItemGroup.vue";
onMounted(async () => {
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
    return node;
}
function deleteSelfMessage(index: number) {
    editorState.value.messages.splice(index, 1);
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
        window.msg("info", "正在检测中...");
        if (settings.value.currentAI === 0) {
            OpenAIProtocol.assignService({ key: settings.value.zhipuApiKey });
            OpenAIProtocol.assignService(OpenAIProtocol.PresetServices.Zhipu);
            await OpenAIProtocol.syncMessage([{
                role: "user",
                content: "你好！"
            }]);
        } else if (settings.value.currentAI === 1) {
            OpenAIProtocol.assignService({ key: settings.value.deepseekApiKey });
            OpenAIProtocol.assignService(OpenAIProtocol.PresetServices.DeepSeek);
            await OpenAIProtocol.syncMessage([{
                role: "user",
                content: "你好！"
            }]);
        } else if (settings.value.currentAI === 2) {
            OpenAIProtocol.assignService({
                key: settings.value.customApiKey,
                baseUrl: settings.value.customBaseUrl,
                model: settings.value.customModelName
            });
            await OpenAIProtocol.syncMessage([{
                role: "user",
                content: "你好！"
            }]);
        }
        window.msg("info", "API 密钥校验通过！");
    } catch (e) {
        window.msg("error", e);
    }
}
function saveSettingsToCookie() {
    const expires = new Date();
    expires.setTime(expires.getTime() + 7 * 24 * 60 * 60 * 1000); // 7天过期
    document.cookie = `se_settings=${encodeURIComponent(JSON.stringify(settings.value))}; expires=${expires.toUTCString()}; path=/`;
    window.msg("info", "保存成功！");
}
function loadSettingsFromCookie() {
    const settingsCookie = document.cookie.match("(^|;)\\s*se_settings\\s*=\\s*([^;]+)");
    if (settingsCookie) {
        settings.value = JSON.parse(decodeURIComponent(settingsCookie[2]));
        window.msg("info", "加载成功！");
    }
}
async function askFairy(e: KeyboardEvent) {
    if (e.key !== "Enter") return;
    if (editorState.value.responsing) return;
    e.preventDefault();
    editorState.value.conversation.push({
        role: "user",
        content: `<user-project>${JSON.stringify(project.value)}</user-project>\n${editorState.value.askingMessage}`
    });
    editorState.value.conversation.push({
        role: "assistant",
        content: ""
    });
    editorState.value.askingMessage = "";
    editorState.value.responsing = true;
    if (settings.value.currentAI === 0) {
        OpenAIProtocol.assignService({ key: settings.value.zhipuApiKey });
        OpenAIProtocol.assignService(OpenAIProtocol.PresetServices.Zhipu);
    } else if (settings.value.currentAI === 1) {
        OpenAIProtocol.assignService({ key: settings.value.deepseekApiKey });
        OpenAIProtocol.assignService(OpenAIProtocol.PresetServices.DeepSeek);
    } else if (settings.value.currentAI === 2) {
        OpenAIProtocol.assignService({
            key: settings.value.customApiKey,
            baseUrl: settings.value.customBaseUrl,
            model: settings.value.customModelName
        });
    }
    const result = await OpenAIProtocol.streamMessage([{
        role: "system",
        content: prompt
    }, ...editorState.value.conversation], ({ finished, message }) => {
        if (finished) {
            editorState.value.responsing = false;
            return;
        } else editorState.value.conversation[editorState.value.conversation.length - 1].content += message;
    });
    const codes = XML.filter(result, "script-json");
    codes.map((e, i) => {
        const parsed: NodeScript[] = JSON.parse(e);
        return parsed.map((node, j) => {
            const result = Object.assign(createNode(node.type), node);
            result.position = new Vector(
                -editorState.value.workspace.x + 300 * (i + j),
                -editorState.value.workspace.y
            );
            return result;
        });
    });
    nextTick(rebuildNodeConnection);
}
function clearConversation() {
    editorState.value.conversation = [];
}
function checkNodeConnectionToSelf(newNodes: NodeScript[]) {
    if (!settings.value.canConnectToSelf) {
        newNodes.forEach(node => {
            node.outPoints.forEach((point) => {
                if (point.nextId === node.id) {
                    point.nextId = null;
                    point.inElement = null;
                    window.msg("warn", "节点禁止连接到自身");
                }
            });
        });
    }
}
function rebuildNodeConnection() {
    project.value.nodes.forEach(node => {
        node.outPoints.forEach((point, index) => {
            if (point.nextId) {
                point.inElement = document.querySelector(`[data-node="${point.nextId}"][data-point="in"]`);
                point.outElement = document.querySelector(`[data-node="${node.id}"][data-point="${index}"]`);
            }
        });
    });
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
function deleteNodeAndChildren(index: number) {
    const node = project.value.nodes[index];
    const children = NodeState.getChildren(node, project.value);
    children.forEach(child => deleteNodeAndChildren(project.value.nodes.indexOf(child)));
    deleteNode(project.value.nodes.indexOf(node));
}
function moveNodeToFirst(index: number) {
    const node = project.value.nodes[index];
    project.value.nodes.splice(index, 1);
    project.value.nodes.push(node);
}
window.msg = <T>(type: MessageType, data: T) => {
    editorState.value.messages.push({ type, data });
    return data;
}
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
    transition: all .2s ease-out;
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
    text-wrap: wrap !important;
}

input,
textarea {
    background-color: rgba(0, 0, 0, 0.05);
    padding: 3px 5px;
    border-bottom: 2px solid rgb(200, 200, 200);
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