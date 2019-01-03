<template>
  <ul
    class="list-unstyled components">
    <li>
      <a
        aria-expanded="true"
        class="dropdown-toggle">Plant Overview</a>
      <div
        v-if="loading"
        style="text-align: center">Loading now...
      </div>
      <ul
        id="homeSubmenu"
        class="list-unstyled">
        <li
          v-for="(value, key) in items"
          :key="key">

          <a><i class="fas fa-industry"/> {{ key }}호기 <span
            class="badge badge-success">{{ value.length }}</span></a>
        </li>
      </ul>
    </li>
  </ul>
</template>

<script>
import ApiHandler from '../services/ApiHandler'

export default {
  name: 'MonitoringMenuComponent',
  props: {
    menuLoading: {
      default: function () {
        return true
      },
      type: Boolean
    },
    menuItems: {
      default: function () {
        return []
      },
      type: Array }
  },
  data: function () {
    return {
      items: this.menubar,
      loading: this.menuLoading
    }
  },
  created () {
    ApiHandler.getPlantOverview()
      .then(items => {
        this.items = items.plant
        this.loading = false
      })
      .catch(err => console.log(err))
  }

}
</script>

<style scoped>
</style>
