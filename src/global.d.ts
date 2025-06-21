import type { Ref } from "vue";
import type { EditorState, ProjectData, Settings, Vector, WindowType } from "./structs";
declare global {
    declare interface Window {
        msg: (type: "info" | "warn" | "error", data: string) => void;
        project: Ref<ProjectData>;
        settings: Ref<Settings>;
        state: Ref<EditorState>;
        windowOrders: Ref<WindowType[]>;
        windowPositions: Ref<Record<WindowType, Vector>>;
        windowDraggings: Ref<Record<WindowType, boolean>>;
        openWindow(target: WindowType): void;
        closeWindow(target: WindowType): void;
        moveToTop(target: WindowType): void;
        dragToZero(target: WindowType): void;
    }
    declare interface ObjectConstructor {
        hasOwn<O, P extends string | number | symbol>(obj: O, prop: P): obj is O & Record<P, any>;
    }
}
declare module "vue" {
    export interface ComponentCustomProperties {
        $withBase(url: string): string;
        window: Window;
    }
}