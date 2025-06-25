<script setup lang="ts">
import { PropType } from "vue";
import SelectBar from "./SelectBar.vue";
import { EditorState, NodeScript, NodeType, ProjectData } from "@/structs";
const { project, filter } = defineProps({
    project: {
        type: Object as PropType<ProjectData>,
        required: true
    },
    filter: {
        type: Array as PropType<(NodeType | "all")[]>,
        default: () => ["all"]
    },
    editor: {
        type: Object as PropType<EditorState>,
        required: true
    }
});
function needFiltOut(node: NodeScript) {
    return !filter.includes(node.type) && !filter.includes('all')
}
</script>
<template>
    <SelectBar :model-caster="index => project.nodes[index].id"
        :bind-caster="value => project.nodes.findIndex(node => node.id === value)"
        :options="project.nodes.map(node => node.id)" v-model:follow-index="editor.cursorFollowingIndex"
        :hides="project.nodes.map((node, i) => needFiltOut(node) ? i : NaN)"
        @close="editor.cursorFollowingIndex = -1" />
</template>