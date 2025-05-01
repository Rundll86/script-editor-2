export type WindowType = "node" | "world" | "asset" | "project" | "variable" | "about";
export const nodeTypes = ["talk", "select", "media", "script"] as const;
export const nodeTypeNames = ["对话", "选择", "展示媒体", "执行脚本"] as const;
export type NodeType = typeof nodeTypes[number];
export class Vector<X extends number = number, Y extends number = number> {
    constructor(public x: X, public y: Y) { }
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
export type VariableType = "string" | "number" | "boolean";
export interface VariableTypeMap {
    string: string;
    number: number;
    boolean: boolean;
}
export interface Variable<T extends VariableType = VariableType> {
    name: string;
    type: T;
    value: VariableTypeMap[T];
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
}