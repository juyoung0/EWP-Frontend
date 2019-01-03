import '@babel/polyfill'
import App from './App.vue'
import Vue from 'vue'
import '../assets/app.css'
import $ from 'jquery'
import 'bootstrap'
import 'bootstrap/dist/css/bootstrap.min.css'
import axios from 'axios'

Vue.config.productionTip = false
Vue.prototype.$http = axios

/* eslint-disable-next-line no-new */
var vm = new Vue({
  el: '#app',
  data: {
    monitoring: {}
  },
  created () {

  },
  render: h => h(App)
})
console.log('vm', vm)
$(document).ready(function () {
  $('#sidebarCollapse').click(function (e) {
    e.preventDefault()
    $('#wrapper').toggleClass('toggled')
  })
})
