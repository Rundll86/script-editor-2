export type WindowType = "node" | "world" | "asset" | "project" | "variable" | "about" | "setting";
export const nodeTypes = ["talk", "select", "media", "script"] as const;
export const nodeTypeNames = ["对话", "选择", "展示媒体", "执行脚本"];
export type NodeType = typeof nodeTypes[number];
export class Vector {
    constructor(public x: number, public y: number) { }
    static get ZERO() {
        return new Vector(0, 0);
    }
}
export class OutPoint {
    nextId: string | null = null;
    outElement: HTMLElement | null = null;
    inElement: HTMLElement | null = null;
    label: string = "defaultPoint";
    followingCursor: boolean = false;
}
export class NodeScript {
    id: string;
    position: Vector;
    outPoints: OutPoint[];
    type: NodeType;
    talker?: number;
    message?: string;
    feeling?: number;
    assetId?: number;
    constructor(id: string, type: NodeType) {
        this.id = id;
        this.position = Vector.ZERO;
        this.outPoints = [new OutPoint()];
        this.type = type;
    }
}
export class Noun {
    refer: string = "";
    calls: string[];
    constructor() {
        this.calls = [];
    }
}
export type AssetType = "image" | "video" | "script";

export type AssetTypeMap<T extends AssetType = AssetType> = {
    image: ArrayBuffer;
    video: ArrayBuffer;
    script: string;
}[T];

export class Asset<T extends AssetType = AssetType> {
    name: string;
    type: T;
    data: AssetTypeMap<T> | null;
    constructor(name: string, type: T, data: AssetTypeMap<T> | null = null) {
        this.name = name;
        this.type = type;
        this.data = data;
    }
}
export class Character {
    name: string;
    feelings: Record<string, number>;
    selectingFeeling: number;
    constructor(name: string, feelings: Record<string, number>) {
        this.name = name;
        this.feelings = feelings;
        this.selectingFeeling = 0;
    }
}
export const variableTypes = ["string", "number", "boolean"] as const;
export const variableTypeNames = ["文本", "数字", "开关"];
export type VariableType = typeof variableTypes[number];
export class Variable {
    name: string;
    type: number;
    value: string;
    constructor(name: string, type: number, value: string = "") {
        this.name = name;
        this.type = type;
        this.value = value;
    }
}
export class ProjectData {
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
        this.name = "Unnamed Project";
        this.nodes = [];
        this.characters = [];
        this.feelings = [];
        this.nouns = [];
        this.assets = [];
        this.scripts = [];
        this.variables = [];
        this.saveEditorState = false;
        this.entryNode = null;
    }
}
export type MessageType = "info" | "warn" | "error";
export interface Message {
    type: MessageType;
    data: string;
}
export class EditorState {
    selectedNodeType: number = 0;
    messages: Message[] = [];
    workspace: Vector = Vector.ZERO;
    varName: string = "";
    varType: number = 0;
    exporter: {
        fullExporting: boolean;
        outputFormat: number;
        encryption: boolean;
        password: string;
    };
    constructor() {
        this.exporter = {
            fullExporting: true,
            outputFormat: 0,
            encryption: false,
            password: ""
        };
    }
}
export class Settings {
    lineType: number = 0; // 0: straight, 1: curved
    canConnectToSelf: boolean = false;
}