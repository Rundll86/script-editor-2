<template>
    <div class="root" :title="role">
        <img :src="$withBase(`users/${name}.${imgExt}`)" :class="{
            avatar: true,
            border: withBorder
        }">
        <span class="name">{{ name + (team ? "(Team)" : "") }}</span>
        <a v-if="alias || website" :href="website" target="_blank" class="alias smallfont">
            @{{ alias ?? name }}
        </a>
    </div>
</template>
<script setup lang="ts">
defineProps({
    name: {
        type: String,
        default: "MemberName"
    },
    alias: String,
    website: String,
    withBorder: Boolean,
    team: Boolean,
    imgExt: {
        type: String,
        default: "jpg"
    },
    role: String
});
</script>
<style scoped>
.avatar {
    width: 50px;
    height: 50px;
    border-radius: 50%;
    object-fit: contain;
}

.avatar.border {
    border: 2px solid gray;
}

.smallfont {
    font-size: 14px;
}

.name {
    font-weight: bold;
    font-size: 18px;
    margin-top: 5px;
}

.alias {
    margin-top: 5px;
    color: rgba(0, 0, 0, 0.5);
}

a:link,
a:visited {
    text-decoration: none;
}

a:hover,
a:active {
    color: rgba(0, 0, 0, 0.75);
    text-decoration: underline;
}

.root {
    display: inline-flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    margin: 15px;
}
</style>