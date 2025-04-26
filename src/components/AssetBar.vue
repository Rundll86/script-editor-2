<template>
    <div class="assetbar">
        <div @click="opening = !opening">
            <FitValueInput v-model="data.name" />
        </div>
        <div class="box" :class="{ opening }">
            <SmallButton @click="uploadAsset" class="upload-btn">🪄上传资源</SmallButton>
            <img v-if="data.data" :src="createObjectURL(data.data)" />
        </div>
    </div>
</template>
<script setup lang="ts">
import type { Asset } from '@/structs';
import { ref, type PropType } from 'vue';
import SmallButton from './SmallButton.vue';
import { uploadFile, createObjectURL } from '@/tools';
import FitValueInput from './FitValueInput.vue';
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
    transition: all 0.2s ease-out;
}

.box.opening {
    height: auto;
    opacity: 1;
    transform: scaleY(1);
}

.upload-btn {
    margin-top: 5px;
}
</style>