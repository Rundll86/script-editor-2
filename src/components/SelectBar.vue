<template>
    <div class="selector">
        <span class="current" @click="opening = !opening">
            <AnimatedContent class="label" :content="selectedText" />
            <SquareButton class="searcher" @click.stop="searching = !searching">🔍</SquareButton>
            <input v-if="searching" @click.stop type="text" v-model="filter" placeholder="Search..." />
        </span>
        <div ref="optionsbar" class="options"></div>
        <Teleport to="body">
            <div class="options teleportor" :class="{ opening }" :style="{
                top: optionsbarRect?.top + 'px',
                left: optionsbarRect?.left + 'px',
                width: optionsbarRect?.width + 'px'
            }">
                <div :key="index" v-for="option, index in options">
                    <div class="option" v-if="valid(option)" @click="select(index)">
                        <span v-if="index === selected">▸</span>
                        {{ option }}
                        <span v-if="index === selected">◂</span>
                    </div>
                </div>
                <div>
                    <div class="option" v-if="options.length < 1" @click="msg('error', '无法选中')">
                        {{ noOptionTip }}
                    </div>
                </div>
            </div>
        </Teleport>
    </div>
</template>
<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch, type PropType } from "vue";
import SquareButton from "./SquareButton.vue";
import AnimatedContent from "./AnimatedContent.vue";
import { everyFrame } from "@/tools";
const emit = defineEmits(["update:selected"]);
const props = defineProps({
    options: {
        type: Array as PropType<readonly string[]>,
        default: () => ["Option A", "Option B", "Option C"]
    },
    selected: {
        type: Number,
        default: 0
    },
    nullable: { // 是否可以不选择任何选项
        type: Boolean,
        default: false
    }
});
const noOptionTip = "⚠️无有效选项";
const notSelectTip = "⚠️未选中任何选项";
const selected = ref(props.selected);
const selectedText = computed(() => props.options[selected.value] ?? (props.options.length > 0 ? notSelectTip : noOptionTip));
const opening = ref(false);
const filter = ref("");
const searching = ref(false);
const optionsbar = ref<HTMLDivElement | null>(null);
const optionsbarRect = ref<DOMRect | undefined>(undefined);
const { msg } = window;
let rafStoper: (() => void) | null = null;
function select<T extends number>(index: T): T | -1 {
    if (props.nullable && index === selected.value)
        return select(-1);
    selected.value = index;
    opening.value = false;
    return index;
};
function valid(text: string) {
    return !searching.value || text.toLowerCase().includes(filter.value.toLowerCase().trim());
};
watch(() => props.selected, (newValue) => {
    selected.value = newValue;
});
watch(selected, (newValue, oldValue) => {
    if (newValue === oldValue) return;
    emit("update:selected", newValue);
});
everyFrame((stop) => {
    rafStoper = stop;
    optionsbarRect.value = optionsbar.value?.getBoundingClientRect();
});
onMounted(() => {
    emit("update:selected", selected.value);
});
onUnmounted(() => {
    rafStoper?.call(null);
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
    cursor: pointer;
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
    transition: height 0.2s ease-out, opacity 0.2s ease-out, transform 0.2s ease-out;
    interpolate-size: allow-keywords;
    opacity: 0;
    overflow: hidden;
    border: 1px solid gray;
    transform: scaleY(0);
    transform-origin: 50% 0;
    border-radius: 5px;
    overflow: hidden;
    margin-top: 2px;
    text-align: center;
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
    cursor: pointer;
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

.teleportor {
    position: absolute;
}
</style>