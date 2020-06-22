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