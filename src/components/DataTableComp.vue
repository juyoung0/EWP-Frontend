<template>
  <div>
    <input
      id="myInputTextField"
      type="text"
      placeholder="Searching..."
      style="width: 100%"
      class="form-control form-control-sm"
    >
    <table
      id="imptTable"
      class="table table-striped table-sm table-bordered dt-responsive nowrap text-center"
      style="width: 100%">
      <thead >
        <tr>
          <th>호기</th>
          <th>계통</th>
          <th>설비</th>
          <th>태그</th>
          <th>위험도</th>
          <th>계측치</th>
          <th>날짜</th>
        </tr>
      </thead>
    </table>
    <div
      v-if="loading"
      style="text-align: center"><i class="fas fa-cog fa-spin"/> Loading now...</div>
  </div>
</template>

<script>
import ApiHandler from '../services/ApiHandler'
import $ from 'jquery'
import 'datatables.net-bs4'
import _ from 'lodash'
import { EventBus } from '../services/EventBus'

window.jQuery = $
window.$ = $
window._ = _

export default {
  name: 'DataTableComp',
  data: function () {
    return {
      items: [],
      keys: [],
      loading: true,
      init: false,
      dt: null
    }
  },
  created () {
    console.log('impt', this.items)
    this.callImportant()
  },
  methods: {
    parseItems (data) {
      let items = _.flatMap(Object.values(data.tags)).map(item => {
        item['태그'] = item['name']
        item['위험도'] = item['r'].toFixed(3)
        item['계측치'] = item['v'].toFixed()
        item['날짜'] = item['dt']
        delete item['name']
        delete item['r']
        delete item['v']
        delete item['dt']
        return item
      })

      this.items = items
    },
    callImportant () {
      ApiHandler.getImportant()
        .then(items => {
          this.items = items
          this.loading = false
          this.keys = Object.keys(items.tags)
          this.parseItems(items)
          let table = $('#imptTable').DataTable({
            dom: '"<\'row\'<\'col-sm-12\'t>>" +\n',
            scrollY: '322px',
            scrollCollapse: true,
            paging: false,
            autoWidth: true,
            data: this.items,
            width: '100%',
            'order': [[ 6, 'desc' ], [ 4, 'desc' ]],
            columnDefs: [
              { 'width': '9%', 'targets': 0 },
              { 'width': '10%', 'targets': 1 },
              { 'width': '10%', 'targets': 4 },
              { 'width': '10%', 'targets': 5 }
            ],
            columns: [
              { data: '호기' },
              { data: '계통' },
              { data: '설비' },
              { data: '태그' },
              { data: '위험도', name: '위험도 (%)' },
              { data: '계측치' },
              { data: '날짜' }
            ]
          })

          this.dt = table

          EventBus.$on('clickDataTable', (e) => {
            setTimeout(function () {
              table.columns.adjust().draw()
            }, 10)
          })

          $('#myInputTextField').keyup(function (e) {
            if (e.keyCode === 13) {
              table.search($(this).val()).draw()
            }
          })
        })
        .catch(err => console.log(err))
    },
    refreshTable () {
      this.loading = true
      console.log('reload data', this.dt)
      this.dt.clear()
      this.dt.draw()
      ApiHandler.getImportant()
        .then(items => {
          this.loading = false
          this.keys = Object.keys(items.tags)
          this.parseItems(items)
          this.dt.rows.add(this.items)
          this.dt.draw()
        })
        .catch(err => console.log(err))
        .finally(function () {
        })
    }
  }
}
</script>

<style scoped>
</style>
