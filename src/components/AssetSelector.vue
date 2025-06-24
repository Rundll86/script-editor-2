<script setup lang="ts">
import { PropType } from "vue";
import SelectBar from "./SelectBar.vue";
import { AssetType, ProjectData } from "@/structs";
defineProps({
    project: {
        type: Object as PropType<ProjectData>,
        required: true
    },
    filter: {
        type: Array as PropType<(AssetType | "all")[]>,
        default: () => ["all"]
    }
});
</script>
<template>
    <SelectBar :options="project.assets.map(asset => asset.name)"
        :hides="project.assets.filter(asset => !filter.includes(asset.type) && !filter.includes('all')).map((_, i) => i)" />
</template>