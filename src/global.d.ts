import "vue";
import "./structs";
declare global {
    interface Window {
        msg: <T extends string>(type: "info" | "warn" | "error", data: T) => T;
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
    interface ObjectConstructor {
        hasOwn<O, P extends string | number | symbol>(obj: O, prop: P): obj is O & Record<P, any>;
    }
}
declare module "vue" {
    export interface ComponentCustomProperties {
        $withBase(url: string): string;
        window: Window;
    }
}