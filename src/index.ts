import { createApp } from 'vue';
import App from './components/App.vue';
window.mouse = {
    left: false,
    right: false,
    middle: false
};
window.keyboard = {
    ctrl: false,
    shift: false
};
window.addEventListener("mousedown", (e) => {
    if (e.button === 0) {
        window.mouse.left = true;
    }
    if (e.button === 2) {
        window.mouse.right = true;
    }
    if (e.button === 1) {
        window.mouse.middle = true;
    }
});
window.addEventListener("mouseup", (e) => {
    if (e.button === 0) {
        window.mouse.left = false;
    }
    if (e.button === 2) {
        window.mouse.right = false;
    }
    if (e.button === 1) {
        window.mouse.middle = false;
    }
});
window.addEventListener("keydown", (e) => {
    if (e.key === "Control") {
        window.keyboard.ctrl = true;
    }
    if (e.key === "Shift") {
        window.keyboard.shift = true;
    }
});
window.addEventListener("keyup", (e) => {
    if (e.key === "Control") {
        window.keyboard.ctrl = false;
    }
    if (e.key === "Shift") {
        window.keyboard.shift = false;
    }
});
const app = createApp(App);
app.mixin({
    methods: {
        $withBase(url: string) {
            return new URL(url, window.location.href + "/").href;
        }
    },
    data() {
        return {
            window
        }
    },
    mounted() {
        window.addEventListener("resize", () => {
            this.$forceUpdate();
        });
    },
});
app.mount('#app');