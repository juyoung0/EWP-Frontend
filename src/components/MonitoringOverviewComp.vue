<template>
  <div class="card">
    <h5 class="card-header"><i class="fas fa-info-circle"/> Plant Overview<span class="float-right setting"><i class="fas fa-cog"/></span></h5>
    <div
      class="plant-img"
      style="background-image: url('assets/img/plants-overview.png');">
      <div/>
      <div style="display: flex"/>
      <svg
        v-if="menuItems != {}"
        viewBox="0 0 884 355">
        <g
          v-for="(item,key) in items"
          :key="key"
          :transform="translate(item.pos[0],item.pos[1])"
          class="plant-overview-item"
          @click="clickOverviewPlant(key)">
          <circle
            :class="{'circle-blue':item.len === 0, 'circle-red':item.len != 0}"
            r="27"
            stroke-width="1"/>
          <text text-anchor="middle">{{ key }}호기</text>
          <text
            y="18"
            text-anchor="middle">{{ item.len }}
          </text>
        </g>
      </svg>
    </div>
  </div>
</template>

<script>
import { EventBus } from '../services/EventBus'

export default {
  name: 'MonitoringOverviewComp',
  props: {
    menuItems: {
      type: Object,
      default: () => {
      }
    },
    menuLoading: {
      type: Boolean,
      default: () => true
    }
  },
  data: function () {
    return {
      items: {
        1: { pos: [780, 265], len: 0, val: [] },
        2: { pos: [710, 250], len: 0, val: [] },
        3: { pos: [640, 235], len: 0, val: [] },
        4: { pos: [580, 220], len: 0, val: [] },
        5: { pos: [470, 205], len: 0, val: [] },
        6: { pos: [400, 190], len: 0, val: [] },
        7: { pos: [335, 175], len: 0, val: [] },
        8: { pos: [275, 160], len: 0, val: [] },
        9: { pos: [180, 130], len: 0, val: [] },
        10: { pos: [90, 110], len: 0, val: [] }
      },
      loading: true
    }
  },
  watch: {
    menuItems: function () {
      let items = {
        1: { pos: [780, 265], len: 0, val: [] },
        2: { pos: [710, 250], len: 0, val: [] },
        3: { pos: [640, 235], len: 0, val: [] },
        4: { pos: [580, 220], len: 0, val: [] },
        5: { pos: [470, 205], len: 0, val: [] },
        6: { pos: [400, 190], len: 0, val: [] },
        7: { pos: [335, 175], len: 0, val: [] },
        8: { pos: [275, 160], len: 0, val: [] },
        9: { pos: [180, 130], len: 0, val: [] },
        10: { pos: [90, 110], len: 0, val: [] }
      }

      if (this.menuItems['1']) {
        for (let key in this.menuItems) {
          items[key].len = this.menuItems[key].length
          items[key].val = this.menuItems[key]
        }
      }
      this.items = items
    }
  },
  methods: {
    translate (x, y) {
      return 'translate(' + x + ',' + y + ')'
    },
    clickOverviewPlant (key) {
      EventBus.$emit('clickOverviewPlant', key)
      console.log('clickOverviewPlant', key)
    }
  }
}
</script>

<style scoped>
  .setting :hover{
    cursor: pointer;
    color: #0056b3;
  }
</style>
