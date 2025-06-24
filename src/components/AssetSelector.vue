<script setup lang="ts">
import { PropType } from "vue";
import SelectBar from "./SelectBar.vue";
import { Asset, AssetType, ProjectData } from "@/structs";
const { project, filter } = defineProps({
    project: {
        type: Object as PropType<ProjectData>,
        required: true
    },
    filter: {
        type: Array as PropType<(AssetType | "all")[]>,
        default: () => ["all"]
    }
});
function needFiltOut(asset: Asset) {
    return !filter.includes(asset.type) && !filter.includes('all')
}
</script>
<template>
    <SelectBar :options="project.assets.map(asset => asset.name)"
        :hides="project.assets.map((asset, i) => needFiltOut(asset) ? i : NaN)" />
</template>