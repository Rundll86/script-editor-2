export type WindowType = "node" | "world" | "asset" | "project";
export const nodeTypes = ["talk", "select", "media", "script"] as const;
export const nodeTypeNames = ["对话", "选择", "展示媒体", "执行脚本"] as const;
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
export interface ProjectData {
    name: string;
    nodes: NodeScript[];
    characters: Character[];
    feelings: string[];
    nouns: Noun[];
    assets: Asset[];
    scripts: string[];
}
export type MessageType = "info" | "warn" | "error";
export interface Message {
    type: MessageType;
    data: string;
}
export interface EditorState {
    selectedNodeType: number;
    messages: Message[];
}