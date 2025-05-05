import { createApp } from 'vue';
import App from './components/App.vue';
const app = createApp(App);
app.mixin({
    methods: {
        $withBase(url: string) {
            return new URL(url, window.location.href + "/").href;
        }
    }
});
app.mount('#app');