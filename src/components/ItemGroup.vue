<script setup lang="ts">
import { PropType } from 'vue';
import ContainerFrame from './ContainerFrame.vue';
import SquareButton from './SquareButton.vue';
defineProps({
    datas: {
        type: Array as PropType<any[]>,
        required: true
    }
});
</script>
<template>
    <ContainerFrame class="frame">
        <div v-for="data, index in datas" :key="index" class="item">
            <SquareButton class="left" @click="datas.splice(index, 1)">🗑️</SquareButton>
            <div class="center">
                <slot name="children" :data="data"></slot>
            </div>
        </div>
    </ContainerFrame>
</template>
<style scoped>
.frame {
    display: flex;
    flex-direction: column;
}

.item {
    display: flex;
    gap: 5px;
    align-items: center;
    justify-content: center;
    border-radius: 5px;
    padding: 5px 0;
}

.item:hover {
    background-color: rgba(0, 0, 0, 0.1);
}

.center {
    margin: 0 auto;
}
</style>