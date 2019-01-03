<template>
  <div
    class="card">
    <h5 class="card-header"><i class="fas fa-info-circle"/> Plant Detail<span class="float-right setting"><i class="fas fa-cog"/></span></h5>
    <div
      class="card-body">
      <div>
        <ul
          class="nav nav-tabs">
          <li
            v-if="!loading"
            class="nav-item">
            <a
              class="nav-link active border border-primary"
              href="#"
              @click="changeSel()"> 전체 </a>
          </li>
          <li
            v-for="(value, key) in structures"
            :key="key"
            class="nav-item">
            <a
              class="nav-link"
              href="#"
              @click="changeSel(key)">{{ key }} <span class="badge badge-secondary">{{ countTags(key) }}</span></a>
          </li>
        </ul>
        <div
          id="detail-body"
          style="height: 767px; overflow-y: auto">
          <DetailItemComp
            :ungrouped-items="filteredItems"
            :tag-freq ="tagFreq" />
        </div>
      </div>

    </div>
  </div>
</template>

<script>
import ApiHandler from '../services/ApiHandler'
import DetailItemComp from './DetailItemComp.vue'
import { EventBus } from '../services/EventBus'
import _ from 'lodash'

export default {
  name: 'MonitoringDetailComp',
  components: {
    DetailItemComp
  },
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
      structures: [],
      plant: null,
      sel: null,
      items: [],
      filteredItems: [],
      loading: true,
      tagFreq: {}
    }
  },
  created () {
    let self = this
    EventBus.$on('clickOverviewPlant', plant => {
      self.plant = plant
      self.items = this.menuItems[plant]
      self.filteredItems = this.menuItems[plant]
      // console.log('test', this.items, this.menuItems[plant], this.groupedItems)
    })
    EventBus.$on('simulation', () => {
      self.items = this.menuItems[self.plant]
      self.filteredItems = this.menuItems[self.plant]
      // console.log('test', this.items, this.menuItems[plant], this.groupedItems)
    })
    // calculate history frequency whenever update table data
    EventBus.$on('getImportant', () => {
      let hist = ApiHandler.data.important.tags
      let tags = _.reduce(this.menuItems, (a, b) => { return a.concat(b) })
      self.tagFreq = {}
      for (let i = 0; i < tags.length; i++) {
        if (tags[i].name in hist) { this.$set(self.tagFreq, tags[i].name, hist[tags[i].name].length) } else { this.$set(self.tagFreq, tags[i].name, 0) }
      }
    })
    this.callStructure()
    console.log(this.items, 'test')
  },
  methods: {
    countTags (key) {
      // console.log('countTags', key, _.groupBy(this.items, '계통'))
      let res = _.groupBy(this.items, '계통')[key]
      if (res !== undefined) { return res.length }
    },
    callStructure () {
      ApiHandler.getPlantStructure()
        .then(data => {
          this.structures = data.structure
          console.log('noncached', this.items)
          this.loading = false
        })
        .catch(err => console.log(err))
    },
    changeSel: function (newSel) {
      console.log('changeSel', newSel, this.items)
      if (newSel === undefined) {
        this.filteredItems = this.items
        return
      }
      this.filteredItems = _.groupBy(this.items, '계통')[newSel]
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
