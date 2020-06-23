# Vue Plugin Demostration Project.

The files we need in this demo:

![File structure.](https://github.com/VerdantSparks/Vue-Plugin-Demo/blob/master/doc/structure.png)

This project will create a most basic Vue plugin, it consist a Vuex store, and two SFC that read the vuex store. Build, pack and publish them as NPM package and finally consume it back from NPM registry.

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

## Pack and publish this plugin

1. Build your plugin as library and use the plugin definition file as input by:

`vue-cli-service build --target lib --name myPlugin ./src/myPlugin/index.js`

You should see something similar:

![Build output.](https://github.com/VerdantSparks/Vue-Plugin-Demo/blob/master/doc/build-output.png)

Your `dist` folder should now have these files created:

![Files in dist folder.](https://github.com/VerdantSparks/Vue-Plugin-Demo/blob/master/doc/dist-files.png)

2. Update `package.json`:

To save time so you don't have to type the whole build command, I add this in `script` section:

`"build-plugin": "vue-cli-service build --target lib --name myPlugin ./src/myPlugin/index.js"`

the whole `script` section now looks like:

```
  "scripts": {
    "serve": "vue-cli-service serve",
    "build": "vue-cli-service build",
    "lint": "vue-cli-service lint",
    "build-plugin": "vue-cli-service build --target lib --name myPlugin ./src/myPlugin/index.js"
  },
```
There are some important fields we need to add in order to publish our package successfully:

- name
  
  You package name that will discover by other developers.
  
- version

  Specify your package version in semver format. Note that you cannot pushing package with the same or older version number to NPM. Thus you need to update it whenever before you attempt to update the package.
  
- license

  Specify your package license, e.g. this repo is MIT license.
   
- repository

  Specify your package repository url, e.g. this GitHub repository url.
  
- private

  Specify does this package can discover by public
  
- **files**

  Specify what files you want to include in the published package, some will include the source of their package as well for easier debugging. For this demo we just keep the built files.
  
- **main**

  Highly important, specify the file to load when someone import your plugin.
  For example, if I set: 

  `"main": ".dist/myPlugin.common.js",` instead of `"main": "./dist/myPlugin.common.js",`
  
  The developer who consume your package will encounter this when they `yarn serve`:

  ![Dependency not found.](https://github.com/VerdantSparks/Vue-Plugin-Demo/blob/master/doc/dep-not-found.png)

  **Really make sure the `main` field has correctly set.**

Our resulting `package.json` should look like this:

```
{
  "name": "vue-plugin-demo-pkg",
  "version": "0.1.5",
  "private": false,
  "scripts": {
    "serve": "vue-cli-service serve",
    "build": "vue-cli-service build",
    "lint": "vue-cli-service lint",
    "build-plugin": "vue-cli-service build --target lib --name myPlugin ./src/myPlugin/index.js"
  },
  "main": "./dist/myPlugin.common.js",
  "files": [
    "dist/*"
  ],
  "license": "MIT",
  "repository": "https://github.com/VerdantSparks/Vue-Plugin-Demo",
  ... omitted
}
```
  
3. run `yarn publish`

If you did not login before, you should do that via `yarn login`.

### NOTE: You need to have a NPM account and have your email verified before you can push any package to NPM. Otherwise you will see this the following error during publish (and receive an email from NPM):

![Email not verified.](https://github.com/VerdantSparks/Vue-Plugin-Demo/blob/master/doc/verify-email.png)

You should see something similar if you pushed your package successfully.

![Package published.](https://github.com/VerdantSparks/Vue-Plugin-Demo/blob/master/doc/push-success.png)

Let's see your package information via `yarn info <your_package_name>`

![Package information.](https://github.com/VerdantSparks/Vue-Plugin-Demo/blob/master/doc/package-info.png)

The resulting npm package can be found [here](https://www.npmjs.com/package/vue-plugin-demo-pkg).

## Installing your own plugin from NPM 

1. Run `yarn add vue-plugin-demo-pkg`

2. Update `main.js`:

change `import myPlugin from "./myPlugin/index"`

to `import myPlugin from "vue-plugin-demo-pkg"`

3. Run `yarn serve`

4. You should find that the plugin is load from `node_module` and works exactly the same as you reference it locally.

# 🎉 Congratulations 🎉  

You have learned how to create your great Vue plugin and publish it to NPM ‼ 🍺

## One more thing. 👀

### Publish the plugin to GPR (GitHub Package Registry)

1. Update package.json, add:

```
  "publishConfig": {
    "registry": "https://npm.pkg.github.com/@<YOUR_USERNAME_OR_ORG_NAME>"
  },
```

This is not the same as the package tag in your repository stated. 
![GPR default.](https://github.com/VerdantSparks/Vue-Plugin-Demo/blob/master/doc/gpr-default.png)

2. Login npm of GPR:

`npm login --registry=https://npm.pkg.github.com --scope=@<YOUR_USERNAME_OR_ORG_NAME>`

NOTE: if you omitted the `--scope` switch, you will encounter a 404 not found error when you `npm publish`

![404 error.](https://github.com/VerdantSparks/Vue-Plugin-Demo/blob/master/doc/not-found.png)

3. Push your plugin to GPR:

`npm publish`

![GitHub default.](https://github.com/VerdantSparks/Vue-Plugin-Demo/blob/master/doc/gpr-success.png)

4. Consume the plugin from GPR:

  4.1 Create a new Vue project from Vue CLI: `vue create <app_name>`
  
  4.2 Login GPR npm registry:
  
  `npm login --registry=https://npm.pkg.github.com/ --scope=@<YOU_OR_ORG_GITHUB_NAME>`
  
  4.3 Install the plugin from GPR:
  
  `npm i @<YOU_OR_ORG_GITHUB_NAME>/vue-plugin-demo-pkg`

  4.4 Update code to use the plugin:

```
// in main.js
import Vue from 'vue'
import App from './App.vue'
import Vuex from 'vuex';
Vue.use(Vuex);
const rootStore = new Vuex.Store();

import MyPlugin from '@VerdantSparks/vue-plugin-demo-pkg'
Vue.use(MyPlugin, rootStore);
Vue.config.productionTip = false

new Vue({
  store: rootStore,
  render: h => h(App),
}).$mount('#app')


// in HelloWorld.vue
<template>
    ...omitted
        <component-a/>
        <component-b/>
    </div>
</template>

// in package.json
    ...omitted
    "dependencies": {
    "@VerdantSparks/vue-plugin-demo-pkg": "^0.1.5",
    "core-js": "^3.6.5",
    "vue": "^2.6.11"
    },
    ...omitted
```

5. Run the Vue app: `npm serve` 

You should see the plugin works as expected. 😀

## References
- https://www.digitalocean.com/community/tutorials/vuejs-creating-custom-plugins
- https://www.xiegerts.com/post/creating-vue-component-library-npm/
- https://www.xiegerts.com/post/creating-vue-component-library-structure/
- https://sebastiandedeyne.com/exposing-multiple-vue-components-as-a-plugin/
- https://stackoverflow.com/questions/53089441/how-to-access-vuex-from-vue-plugin
- https://www.digitalocean.com/community/tutorials/vuejs-vuex-dynamic-modules
- https://www.5balloons.info/create-publish-you-first-vue-plugin-on-npm-the-right-way/
- https://stackoverflow.com/questions/47540846/dependency-not-found-even-defined-in-package-json-and-node-modules
- https://stackoverflow.com/questions/57938784/not-found-put-https-npm-pkg-github-com-package-name


