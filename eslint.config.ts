import { globalIgnores } from 'eslint/config';
import { defineConfigWithVueTs, vueTsConfigs } from '@vue/eslint-config-typescript';
import pluginVue from 'eslint-plugin-vue';
export default defineConfigWithVueTs(
    {
        name: 'app/files-to-lint',
        files: ['**/*.{ts,mts,tsx,vue}'],
    },
    globalIgnores(['**/dist/**', '**/dist-ssr/**', '**/coverage/**']),
    pluginVue.configs['flat/essential'],
    vueTsConfigs.recommended,
    {
        rules: {
            "vue/no-mutating-props": "off",
            "vue/multi-word-component-names": "off",
            "vue/no-use-v-if-with-v-for": "off",
            "@typescript-eslint/no-namespace": "off"
        }
    }
);