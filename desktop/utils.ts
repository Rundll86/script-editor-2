import path from "path";
import fs from "fs";
export const isDevelopment = fs.existsSync(".development");
export function resolveFilePath(from: string) {
    return isDevelopment ? path.resolve("generated", from) : path.resolve(from);
}