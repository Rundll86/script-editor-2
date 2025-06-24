<template>
    <div class="assetbar">
        <div>
            <InputBoxButFitWidth v-model="data.name" />
            <SquareButton @click="opening = !opening" v-if="data.type !== 'script'">
                {{ opening ? '▴' : '▾' }}
            </SquareButton>
            <SquareButton @click="$emit('delete')">🗑️</SquareButton>
        </div>
        <div class="box" :class="{ opening }">
            <SmallButton @click="uploadAsset" class="upload-btn">🪄上传资源</SmallButton>
            <SmallButton @click="data.data = null">🗑️清除数据（不可恢复）</SmallButton>
            <ResizableContainer class="previewer" v-if="data.data">
                <img v-if="data.type === 'image'" class="preview" :src="createObjectURL(data.data)">
                <video controls v-else-if="data.type === 'video'" class="preview"
                    :src="createObjectURL(data.data)"></video>
            </ResizableContainer>
            <span v-else-if="data.type !== 'script'">⚠️资源无效！请上传一个资源。</span>
        </div>
    </div>
</template>
<script setup lang="ts">
import type { Asset } from "@/structs";
import { ref, type PropType } from "vue";
import SmallButton from "./SmallButton.vue";
import { uploadFile, createObjectURL } from "@/tools";
import InputBoxButFitWidth from "./InputBoxButFitWidth.vue";
import SquareButton from "./SquareButton.vue";
import ResizableContainer from "./ResizableContainer.vue";
const props = defineProps({
    data: {
        type: Object as PropType<Asset>,
        required: true
    }
});
const opening = ref(false);
async function uploadAsset() {
    props.data.data = await uploadFile();
};
</script>
<style scoped>
.assetbar {
    display: flex;
    flex-direction: column;
    align-items: center;
}

.box {
    height: 0;
    interpolate-size: allow-keywords;
    opacity: 0;
    transform: scaleY(0);
    transform-origin: 50% 0;

    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 5px;
}

.box.opening {
    height: auto;
    opacity: 1;
    transform: scaleY(1);
}

.upload-btn {
    margin-top: 5px;
}

.previewer {
    display: flex;
    flex-direction: column;
    align-items: center;
}

.preview {
    width: 100%;
    height: 100%;
}
</style>