import { limited, OpenAIProtocol } from "./tools";
export type WindowType = typeof windowTypes[number];
export const windowTypes = ["node", "world", "asset", "project", "variable", "about", "setting", "ai", "preview"] as const;
export const nodeTypes = ["talk", "select", "media", "script"] as const;
export const nodeTypeNames = ["对话", "选择", "展示媒体", "执行脚本"];
export type NodeType = typeof nodeTypes[number];
export interface NormalizedNoun {
    refer: string;
    callIndex: number;
    callName: string;
    calls: string[];
    scopePair: string;
    separator: string;
}
export class Vector {
    get width() { return this.x; }
    set width(value: number) { this.x = value; }
    get height() { return this.y; }
    set height(value: number) { this.y = value; }
    constructor(public x: number = 0, public y: number = 0) { }
    static get ZERO() {
        return new Vector(0, 0);
    }
    static create(other: Vector | number = 0) {
        return typeof other === "number" ? new Vector(other, other) : new Vector(other.x, other.y);
    }
    static limited(value: Vector, min: Vector, max: Vector) {
        return new Vector(
            limited(min.x, value.x, max.x),
            limited(min.y, value.y, max.y),
        );
    }
    static equals(a: Vector, b: Vector) {
        return a.x === b.x && a.y === b.y;
    }
    static add(a: Vector, b: Vector) {
        return new Vector(a.x + b.x, a.y + b.y);
    }
    static subtract(a: Vector, b: Vector) {
        return new Vector(a.x - b.x, a.y - b.y);
    }
    static multiply(a: Vector | number, b: Vector | number) {
        const createA = Vector.create(a);
        const createB = Vector.create(b);
        return new Vector(createA.x * createB.x, createA.y * createB.y);
    }
    static divide(a: Vector | number, b: Vector | number) {
        const createA = Vector.create(a);
        const createB = Vector.create(b);
        return new Vector(createA.x / createB.x, createA.y / createB.y);
    }
}
export class ConstantVector<CX extends number, CY extends number> extends Vector {
    constructor(public readonly x: CX, public readonly y: CY) {
        super(x, y);
    }
    static create<T extends number>(size: T) {
        return new this<T, T>(size, size);
    }
}
export class Configurable {
    self(executor: (self: this) => void) {
        executor(this);
        return this;
    }
}
export class OutPoint extends Configurable {
    nextId: string | null = null;
    outElement: HTMLElement | null = null;
    inElement: HTMLElement | null = null;
    label: string = "defaultPoint";
    followingCursor: boolean = false;
}
export class NodeScript extends Configurable {
    id: string;
    position: Vector;
    outPoints: OutPoint[];
    type: NodeType;
    talker?: number;
    message?: string;
    feeling?: number;
    assetId?: number;
    constructor(id: string, type: NodeType) {
        super();
        this.id = id;
        this.position = Vector.ZERO;
        this.outPoints = [new OutPoint()];
        this.type = type;
    }
}
export class Noun extends Configurable {
    refer: string = "";
    calls: string[] = [];
}
export type AssetType = "image" | "video" | "script";
export type AssetTypeMap<T extends AssetType = AssetType> = {
    image: ArrayBuffer;
    video: ArrayBuffer;
    script: string;
}[T];
export class Asset<T extends AssetType = AssetType> extends Configurable {
    name: string;
    type: T;
    data: AssetTypeMap<T> | null;
    constructor(name: string, type: T, data: AssetTypeMap<T> | null = null) {
        super();
        this.name = name;
        this.type = type;
        this.data = data;
    }
}
export class Character extends Configurable {
    name: string;
    feelings: Record<string, number>;
    selectingFeeling: number;
    constructor(name: string, feelings: Record<string, number>) {
        super();
        this.name = name;
        this.feelings = feelings;
        this.selectingFeeling = 0;
    }
}
export const variableTypes = ["string", "number", "boolean"] as const;
export const variableTypeNames = ["文本", "数字", "开关"];
export type VariableType = typeof variableTypes[number];
export class Variable extends Configurable {
    name: string;
    type: number;
    value: string;
    constructor(name: string, type: number, value: string = "") {
        super();
        this.name = name;
        this.type = type;
        this.value = value;
    }
}
export class ProjectData extends Configurable {
    name: string;
    nodes: NodeScript[];
    characters: Character[];
    feelings: string[];
    nouns: Noun[];
    assets: Asset[];
    scripts: string[];
    variables: Variable[];
    pathes: PreviewPath[][];
    saveEditorState: boolean;
    entryNode: string | null;
    editor?: EditorState;
    constructor() {
        super();
        this.name = "Unnamed Project";
        this.nodes = [];
        this.feelings = [
            "😊喜悦",
            "😡愤怒",
            "😭悲伤",
            "😨恐惧",
            "😍喜爱",
            "🤢厌恶",
            "🔥欲望"
        ];
        this.characters = [
            new Character("Character A", this.feelingsDescriptor),
            new Character("Character B", this.feelingsDescriptor)
        ];
        this.nouns = [
            new Noun().self(noun => { noun.refer = "apple"; noun.calls = ["苹果", "智慧果"] }),
            new Noun().self(noun => { noun.refer = "orange"; noun.calls = ["橘子", "柑橘"] }),
            new Noun().self(noun => { noun.refer = "banana"; noun.calls = ["香蕉", "弯弯果"] }),
            new Noun().self(noun => { noun.refer = "grape"; noun.calls = ["葡萄", "紫晶果"] }),
            new Noun().self(noun => { noun.refer = "watermelon"; noun.calls = ["西瓜", "夏日果"] }),
            new Noun().self(noun => { noun.refer = "strawberry"; noun.calls = ["草莓", "甜心果"] }),
            new Noun().self(noun => { noun.refer = "peach"; noun.calls = ["桃子", "仙桃"] }),
            new Noun().self(noun => { noun.refer = "cherry"; noun.calls = ["樱桃", "红宝石果"] })
        ];
        this.assets = [];
        this.scripts = [];
        this.variables = [];
        this.pathes = [
            [
                new PreviewPath(),
                new PreviewPath()
            ]
        ];
        this.saveEditorState = false;
        this.entryNode = null;
    }
    get feelingsDescriptor() {
        return Object.fromEntries(this.feelings.map((_, index) => [index, -1]));
    }
}
export type MessageType = "info" | "warn" | "error";
export interface Message {
    type: MessageType;
    data: unknown;
}
export class ExporterState extends Configurable {
    fullExporting: boolean = true;
    outputFormat: number = 0;
    encryption: boolean = false;
    password: string = "";
}
export class EditorState extends Configurable {
    selectedNodeType: number = 0;
    messages: Message[] = [];
    workspace: Vector = Vector.ZERO;
    varName: string = "";
    varType: number = 0;
    exporter: ExporterState = new ExporterState();
    conversation: OpenAIProtocol.MessageContext[] = [];
    askingMessage: string = "帮我写个对话";
    responsing: boolean = false;
    playWith: string | null = null;
    connectingPath: boolean = false;
    cursorFollowingIndex: number = -1; // 鼠标正悬停在<NodeSelector>上的哪个节点
}
export class Settings extends Configurable {
    lineType: number = 1; // 0: straight, 1: curved
    lineLayer: number = 0; // 0: above node, 1: below node
    canConnectToSelf: boolean = false;
    curveMagnification: number = 0.5;
    createNodeOffset: number = 100;
    zhipuApiKey: string = "";
    deepseekApiKey: string = "";
    customApiKey: string = "";
    customBaseUrl: string = "";
    customModelName: string = "";
    currentAI: number = 0; // 0: zhipu, 1: deepseek, 2: custom
    autoPreview: boolean = false;
    showDebugMenu: boolean = false;
    previewSize: Vector = new Vector(640, 480);
    showPreviewSizeInfo: boolean = false;
}
export class PreviewPath {
    constructor(public node: string = "", public outIndex: number = 0) { }
}