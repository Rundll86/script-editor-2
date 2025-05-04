export type WindowType = "node" | "world" | "asset" | "project" | "variable" | "about";
export const nodeTypes = ["talk", "select", "media", "script"] as const;
export const nodeTypeNames = ["对话", "选择", "展示媒体", "执行脚本"];
export type NodeType = typeof nodeTypes[number];
export class Vector {
    constructor(public x: number, public y: number) { }
    static get ZERO() {
        return new Vector(0, 0);
    }
}
export interface OutPoint {
    nextId: string | null;
    outElement: HTMLElement | null;
    inElement: HTMLElement | null;
    label: string;
    followingCursor: boolean;
}
export interface NodeScript {
    id: string;
    position: Vector;
    outPoints: OutPoint[];
    type: NodeType;
    talker?: number;
    message?: string;
    feeling?: number;
    assetId?: number;
}
export interface Noun {
    refer: string;
    calls: string[];
}
export type AssetType = "image" | "video" | "script";
export interface Asset<T extends AssetType = AssetType> {
    name: string;
    type: T;
    data: {
        image: ArrayBuffer;
        video: ArrayBuffer;
        script: string
    }[T] | null;
}
export interface Character {
    name: string;
    feelings: Record<string, number>;
    selectingFeeling: number;
}
export const variableTypes = ["string", "number", "boolean"] as const;
export const variableTypeNames = ["文本", "数字", "开关"];
export type VariableType = typeof variableTypes[number];
export interface Variable {
    name: string;
    type: number;
    value: string;
}
export interface ProjectData {
    name: string;
    nodes: NodeScript[];
    characters: Character[];
    feelings: string[];
    nouns: Noun[];
    assets: Asset[];
    scripts: string[];
    variables: Variable[];
    saveEditorState: boolean;
    editor?: EditorState;
}
export type MessageType = "info" | "warn" | "error";
export interface Message {
    type: MessageType;
    data: string;
}
export interface EditorState {
    selectedNodeType: number;
    messages: Message[];
    workspace: Vector;
    varName: string;
    varType: number;
    exporter: {
        fullExporting: boolean;
        outputFormat: number;
        encryption: boolean;
        password: string;
    };
}