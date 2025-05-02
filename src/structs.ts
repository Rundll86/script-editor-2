export type WindowType = "node" | "world" | "asset" | "project" | "variable" | "about";
export const nodeTypes = ["talk", "select", "media", "script", "logic"] as const;
export const nodeTypeNames = ["对话", "选择", "展示媒体", "执行脚本", "逻辑分支"];
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
export interface LogicPart {
    useVariable: boolean;
    data: string | number;
}
export const logicTypes = ["<", "=", ">", "(regexp)="];
export const logicTypeNames = ["小于", "等于", "大于", "正则匹配"];
export type LogicType = typeof logicTypes[number];
export interface LogicBranch {
    type: number;
    args: LogicPart[];
}
export interface NodeScript {
    id: string;
    position: Vector;
    outPoints: OutPoint[];
    type: NodeType;
    branches: LogicBranch[];
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
export interface Asset {
    name: string;
    type: AssetType;
    data: string | ArrayBuffer | null;
}
export interface Character {
    name: string;
    feelings: Record<number, number>;
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
}