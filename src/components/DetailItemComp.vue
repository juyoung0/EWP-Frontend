<template>
  <div
    class="col-sm-12 pl-0 pr-0">
    <div
      v-for="(groupedItem, key) in items"
      :key="key"
      class="card">
      <div class="card-header">
        {{ key }}
      </div>
      <div
        class="card-body row ml-0 mr-0">
        <div
          v-for="(item, idx) in groupedItem"
          :key="idx"
          class="col-sm-4 mb-2 px-1">
          <div
            class="card card-detail"
            style="cursor: pointer;"
            @click="clickDetailItem(item.name)">
            <div
              :class="{'bg-warning':item.r < 0.09}"
              class="card-header"
              style="padding-top: 6px; padding-bottom: 6px"
            >
              {{ item.name }}
              <div
                class="progress"
                title="4 / Period"
                data-toggle="tooltip">
                <div
                  :style="{width: getBarWidth(item.name) + '%'}"
                  :aria-valuenow="getBarWidth(item.name)"
                  class="progress-bar bg-warning"
                  role="progressbar"
                  aria-valuemin="0"
                  aria-valuemax="100"/>
              </div>
            </div>
            <div class="card-body pt-1 pb-1 pr-1 pl-1">
              <div
                class="card-text"
                style="display: flex">
                <div class="col-sm-3 mx-auto my-auto">
                  <!--
              <img
                src="assets/img/warning.png"
                alt="Card image cap"
                width="100%"
                height="50%"
                style="margin-top: 50%"
              >
              -->
                  <i
                    class="fas fa-exclamation-triangle"
                    style="color: red;"/>
                </div>
                <div class="col-sm-9 px-1">
                  <ul class="list-group">
                    <li class="list-group-item d-flex justify-content-between align-items-center pt-1 pb-1 px-2">
                      Predict
                      <span
                        class="badge badge-pill carousel-item-right"
                        style="background: orange; color: white">{{ item.p.toFixed(0) }}</span>
                    </li>
                    <li class="list-group-item d-flex justify-content-between align-items-center pt-1 pb-1 px-2">
                      Real
                      <span
                        class="badge badge-pill carousel-item-right"
                        style="background: steelblue; color: white"> {{ item.v.toFixed(0) }}</span>
                    </li>
                    <li class="list-group-item d-flex justify-content-between align-items-center pt-1 pb-1 px-2">
                      Prob.
                      <span
                        class="badge badge-pill carousel-item-right"
                        style="background: red; color: white">{{ item.r.toFixed(3) }}</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import _ from 'lodash'
import { EventBus } from '../services/EventBus'
import $ from 'jquery'

export default {
  name: 'DetailItemComp',
  props: {
    ungroupedItems: {
      type: Array,
      default: () => []
    },
    tagFreq: {
      type: Object,
      default: () => {}
    }
  },
  data: function () {
    return {
      loading: true
    }
  },
  computed: {
    items: function () {
      let d = _.groupBy(_.orderBy(this.ungroupedItems, 'r', 'desc'), '설비')
      return d
    }
  },
  created () {
    $('[data-toggle="tooltip"]').tooltip({ trigger: 'hover' })
  },
  methods: {
    clickDetailItem (item) {
      EventBus.$emit('clickDetailItem', item)
    },
    getBarWidth (tagName) {
      // default = 1 day (1440 min)
      console.log('getBarWidth', this.tagFreq, tagName, this.tagFreq[tagName])
      let width = this.tagFreq[tagName] / 1440 * 100
      return width
    }
  }
}
</script>

<style scoped>
</style>
