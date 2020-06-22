import Vue from 'vue'
import App from './App.vue'
import myPlugin from "vue-plugin-demo-pkg"
import Vuex from 'vuex'
import rootStore from './store.js';
Vue.use(Vuex);

Vue.use(myPlugin, rootStore);

new Vue({
  render: h => h(App),
  store: rootStore,
}).$mount('#app');