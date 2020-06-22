# Vue Plugin Demostration Project.

The files we need in this demo:
![File structure.](https://github.com/VerdantSparks/Vue-Plugin-Demo/blob/master/doc/structure.png)

## Creating the plugin:
```
// myPlugin/myComponentA.vue
<template>
    <div>Foo: {{getSharedStoreState}}</div>
</template>

<script>
    export default {
        name: 'component-a',
        computed: {
            getSharedStoreState() {
                return this.$store.state.my_store.foo - 1;
            }
        }
    };
</script>
```

```
// myPlugin/myComponentB.vue
<template>
    <div>Bar: {{getSharedStoreState}}</div>
</template>

<script>
    export default {
        name: 'component-b',
        computed: {
            getSharedStoreState() {
                return this.$store.state.my_store.foo + 1;
            }
        }
    };
</script>
```

```
// myPlugin/store.js
const store = {
    namespaced: true,
    state: {
        foo: 123,
    }
};

export default store;
```

``` 
// myPlugin/index.js
import componentA from './myComponentA';
import componentB from './myComponentB';
import myStore from './store.js'

const MyPlugin = {
    install(Vue, rootStore) {
        // Vue is a Vue Constructor, not an Vue instance. This plugin requires passing the main app Vue instance as options parameter.

        // Vue.component need to be called BEFORE new Vue() in main.js...
        Vue.component(componentA.name, componentA);
        Vue.component(componentB.name, componentB);

        const storeName = 'my_store';

        // While app only available AFTER new Vue() in main.js...
        // Add store only once.
        if(!rootStore.hasModule(storeName)) {
            rootStore.registerModule(storeName, ProximityStore);
        }
    }
}

export default MyPlugin;

export {componentA, componentB}

// Automatic installation if Vue has been added to the global scope.
if (typeof window !== 'undefined' && window.Vue) {
    window.Vue.use(MyPlugin)
}
```

## Installing the plugin:

```
// main.js
import Vue from 'vue'
import App from './App.vue'
import myPlugin from "./myPlugin/index.js"
import Vuex from 'vuex'
import rootStore from './store.js';
Vue.use(Vuex);

Vue.use(myPlugin, rootStore);

new Vue({
  render: h => h(App),
  store: rootStore,
}).$mount('#app');

```
** Why need to pass `rootStore` as parameter? **
This is because you are not able to access Vuex store BEFORE new Vue() instance created in the install() method inside plugin.
In-addition, global component registration MUST perform ahead of new Vue(). 

```
// store.js
import Vue from 'vue';
import Vuex from 'vuex'
Vue.use(Vuex);

const store = new Vuex.Store({
    state: {
        bar: 456,
    },
    modules: {
        a: {
            namespaced: true,
            state: {
                hello: 'world',
            }
        },
    },
});

export default store;
```

## Validate it works.
``` 
// App.vue, styles omitted.
<template>
  <div id="app">
    <img alt="Vue logo" src="./assets/logo.png">
    <HelloWorld msg="Welcome to Your Vue.js App"/>
  </div>
</template>

<script>
import HelloWorld from './components/HelloWorld.vue'

export default {
  name: 'App',
  components: {
    HelloWorld
  },
}
</script>
```

``` 
// components/HelloWorld.vue
<template>
  <div class="hello">
    {{msg}}
    <component-a/>
    <component-b/>
  </div>
</template>

<script>
export default {
  name: 'HelloWorld',
  props: {
    msg: String
  }
}
</script>
```

Now plugin has installed, the components from plugin can be used and the components can access the plugin's vuex store.
The plugin's vuex store has been registered as nested store of root store successfully.

![Plugin worked.](https://github.com/VerdantSparks/Vue-Plugin-Demo/blob/master/doc/result.png)