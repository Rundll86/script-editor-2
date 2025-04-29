<template>
    <div class="selector">
        <span class="current" @click="opening = !opening">
            <AnimatedContent class="label" :content="selectedText" />
            <SquareButton class="searcher" @click.stop="searching = !searching">🔍</SquareButton>
            <input v-if="searching" @click.stop type="text" v-model="filter" placeholder="Search..." />
        </span>
        <div class="options" :class="{ opening }">
            <div v-for="option, index in options">
                <div class="option" v-if="valid(option)" @click="select(index)">
                    <span v-if="index === selected">▸</span>
                    {{ option }}
                    <span v-if="index === selected">◂</span>
                </div>
            </div>
            <div>
                <div class="option" v-if="options.length < 1" @click="msg('error', '无法选中此选项')">{{ noOptionTip }}</div>
            </div>
        </div>
    </div>
</template>
<script setup lang="ts">
import { computed, onMounted, ref, watch, type PropType } from 'vue';
import SquareButton from './SquareButton.vue';
import AnimatedContent from './AnimatedContent.vue';
const emit = defineEmits(["update:selected"]);
const props = defineProps({
    options: {
        type: Array as PropType<readonly string[]>,
        default: () => ["Option A", "Option B", "Option C"]
    },
    selected: {
        type: Number,
        default: 0
    }
});
const noOptionTip = "⚠️No Options";
const selected = ref(props.selected);
const selectedText = computed(() => props.options[selected.value] ?? noOptionTip);
const opening = ref(false);
const filter = ref('');
const searching = ref(false);
const { msg } = window;
function select(index: number) {
    selected.value = index;
    opening.value = false;
};
function valid(text: string) {
    return !searching.value || text.toLowerCase().includes(filter.value.toLowerCase().trim());
};
watch(() => props.selected, (newValue) => {
    selected.value = newValue;
});
watch(selected, (newValue, oldValue) => {
    if (newValue === oldValue) return;
    emit('update:selected', newValue);
});
onMounted(() => {
    emit('update:selected', selected.value);
});
</script>
<style scoped>
.selector {
    display: flex;
    flex-direction: column;
    border: 1px solid gray;
    position: relative;
    display: inline-block;
    border-radius: 5px;
}

.label {
    margin-left: auto;
    margin-right: auto;
}

.current {
    background-color: rgb(245, 245, 245);
    padding: 5px 10px;
    display: flex;
    gap: 5px;
    border-radius: 5px;
}

.current:hover {
    background-color: rgb(235, 235, 235);
}

.current:active {
    background-color: rgb(220, 220, 220);
}

.options {
    position: absolute;
    left: 0;
    top: 100%;
    width: 100%;
    height: 0;
    transition: all 0.2s ease-out;
    interpolate-size: allow-keywords;
    opacity: 0;
    overflow: hidden;
    border: 1px solid gray;
    transform: scaleY(0);
    transform-origin: 50% 0;
    border-radius: 5px;
    overflow: hidden;
    margin-top: 5px;
    z-index: 10;
}

.options.opening {
    height: auto;
    opacity: 1;
    transform: scaleY(1);
}

.option {
    background-color: white;
    padding: 2px 4px;
    display: flex;
    justify-content: center;
}

.option:hover {
    background-color: rgb(235, 235, 235);
}

.option:active {
    background-color: rgb(220, 220, 220);
}

.searcher {
    margin-left: auto;
}
</style>