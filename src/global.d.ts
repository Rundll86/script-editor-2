import type { Ref } from "vue";
import type { ProjectData } from "./structs";
declare global {
    declare interface Window {
        msg: (type: "info" | "warn" | "error", data: string) => void;
        project: Ref<ProjectData>;
    }
}
declare module "vue" {
    export interface ComponentCustomProperties {
        $withBase(url: string): string;
    }
}