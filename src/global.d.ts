import { Ref } from "vue";
import { ProjectData, EditorState, WindowType, Vector, Settings } from "./structs";
declare global {
    interface Window {
        msg: <T>(type: "info" | "warn" | "error", data: T) => T;
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
        mouse: {
            left: boolean;
            right: boolean;
            middle: boolean;
        };
        keyboard: {
            ctrl: boolean;
            shift: boolean;
        };
        isDesktop: true | void;
        isDevelopment: boolean;
    }
    interface ObjectConstructor {
        hasOwn<O, P extends string | number | symbol>(obj: O, prop: P): obj is O & Record<P, object>;
    }
}
declare module "vue" {
    export interface ComponentCustomProperties {
        $withBase(url: string): string;
        window: Window;
    }
}