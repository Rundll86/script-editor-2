declare interface Window {
    msg: (type: "info" | "warn" | "error", data: string) => void;
}