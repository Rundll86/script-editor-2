import { BlobReader, ZipReader, Uint8ArrayWriter } from "@zip.js/zip.js";
interface Node {
    id: string;
    type: string;
    talker: number;
    message: string;
    feeling: number;
    assetId: number;
    outPoints: { label: string; nextId: string }[];
}
interface Character {
    name: string;
    feelings: Record<number, number>;
}
interface Noun {
    refer: string;
    calls: string[];
}
interface Asset {
    type: string;
    data: string | ArrayBuffer;
}
interface ProjectData {
    nodes: Node[];
    characters: Character[];
    feelings: string[];
    nouns: Noun[];
    assets: Asset[];
    entryNode: string | null;
}
function base64ToArrayBuffer(base64: string) {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const buffer = new ArrayBuffer(len);
    const uint8Array = new Uint8Array(buffer);
    for (let i = 0; i < len; i++) {
        uint8Array[i] = binaryString.charCodeAt(i);
    }
    return buffer;
}
async function readBlob(file: Blob): Promise<string> {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.addEventListener("load", () => {
            if (typeof reader.result !== "string") return;
            const buffer = reader.result;
            resolve(buffer);
        });
        reader.readAsText(file);
    });
}
export class ScriptPlayer {
    public static allowedPairs = ["$;", "[]", "{}"];
    public static allowedSeparators = ":.>%~#@→↣↝↠↣↦⇀⇏⇒⇥⇨⇢⇰⇸⇻⇾▸▹▶▷►▻";
    public static nounSpliter = new RegExp(`[${ScriptPlayer.allowedSeparators.split("").map(char => "\\" + char).join("")}]`, "g");
    public static centerd = `\\w+${ScriptPlayer.nounSpliter.source}\\s*\\d+\\s*`;
    public static nounMatcher = new RegExp(ScriptPlayer.allowedPairs.map(pair => `(\\${pair[0]}${ScriptPlayer.centerd}\\${pair[1]})`).join("|"), "g");
    public static unknownNounTip = "▸未知名词◂";
    private project?: ProjectData;
    public format<T extends keyof Node>(node: Node, key: T): Node[T] {
        if (!this.project) throw new Error("Project not loaded");
        if (key === "message") {
            return node.message.replace(ScriptPlayer.nounMatcher, match => {
                if (!this.project) throw new Error("Project not loaded");
                const data = match.slice(1, -1).split(ScriptPlayer.nounSpliter);
                const [refer, index] = [data[0].trim(), Number(data[1]) - 1];
                if (!this.project.nouns.some(nounSrc => nounSrc.refer === refer)) return match;
                return this.project.nouns.find(nounSrc => nounSrc.refer === refer)?.calls[index] ?? ScriptPlayer.unknownNounTip;
            }) as Node[T];
        } else if (key === "talker") {
            const character = this.project.characters[node.talker];
            if (!character) return node.talker as Node[T];
            return (character.name ?? node.talker) as Node[T];
        } else if (key === "feeling") {
            return (this.project.feelings[node.feeling] ?? node.feeling) as Node[T];
        } else if (key === "assetId") {
            const asset = this.project.assets[node.assetId]
            if (!asset) return node.assetId as Node[T];
            if (asset.type === "script") return asset.data as Node[T];
            else return node.assetId as Node[T];
        }
        return node[key];
    }
    public async open(file: Blob, password?: string): Promise<ProjectData> {
        this.project = await ScriptPlayer.decompile(file, password);
        return this.project;
    }
    public findNodeById(nodeId: string): Node {
        if (!this.project) throw new Error("Project not loaded");
        const result = this.project.nodes.find(node => node.id === nodeId);
        if (!result) throw new Error(`Node not found: ${nodeId}`);
        return result;
    }
    public async play(callback: (node: Node) => number | void | Promise<number | void>, nodeId?: string): Promise<number> {
        if (!this.project) throw new Error("Project not loaded");
        const nodeID = nodeId ?? this.project.entryNode;
        if (!nodeID) throw new Error("No entry node found, please set a entry target");
        const node = this.findNodeById(nodeID);
        const state = await callback(node) ?? -1;
        if (state >= 0) {
            const point = node.outPoints[state];
            if (!point) return state;
            const { nextId } = point;
            if (!nextId || nextId === "null") return state;
            return await this.play(callback, nextId);
        } else {
            return state;
        }
    }
    public static async decompile(file: Blob, password?: string): Promise<ProjectData> {
        const projectData: ProjectData = {
            nodes: [],
            characters: [],
            feelings: [],
            nouns: [],
            assets: [],
            entryNode: null
        };
        try {
            const decodedBytes = base64ToArrayBuffer(await readBlob(file));
            file = new Blob([decodedBytes]);
        } catch { }
        const zipReader = new ZipReader(new BlobReader(file), { password });
        const entries = await zipReader.getEntries();
        for (const entry of entries) {
            if (entry.directory || !entry.getData) continue;
            const { buffer: content } = await entry.getData<Uint8Array>(new Uint8ArrayWriter(), { password }) as { buffer: ArrayBuffer };
            let decodedContent: string | ArrayBuffer;
            try {
                decodedContent = new TextDecoder().decode(content);
            } catch {
                decodedContent = content;
            }
            if (entry.filename.endsWith(".node")) {
                const lines = decodedContent.toString().split("\n");
                const node: Node = {
                    id: entry.filename.replace(".node", "").replace(".entry", ""),
                    type: lines[0],
                    talker: Number(lines[1]),
                    message: lines[2],
                    feeling: Number(lines[3]),
                    assetId: Number(lines[4]),
                    outPoints: lines[5]
                        .split(",")
                        .filter(Boolean)
                        .map(pair => {
                            const [label, nextId] = pair.split(":");
                            return { label, nextId };
                        }),
                };
                projectData.nodes.push(node);
                if (entry.filename.endsWith(".entry.node")) {
                    projectData.entryNode = node.id;
                }
            } else if (entry.filename.endsWith(".character")) {
                const lines = decodedContent.toString().split("\n");
                projectData.characters.push({
                    name: lines[0],
                    feelings: Object.fromEntries(
                        lines[1]
                            .split(",")
                            .filter(Boolean)
                            .map(pair => pair.split(":").map(Number))
                    ),
                });
            } else if (entry.filename.endsWith(".feeling")) {
                projectData.feelings.push(decodedContent.toString().trim());
            } else if (entry.filename.endsWith(".noun")) {
                projectData.nouns.push({
                    refer: entry.filename.replace(".noun", ""),
                    calls: decodedContent.toString().split("\n"),
                });
            } else if (entry.filename.endsWith(".image") || entry.filename.endsWith(".video") || entry.filename.endsWith(".script")) {
                const assetType = entry.filename.split(".").pop()!;
                projectData.assets.push({
                    type: assetType,
                    data: decodedContent,
                });
            }
        }
        await zipReader.close();
        return projectData;
    }
}