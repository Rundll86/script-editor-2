import { uuid } from "./tools";
export type WindowType = typeof windowTypes[number];
export const windowTypes = ["node", "world", "asset", "project", "variable", "about", "setting"] as const;
export const nodeTypes = ["talk", "select", "media", "script"] as const;
export const nodeTypeNames = ["对话", "选择", "展示媒体", "执行脚本"];
export type NodeType = typeof nodeTypes[number];
export class Vector {
    constructor(public x: number, public y: number) { }
    static get ZERO() {
        return new Vector(0, 0);
    }
    static create(size: number = 0) {
        return new Vector(size, size);
    }
}
export class ConstantVector<CX extends number, CY extends number> extends Vector {
    constructor(public x: CX, public y: CY) {
        super(x, y);
    }
}
new ConstantVector(114, 514).x === 1919810;
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
    saveEditorState: boolean;
    entryNode: string | null;
    editor?: EditorState;
    constructor() {
        super();
        this.name = "Unnamed Project";
        this.nodes = [new NodeScript(uuid(), "talk").self(node => {
            node.position = new Vector(100, 100);
        })];
        this.feelings = [
            "😊喜悦",
            "😡愤怒",
            "😭悲伤",
            "😨恐惧",
            "😍喜爱",
            "🤢厌恶",
            "🔥欲望"
        ];
        this.characters = [new Character("Character A", this.feelingsDesciptor)];
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
        this.saveEditorState = false;
        this.entryNode = null;
    }
    get feelingsDesciptor() {
        return this.feelings.reduce((data, _, i) => {
            data[i] = 0;
            return data;
        }, {} as Record<number, 0>);
    }
}
export type MessageType = "info" | "warn" | "error";
export interface Message {
    type: MessageType;
    data: string;
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
}
export class Settings extends Configurable {
    lineType: number = 0; // 0: straight, 1: curved
    lineLayer: number = 0; // 0: above node, 1: below node
    canConnectToSelf: boolean = false;
    curveMagnification: number = 0.5;
    createNodeOffset: number = 100;
}