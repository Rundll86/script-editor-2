import { Vector } from "./structs";
import unknownImage from "./assets/unknown-image.png";
const uuidGenerated: string[] = [];
export function uuid() {
    let result;
    do {
        result = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    } while (uuidGenerated.includes(result));
    uuidGenerated.push(result);
    return result;
};
export function declareGlobalVaribles(obj: { [key: string]: any }) {
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
export function calcControl(
    a: Vector,
    b: Vector,
    offsetMulitplier: number = 0.5,
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
export function keyMapper(keys: string[], values: string[]) {
    const result: any = {};
    keys.forEach((key, index) => {
        result[key] = values[index];
    });
    return result;
};
export function unused<T>(data: T): T { return data; };
export function everyFrame(executor: () => void) {
    function loop() {
        executor();
        requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
};
export function elementCenter(element: HTMLElement) {
    const rect = element.getBoundingClientRect();
    return new Vector(rect.left + rect.width / 2, rect.top + rect.height / 2);
};
export namespace Drawing {
    let stageCanvas: HTMLCanvasElement;
    let context: CanvasRenderingContext2D;
    const lineWidth = 2;
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
export async function uploadFile(accept: string = "*") {
    return new Promise<ArrayBuffer | null>((resolve) => {
        const input = document.createElement("input");
        input.type = "file";
        input.accept = accept;
        input.addEventListener("change", (event) => {
            const file = input.files?.[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = () => {
                    resolve(reader.result as ArrayBuffer);
                };
                reader.onerror = () => {
                    resolve(null);
                };
                reader.readAsArrayBuffer(file);
            } else {
                resolve(null);
            };
        });
        input.click();
    });
}
export function createObjectURL(data: any) {
    const blob = new Blob([data]);
    return URL.createObjectURL(blob);
}
export const unknownImageURL = createObjectURL(unknownImage);