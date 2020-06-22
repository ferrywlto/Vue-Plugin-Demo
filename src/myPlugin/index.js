import myComponentA from './myComponentA.vue';
import myComponentB from './myComponentB.vue';
import myStore from './store.js'

const MyPlugin = {
    install(Vue, rootStore) {
        // Vue is a Vue Constructor, not an Vue instance. This plugin requires passing the main app Vue instance as options parameter.

        // Vue.component need to be called BEFORE new Vue() in main.js...
        Vue.component(myComponentA.name, myComponentA);
        Vue.component(myComponentB.name, myComponentB);

        const storeName = 'my_store';

        // Add store only once.
        if(!rootStore.hasModule(storeName)) {
            rootStore.registerModule(storeName, myStore);
        }
    }
}

export default MyPlugin;

export {myComponentA, myComponentB}

// Automatic installation if Vue has been added to the global scope.
if (typeof window !== 'undefined' && window.Vue) {
    window.Vue.use(MyPlugin)
}
