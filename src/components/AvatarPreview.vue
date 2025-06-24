<template>
    <div class="previewer">
        <img v-if="avatarData" class="preview" :src="cachedAvatarURL" />
        <div v-else class="preview">⚠️</div><br>
        <slot></slot>
    </div>
</template>
<script setup lang="ts">
import { NodeScript, ProjectData } from "@/structs";
import { refObjectUrl } from "@/tools";
import { computed, PropType } from "vue";
const { data, project } = defineProps({
    data: {
        type: Object as PropType<NodeScript>,
        required: true
    },
    project: {
        type: Object as PropType<ProjectData>,
        required: true
    }
});
const avatarData = computed(() => project.assets[project.characters[data.talker ?? 0]?.feelings[data.feeling ?? 0]]?.data);
const cachedAvatarURL = refObjectUrl(() => avatarData.value as ArrayBuffer);
</script>
<style scoped>
.previewer {
    text-align: center;
}

.preview {
    width: 70px;
    height: 70px;
    border: 2px solid gray;
    object-fit: contain;
    padding: 5px;
    border-radius: 5px;
    display: inline-flex;
    justify-content: center;
    align-items: center;
    font-size: 25px;
}
</style>