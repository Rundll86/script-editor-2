import { NodeScript, ProjectData, Vector } from "./structs";
import unknownImage from "./assets/unknown-image.png";
import { marked } from "marked";
import { ref, watch } from "vue";
export function uuid() {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
        const r = Math.random() * 16 | 0, v = c == "x" ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
};
export function declareGlobalVaribles<T>(obj: Record<string, T>) {
    Object.keys(obj).forEach((key) => {
        Object.defineProperty(window, key, {
            value: obj[key]
        });
    });
};
export function bezierCurve(t: number, a: Vector, control1: Vector, control2: Vector, b: Vector): Vector {
    const x = (1 - t) ** 3 * a.x + 3 * (1 - t) ** 2 * t * control1.x + 3 * (1 - t) * t ** 2 * control2.x + t ** 3 * b.x;
    const y = (1 - t) ** 3 * a.y + 3 * (1 - t) ** 2 * t * control1.y + 3 * (1 - t) * t ** 2 * control2.y + t ** 3 * b.y;
    return new Vector(x, y);
};
export function circleEquation(p: Vector, circleCenter: Vector, radius: number): boolean {
    return ((p.x - circleCenter.x) ** 2 + (p.y - circleCenter.y) ** 2) <= (radius ** 2);
};
export function findClosestBezierCircleIntersection(
    a: Vector,
    control1: Vector,
    control2: Vector,
    b: Vector,
    circleCenter: Vector,
    radius: number
): Vector | null {
    let closestIntersection: Vector | null = null;
    let minDistance = Infinity;
    for (let t = 0; t <= 1; t += 0.01) {
        const pointOnBezier = bezierCurve(t, a, control1, control2, b);
        if (circleEquation(pointOnBezier, circleCenter, radius)) {
            const distance = Math.sqrt((pointOnBezier.x - a.x) ** 2 + (pointOnBezier.y - a.y) ** 2);
            if (distance < minDistance) {
                minDistance = distance;
                closestIntersection = pointOnBezier;
            };
        };
    };
    return closestIntersection;
};
type RecursionArray<T> = T | T[] | RecursionArray<T>[];
export function keyMirror(...keys: RecursionArray<string>[]) {
    const result: Record<string, string> = {};
    flatArray<string>(keys).forEach((key) => {
        result[key] = key;
    });
    return result;
};
export function keyMirrorIndex(...keys: RecursionArray<string>[]) {
    const result: Record<string, number> = {};
    flatArray<string>(keys).forEach((key, index) => {
        result[key] = index;
    });
    return result;
};
export function flatArray<T>(data: RecursionArray<T>): T[] {
    if (!Array.isArray(data)) return [data];
    return data.map(e => flatArray(e as RecursionArray<T>)).flat() as T[];
};
export function keyMapper<K extends string[], V extends string[]>(keys: K, values: V) {
    const result: Record<string, V[number]> = {};
    keys.forEach((key, index) => {
        result[key] = values[index];
    });
    return result;
};
export function unused<T>(data: T): T { return data; };
export async function everyFrame(executor: (stop: () => boolean) => void | Promise<void>) {
    async function loop() {
        let keep = true;
        await executor(() => keep = false);
        if (!keep) return;
        requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
};
export async function frame(count: number = 1) {
    return new Promise<void>((resolve) => {
        let framed = 0;
        everyFrame(() => {
            framed++;
            if (framed === count) {
                stop();
                resolve();
            }
        });
    });
}
export function randFloat(min: number, max: number) {
    return Math.random() * (max - min) + min;
}
export function elementCenter(element: HTMLElement) {
    const rect = element.getBoundingClientRect();
    return new Vector(rect.left + rect.width / 2, rect.top + rect.height / 2);
};
export namespace Drawing {
    let stageCanvas: HTMLCanvasElement;
    let context: CanvasRenderingContext2D;
    let offsetMulitplier: number = 0.5;
    const lineWidth = 2;
    export function setOffsetMulitplier(data: number) {
        offsetMulitplier = data;
    };
    export function calcControl(
        a: Vector,
        b: Vector,
        mode: "vertical" | "horizontal" | "ease" = "vertical"
    ): Record<"control1" | "control2", Vector> {
        const control1 = new Vector(0, 0);
        const control2 = new Vector(0, 0);
        if (mode === "ease") {
            const distance = Math.sqrt(Math.pow(b.x - a.x, 2) + Math.pow(b.y - a.y, 2));
            const offset = distance * offsetMulitplier;
            control1.x = a.x + (b.x - a.x) / 3 + offset;
            control1.y = a.y + (b.y - a.y) / 3 - offset;
            control2.x = b.x - (b.x - a.x) / 3 - offset;
            control2.y = b.y - (b.y - a.y) / 3 + offset;
        } else if (mode === "vertical") {
            control1.x = a.x + (b.x - a.x) * offsetMulitplier;
            control1.y = a.y;
            control2.x = b.x - (b.x - a.x) * offsetMulitplier;
            control2.y = b.y;
        } else if (mode === "horizontal") {
            control1.x = a.x;
            control1.y = a.y + (b.y - a.y) * offsetMulitplier;
            control2.x = b.x;
            control2.y = b.y - (b.y - a.y) * offsetMulitplier;
        } else {
            unused<never>(mode);
        };
        return { control1, control2 };
    };
    export function resizeCanvas() {
        stageCanvas.width = stageCanvas.clientWidth;
        stageCanvas.height = stageCanvas.clientHeight;
        context.lineWidth = lineWidth;
    };
    export function initWith(canvas: HTMLCanvasElement) {
        stageCanvas = canvas;
        context = stageCanvas.getContext("2d") as CanvasRenderingContext2D;
        resizeCanvas();
    };
    export function drawArrow(point: Vector, control: Vector, arrowSize: number = 10) {
        const angle = Math.atan2(point.y - control.y, point.x - control.x);
        const arrowLine1 = {
            x1: point.x - arrowSize * Math.cos(angle - Math.PI / 6),
            y1: point.y - arrowSize * Math.sin(angle - Math.PI / 6),
            x2: point.x,
            y2: point.y
        };
        const arrowLine2 = {
            x1: point.x - arrowSize * Math.cos(angle + Math.PI / 6),
            y1: point.y - arrowSize * Math.sin(angle + Math.PI / 6),
            x2: point.x,
            y2: point.y
        };
        context.beginPath();
        context.moveTo(arrowLine1.x1, arrowLine1.y1);
        context.lineTo(arrowLine1.x2, arrowLine1.y2);
        context.moveTo(arrowLine2.x1, arrowLine2.y1);
        context.lineTo(arrowLine2.x2, arrowLine2.y2);
        context.stroke();
    };
    export function straightConnect(a: Vector, b: Vector, withArrow: boolean = true) {
        context.beginPath();
        context.moveTo(a.x, a.y);
        context.lineTo(b.x, b.y);
        context.stroke();
        context.closePath();
        if (withArrow) drawArrow(b, a);
    };
    export function straightConnectElement(a: HTMLElement, b: HTMLElement, withArrow: boolean = true) {
        const centerA: Vector = new Vector(a.getBoundingClientRect().left, a.getBoundingClientRect().top);
        centerA.x += (a.clientWidth + lineWidth) / 2;
        centerA.y += (a.clientHeight + lineWidth) / 2;
        const centerB: Vector = new Vector(b.getBoundingClientRect().left, b.getBoundingClientRect().top);
        centerB.x += (b.clientWidth + lineWidth) / 2;
        centerB.y += (b.clientHeight + lineWidth) / 2;
        straightConnect(centerA, centerB, withArrow);
    };
    export function bezierConnect(a: Vector, b: Vector, withArrow: boolean = true) {
        const { control1, control2 } = calcControl(a, b);
        context.beginPath();
        context.moveTo(a.x, a.y);
        context.bezierCurveTo(control1.x, control1.y, control2.x, control2.y, b.x, b.y);
        context.stroke();
        context.closePath();
        if (withArrow) drawArrow(b, control2);
    };
    export function bezierConnectElement(a: HTMLElement, b: {
        getBoundingClientRect: () => {
            left: number;
            top: number;
        };
        clientWidth: number;
        clientHeight: number;
    }, distMode: "center" | "edge" = "center") {
        const centerA: Vector = new Vector(a.getBoundingClientRect().left, a.getBoundingClientRect().top);
        centerA.x += (a.clientWidth + lineWidth) / 2;
        centerA.y += (a.clientHeight + lineWidth) / 2;
        const centerB: Vector = new Vector(b.getBoundingClientRect().left, b.getBoundingClientRect().top);
        centerB.x += (b.clientWidth + lineWidth) / 2;
        centerB.y += (b.clientHeight + lineWidth) / 2;
        const start: Vector = centerA;
        let end: Vector | null = null;
        if (distMode === "center") {
            end = new Vector(b.getBoundingClientRect().left, b.getBoundingClientRect().top);
            end.x += (b.clientWidth + lineWidth) / 2;
            end.y += (b.clientHeight + lineWidth) / 2;
        } else if (distMode === "edge") {
            const { control1, control2 } = calcControl(centerA, centerB);
            end = findClosestBezierCircleIntersection(centerA, control1, control2, centerB, centerB, b.clientWidth / 2);
        } else {
            unused<never>(distMode);
        };
        if (start && end) {
            bezierConnect(start, end);
        };
    };
    export function clear() {
        context.beginPath();
        context.clearRect(0, 0, stageCanvas.width, stageCanvas.height);
        context.closePath();
    };
};
type ArrayBufferWithFilename = ArrayBuffer & { filename: string };
export async function readFile(file: File): Promise<ArrayBufferWithFilename> {
    return new Promise<ArrayBufferWithFilename>((resolve) => {
        const reader = new FileReader();
        reader.addEventListener("load", () => {
            if (!(reader.result instanceof ArrayBuffer)) return;
            const buffer = reader.result;
            resolve(Object.assign(buffer, { filename: file.name }));
        });
        reader.readAsArrayBuffer(file);
    });
};
export async function uploadFile(accept?: string, one?: true): Promise<ArrayBufferWithFilename>;
export async function uploadFile(accept?: string, one?: false): Promise<ArrayBufferWithFilename[]>;
export async function uploadFile(accept: string = "*", one: boolean = true): Promise<ArrayBufferWithFilename[] | ArrayBufferWithFilename> {
    return new Promise((resolve) => {
        const input = document.createElement("input");
        input.type = "file";
        input.accept = accept;
        input.multiple = !one;
        input.addEventListener("change", async () => {
            const files: File[] = [];
            for (const file of input.files ?? []) {
                files.push(file);
            }
            if (one) resolve(await readFile(files[0]));
            else {
                const result: ArrayBufferWithFilename[] = [];
                files.forEach(async file => {
                    result.push(await readFile(file));
                    if (result.length === files.length) {
                        resolve(result);
                    }
                });
            }
        });
        input.click();
    });
}
export async function downloadFile(data: Promise<string | ArrayBuffer> | string | ArrayBuffer, filename: string) {
    const blob = new Blob([await data]);
    const url = createObjectURL(await blob.arrayBuffer());
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
}
export function createObjectURL(data: string | ArrayBuffer | null) {
    if (!data) return "";
    const blob = new Blob([data]);
    return URL.createObjectURL(blob);
}
export function arrayBufferToBase64(buffer: ArrayBuffer) {
    const uint8Array = new Uint8Array(buffer);
    let binaryString = "";
    for (let i = 0; i < uint8Array.length; i++) {
        binaryString += String.fromCharCode(uint8Array[i]);
    }
    return btoa(binaryString);
}
export function base64ToArrayBuffer(base64: string) {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const buffer = new ArrayBuffer(len);
    const uint8Array = new Uint8Array(buffer);
    for (let i = 0; i < len; i++) {
        uint8Array[i] = binaryString.charCodeAt(i);
    }
    return buffer;
}
export const unknownImageURL = createObjectURL(unknownImage);
export function limited(min: number, value: number, max: number) {
    return Math.min(Math.max(value, min), max);
}
export function offset(value: number, rate: number = 0.5) {
    return value * randFloat(1 - rate, 1 + rate);
}
export namespace Markdown {
    export async function filter(md: string, selector: string) {
        const html = document.createElement("div");
        html.innerHTML = await marked(md, { async: true });
        return [...html.querySelectorAll(selector)].map(e => e.innerHTML);
    }
}
export namespace XML {
    export function filter(xml: string, selector: string) {
        const html = document.createElement("div");
        html.innerHTML = xml;
        return [...html.querySelectorAll(selector)].map(e => e.innerHTML);
    }
}
export namespace OpenAIProtocol {
    export interface MessageContext {
        role: Roles;
        content: string;
    }
    interface ResponseCallback {
        message: string;
        finished: boolean;
    }
    interface AIService {
        key: string;
        model: string;
        baseUrl: string;
    }
    type ResponseCallbackFunction = (data: ResponseCallback) => void | Promise<void>;
    type AIServicePart = Partial<AIService>;
    type Roles = "assistant" | "user" | "system";
    let service: AIService = {
        key: "",
        model: "",
        baseUrl: ""
    };
    function getAuthorization() {
        return `Bearer ${service.key}`;
    }
    function parseStreamChunk(chunk: string): { choices: { delta: { role: Roles, content: string } }[] } {
        const splited: string[] = chunk.split(/[\n\r]/).map((s: string) => s.slice(6)).filter(Boolean).filter((e: string) => e !== "[DONE]");
        try {
            return splited.map(e => JSON.parse(e)).reduce((prev, cur) => {
                prev.choices[0].delta.content += cur.choices[0].delta.content;
                return prev;
            }, { choices: [{ delta: { role: "assistant", content: "" } }] });
        } catch (e) {
            console.log(chunk, e);
            return { choices: [{ delta: { role: "assistant", content: "" } }] };
        }
    }
    async function request(context: MessageContext[], stream: true, callback: ResponseCallbackFunction): Promise<string>;
    async function request(context: MessageContext[], stream: false): Promise<string>;
    async function request(context: MessageContext[], stream: boolean, callback?: ResponseCallbackFunction): Promise<string> {
        const response = await fetch(`${service.baseUrl}?random=${Math.random()}`, {
            method: "POST",
            headers: {
                "Authorization": getAuthorization(),
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ messages: context, model: service.model, stream })
        });
        if (!response.ok) {
            throw new Error(`${response.status}${response.statusText}`);
        }
        if (stream) {
            const reader = response.body?.getReader();
            let result = "";
            if (reader) {
                let finished;
                while (!finished) {
                    const { done, value } = await reader.read();
                    finished = done;
                    if (finished) {
                        await callback!({
                            message: result,
                            finished: true
                        });
                        break;
                    }
                    const text = new TextDecoder().decode(value);
                    const data = parseStreamChunk(text);
                    const { content } = data.choices[0].delta;
                    result += content;
                    await callback!({
                        message: content,
                        finished: false
                    });
                }
            }
            return result;
        } else return await response.text();
    }
    export namespace PresetServices {
        export const Zhipu: AIServicePart = {
            model: "glm-4-flash-250414",
            baseUrl: "https://open.bigmodel.cn/api/paas/v4/chat/completions"
        }
        export const DeepSeek: AIServicePart = {
            model: "deepseek-chat",
            baseUrl: "https://api.deepseek.com/chat/completions"
        }
    }
    export function assignService(servicePart: AIServicePart) {
        Object.assign(service, servicePart);
    }
    export function useService(newService: AIService) {
        service = newService;
    }
    export async function syncMessage(context: MessageContext[]) {
        return await request(context, false);
    }
    export async function streamMessage(context: MessageContext[], callback: ResponseCallbackFunction) {
        return await request(context, true, callback);
    }
}
export namespace NodeState {
    export function getChildren(node: NodeScript, project: ProjectData, visited: string[] = []): NodeScript[] {
        if (visited.includes(node.id)) return [];
        visited.push(node.id);
        const plainChildren = node.outPoints
            .map(point => project.nodes.find(node => node.id === point.nextId) as NodeScript)
            .filter(Boolean);
        return [
            ...plainChildren.flatMap((node) => getChildren(node, project, visited)),
            ...plainChildren
        ];
    }
}
export async function milliseconds(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
export function refObjectUrl(executor: () => ArrayBuffer | null) {
    function rebuild(buffer: ArrayBuffer | null) {
        try {
            URL.revokeObjectURL(result.value);
        } catch (e) {
            console.error(e);
        }
        result.value = createObjectURL(buffer);
    }
    const result = ref("");
    watch(executor, rebuild);
    rebuild(executor());
    return result;
}