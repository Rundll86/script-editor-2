import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import zipPack from "vite-plugin-zip-pack";
import packageJson from "./package.json";
export default defineConfig({
    plugins: [
        vue(),
        zipPack({
            outFileName: `${packageJson.name}-v${packageJson.version}.zip`,
            inDir: "dist",
            outDir: "archive"
        })
    ],
    resolve: {
        alias: {
            '@': fileURLToPath(new URL('./src', import.meta.url))
        }
    },
    base: "/scripteditor-2/"
});