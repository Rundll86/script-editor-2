import { BlobReader, ZipReader, Uint8ArrayWriter } from "@zip.js/zip.js";
interface Node {
    id: string;
    type: string;
    talker: string;
    message: string;
    feeling: string;
    assetId: string;
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
async function generateSha256(data: ArrayBuffer | string): Promise<string> {
    const buffer = typeof data === "string" ? new TextEncoder().encode(data) : new Uint8Array(data);
    const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
    return Array.from(new Uint8Array(hashBuffer))
        .map(b => b.toString(16).padStart(2, "0"))
        .join("");
}
export class ScriptPlayer {
    private project?: ProjectData;
    public async open(file: Blob, password?: string): Promise<ProjectData> {
        this.project = await ScriptPlayer.decompile(file, password);
        return this.project;
    }
    public findNodeById(nodeId: string): Node {
        if (!this.project) throw new Error("Project not loaded");
        const result = this.project.nodes.find(node => node.id === nodeId);
        if (!result) throw new Error("Node not found");
        return result;
    }
    public async play(callback: (node: Node) => number | Promise<number>, nodeId?: string): Promise<void> {
        if (!this.project) throw new Error("Project not loaded");
        const nodeID = nodeId ?? this.project.entryNode;
        if (!nodeID) throw new Error("No entry node found, please set a target");
        const node = this.findNodeById(nodeID);
        const state = await callback(node);
        if (state >= 0) await this.play(callback, node.outPoints[state].nextId);
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
        const zipReader = new ZipReader(new BlobReader(file), { password });
        const entries = await zipReader.getEntries();
        for (const entry of entries) {
            if (entry.directory || !entry.getData) continue;
            const { buffer: content } = await entry.getData<Uint16Array<ArrayBuffer>>(new Uint8ArrayWriter());
            let decodedContent: string | ArrayBuffer;
            try {
                decodedContent = content.toString();
            } catch {
                decodedContent = content;
            }
            if (entry.filename.endsWith(".node")) {
                const lines = decodedContent.toString().split("\n");
                const node: Node = {
                    id: entry.filename.replace(".node", "").replace(".entry", ""),
                    type: lines[0],
                    talker: lines[1],
                    message: lines[2],
                    feeling: lines[3],
                    assetId: lines[4],
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