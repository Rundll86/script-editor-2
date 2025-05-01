import type { ProjectData } from "./structs";
declare global {
    declare interface Window {
        msg: (type: "info" | "warn" | "error", data: string) => void;
        project: ProjectData;
    }
}