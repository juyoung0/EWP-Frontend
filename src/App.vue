<template>
  <div>
    <!-- The Sim Modal -->
    <div
      id="simulationModal"
      class="modal fade">
      <div class="modal-dialog modal-dialog-centered modal-sm">
        <div class="modal-content">

          <!-- Modal Header -->
          <div class="modal-header">
            <h4 class="modal-title"> Replay </h4>
            <button
              type="button"
              class="close"
              data-dismiss="modal">&times;
            </button>
          </div>

          <!-- Modal body -->
          <div class="modal-body">
            Start Date: <input
              id="startDate"
              value="2015-01-01 00:00"
              width="276">
            End Date: <input
              id="endDate"
              value="2015-01-13 21:20"
              width="276">
            Interval: <input
              id="simInterval"
              class="form-control"
              role="input"
              width="276"
              value="1 (min)"
              readonly>
            Speed (millisecond): <input
              id="simSpeed"
              v-model="simSpeed"
              class="form-control"
              role="input"
              width="276"
              value="1000"
            >
          </div>

          <!-- Modal footer -->
          <div class="modal-footer">
            <span
              v-if="simLoading"><i class="fas fa-cog fa-spin"/> Loading now...</span>
            <button
              type="button"
              class="btn btn-primary"
              @click="loadSim">Run
            </button>
          </div>

        </div>
      </div>
    </div>
    <!-- Setting Modal -->
    <div
      id="timeLineSettingModal"
      class="modal fade">
      <div class="modal-dialog modal-dialog-centered modal-sm">
        <div class="modal-content">

          <!-- Modal Header -->
          <div class="modal-header">
            <h4 class="modal-title"> Time Line Settings </h4>
            <button
              type="button"
              class="close"
              data-dismiss="modal">&times;
            </button>
          </div>

          <!-- Modal body -->
          <div class="modal-body">
            <div>
              <span class="badge badge-info">
                Start Date </span><input
                  id="timeLineStartDate"
                  value="2015-01-01 00:00"
                >
            </div>
            <div class="mb-2">
              <span class="badge badge-info">
                End Date</span> <input
                  id="timeLineEndDate"
                  value="2015-01-13 21:20"
                >
            </div>
            <div class="btn-block btn-group btn-group-justified">
              <button
                type="button"
                class="btn btn-primary btn-block"
                @click="changeSettings">Apply
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
    <!-- Login Modal -->
    <div
      id="loginModal"
      class="modal fade"
      data-keyboard="false"
      data-backdrop="static">
      <div class="modal-dialog modal-dialog-centered modal-sm">
        <div class="modal-content">

          <!-- Modal Header -->
          <div class="modal-header">
            <h4 class="modal-title"><i class="fas fa-user-circle fa-fw"/> Login to EWP</h4>
          </div>

          <!-- Modal body -->
          <div class="modal-body">
            <input
              id="username"
              v-model="username"
              type="text"
              class="form-control mb-2"
              role="input"
              placeholder="Username"
              autofocus
            >
            <input
              id="password"
              v-model="password"
              type="password"
              class="form-control mb-2"
              role="input"
              placeholder="Password"
              @keyup.enter="login"
            >
            <div class="btn-group btn-group-justified btn-block mb-1">
              <button
                type="button"
                class="btn btn-primary btn-block"
                @click="login">Login
              </button>
            </div>
            <span
              v-if="loginError"
              style="color: red">Wrong username or password!</span>
          </div>

        </div>
      </div>
    </div>

    <nav
      v-if="loggedIn"
      class="navbar navbar-expand navbar-dark bg-dark static-top"
      style="margin-bottom: 0px">

      <a
        class="navbar-brand mr-1"
        href="index.html">EWP</a>

      <button
        id="sidebarToggle"
        class="btn btn-link btn-sm text-white order-1 order-sm-0"
        href="#">
        {{ time }}
      </button>

      <!-- Navbar Search
      <form class="d-none d-md-inline-block form-inline ml-auto mr-0 mr-md-3 my-2 my-md-0">
        <div class="input-group">
          <input
            type="text"
            class="form-control"
            placeholder="Search for..."
            aria-label="Search"
            aria-describedby="basic-addon2">
          <div class="input-group-append">
            <button
              class="btn btn-primary"
              type="button">
              <i class="fas fa-search"/>
            </button>
          </div>
        </div>
      </form>
      -->

      <!-- Navbar -->

      <ul class="navbar-nav ml-auto">
        <!-- sim option-->
        <div
          v-show="simTime != ''"
          class="alert alert-info float-right"
          style="margin-bottom: 0px;padding-top: 6px;padding-bottom: 0px;">
          <strong><span @click="clickSimPause"><i
            class="fa fa-pause-circle"
            aria-hidden="true"
          />
          </span>
          <i class="fas fa-cog fa-spin"/> Simulation </strong> : {{ simTime }} <span
            v-show="isSimPause"> Paused</span>
        </div>
        <!-- alert -->
        <div
          class="alert alert-danger alert-dismissible fade show"
          style="margin-bottom: 0px;padding-top: 4px;padding-bottom: 4px">
          <button
            type="button"
            class="close"
            data-dismiss="alert"
            style="padding-top: 2px;padding-bottom: 0px">&times;
          </button>
          <strong>Danger!</strong> This alert box could indicate a dangerous or potentially negative action.
        </div>
        <li
          class="nav-item mx-1"
          data-toggle="tooltip"
          title="Replay">
          <a
            class="nav-link"
            href="#"
            role="button"
            data-toggle="modal"
            data-target="#simulationModal"
          >
            <i
              class="fa fa-play-circle"
              aria-hidden="true"/>
          </a>
        </li>
        <li
          class="nav-item dropdown no-arrow mx-1"
          title="Notice"
          data-toggle="tooltip">
          <a
            id="alertsDropdown"
            class="nav-link"
            href="#"
            role="button"
            data-toggle="dropdown"
            aria-haspopup="true"
            aria-expanded="false">
            <i class="fas fa-bell fa-fw"/>
            <span class="badge badge-danger">{{ menuItemsCount }}</span>
          </a>
          <div
            class="dropdown-menu dropdown-menu-right"
            aria-labelledby="alertsDropdown">
            <a
              class="dropdown-item"
              href="#"
              @click="downloadReport">Download Report</a>
            <a
              class="dropdown-item"
              href="#"
              @click="sendReport">Email Report</a>
            <div class="dropdown-divider"/>
            <a
              class="dropdown-item"
              href="#"
              @click="makepdf">Make PDF</a>
          </div>
        </li>
        <li class="nav-item dropdown">
          <a
            id="userDropdown"
            class="nav-link"
            href="#"
            role="button"
            data-toggle="dropdown"
            aria-haspopup="true"
            aria-expanded="true">
            <i class="fas fa-user-circle fa-fw"/>
            {{ loggedUsername }}
          </a>
          <div
            class="dropdown-menu dropdown-menu-right"
            aria-labelledby="userDropdown">
            <a
              class="dropdown-item"
              href="#">Settings</a>
            <a
              class="dropdown-item"
              href="#">Activity Log</a>
            <div class="dropdown-divider"/>
            <a
              class="dropdown-item"
              href="#"
              data-toggle="modal"
              data-target="#logoutModal">Logout</a>
          </div>
        </li>
      </ul>
    </nav>
    <div
      v-if="loggedIn"
      class="wrapper">
      <!-- Sidebar
      <nav id="sidebar">
        <div class="sidebar-header">
          <h4>Monitoring</h4>
        </div>
        <MonitoringMenuComp/>
      </nav>
       -->

      <!-- Page Content  -->
      <div id="content">
        <div class="row">
          <div class="col-sm-6">
            <MonitoringOverviewComp
              :menu-items="menuItems"
              :menu-loading="menuLoading"/>
            <br>
            <div>
              <div
                id="table_line"
                class="card">
                <h5
                  class="card-header"
                  style="padding-top: 8px;padding-bottom: 8px;padding-right: 2px;">
                  <nav class="nav nav-pills">
                    <a
                      :class="{'active':dataTable}"
                      class="nav-link"
                      href="#"
                      @click="clickDataTable"
                    ><i class="fas fa-clipboard-list"/> Important Tags</a>
                    <a
                      :class="{'active':timeLine}"
                      class="nav-link"
                      href="#"
                      @click="clickTimeLine"
                    ><i class="fas fa-chart-line"/> Time Line</a>
                    <a
                      class="nav-link ml-auto"
                      href="#"
                      role="button"
                      data-toggle="modal"
                      data-target="#timeLineSettingModal"
                    ><i class="fas fa-cog"/></a>
                  </nav>

                </h5>
                <div class="card-body pr-1 pl-1 pt-2 pb-0">
                  <div v-show="dataTable">
                    <DataTableComp/>
                  </div>
                  <div v-show="timeLine">
                    <TimelineComp div-width="getWidthTableLine"/>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="col-sm-6">
            <MonitoringDetailComp
              :menu-items="menuItems"
              :menu-loading="menuLoading"/>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import MonitoringMenuComp from './components/MonitoringMenuComp.vue'
import MonitoringOverviewComp from './components/MonitoringOverviewComp.vue'
import MonitoringDetailComp from './components/MonitoringDetailComp.vue'
import DataTableComp from './components/DataTableComp.vue'
import TimelineComp from './components/TimelineComp.vue'
import ApiHandler from './services/ApiHandler'
import ReportHandler from './services/ReportHandler'
import { EventBus } from './services/EventBus'
import $ from 'jquery'
import 'gijgo'
import _ from 'lodash'

export default {
  components: {
    MonitoringMenuComp,
    MonitoringOverviewComp,
    MonitoringDetailComp,
    DataTableComp,
    TimelineComp
  },
  data: function () {
    return {
      username: '',
      password: '',
      time: Date().split('GMT')[0],
      menuItems: {},
      menuItemsCount: 'Loading',
      menuLoading: true,
      timeLine: false,
      dataTable: true,
      simLoading: false,
      simData: {},
      simTime: '',
      isSimNow: false,
      isSimPause: false,
      sim: null,
      simSpeed: '1000',
      loginError: false,
      loggedIn: false,
      loggedUsername: '',
      loggedUseremail: ''
    }
  },
  created () {
    $(document).ready(function () {
      $('#loginModal').modal()
    })
  },
  methods: {
    login () {
      ApiHandler.getAuth(this.username, this.password)
        .catch(err => {
          this.loginError = false
          console.log(err)
        })
        .then(auth => {
          this.loginError = false
          if (auth && auth.token) {
            this.loggedIn = true
            this.loggedUsername = auth.username
            this.loggedUseremail = auth.email
            this.initLoader()
            $('#loginModal').modal('hide')
          } else this.loginError = true
        })
    },
    initLoader () {
      this.callMenuItems()
      $(document).ready(function () {
        $('[data-toggle="tooltip"]').tooltip({ trigger: 'hover' })
        $('#startDate').datetimepicker({
          uiLibrary: 'bootstrap4',
          iconsLibrary: 'fontawesome',
          modal: false,
          format: 'yyyy-mm-dd HH:MM',
          value: '2015-01-12 00:00',
          maxDate: function () {
            return $('#endDate').val()
          }
        })
        $('#endDate').datetimepicker({
          uiLibrary: 'bootstrap4',
          iconsLibrary: 'fontawesome',
          format: 'yyyy-mm-dd HH:MM',
          value: '2015-01-13 00:00',
          modal: false,
          minDate: function () {
            return $('#startDate').val()
          }
        })

        $('#timeLineStartDate').datetimepicker({
          uiLibrary: 'bootstrap4',
          iconsLibrary: 'fontawesome',
          value: '2015-01-12 00:00',
          modal: false,
          format: 'yyyy-mm-dd HH:MM'
        })
        $('#timeLineEndDate').datetimepicker({
          uiLibrary: 'bootstrap4',
          iconsLibrary: 'fontawesome',
          value: '2015-01-13 00:00',
          modal: false,
          format: 'yyyy-mm-dd HH:MM'
        })

        setInterval(function () {
          self.time = Date().split('GMT')[0]
        }, 1000)
      })
    },
    changeSettings () {
      EventBus.$emit('TimlineSettingChanged')
      $('#timeLineSettingModal').modal('hide')
    },
    callMenuItems () {
      ApiHandler.getPlantOverview()
        .then(items => {
          for (let key in items.plant) {
            items.plant[key] = items.plant[key].sort((a, b) => a.r > b.r)
          }
          this.menuItems = items.plant
          // EventBus.$emit('updateOverview', items.plant)
          this.menuLoading = false
          // this.menuItemsCount = Object.values(items.plant).flatMap((a) => { return a }).length
          this.menuItemsCount = _.flatten(Object.values(items.plant)).length
        })
        .catch(err => console.log(err))
    },
    clickTimeLine () {
      this.timeLine = true
      this.dataTable = false
      // EventBus.$emit('clickTimeLine')
    },
    clickDataTable () {
      this.timeLine = false
      this.dataTable = true
      EventBus.$emit('clickDataTable')
    },
    loadSim () {
      let self = this
      this.simLoading = true
      this.isSimNow = true
      console.log(this.isSimNow, 'isSimNow')
      let start = $('#startDate').val().split(' ')
      let end = $('#endDate').val().split(' ')
      console.log('loadSim', start[0] + 'T' + start[1] + ':00.000Z', end[0] + 'T' + end[1] + ':00.000Z')
      ApiHandler.getSimData(start[0] + 'T' + start[1] + ':00.000Z', end[0] + 'T' + end[1] + ':00.000Z')
        .then(data => {
          console.log('sim-loaded', data)
          let times = Object.keys(data)
          let timeLen = times.length - 1
          let timeIdx = 0

          let sim = function () {
            $('#simulationModal').modal('hide')
            $('.alert-danger').alert('close')
            self.isSimNow = true
            console.log(self.isSimNow, 'isSimNow')
            // update Overview
            self.simLoading = false
            self.simTime = times[timeIdx]
            let items = data[times[timeIdx]]
            for (let key in items.plant) {
              items.plant[key] = items.plant[key].sort((a, b) => a.r > b.r)
            }
            self.menuItems = items.plant
            // self.menuLoading = false
            self.menuItemsCount = _.flatten(Object.values(items.plant)).length
            EventBus.$emit('simulation')
            console.log('sim', self.simTime, self.menuItems, timeIdx++, timeLen)
            if (timeIdx === timeLen) {
              self.simTime = ''
              self.isSimNow = false
              alert('Simulation ends.')
              return
            }
            console.log('sim', !self.isSimPause, sim)
            if (!self.isSimPause) setTimeout(sim, Number(self.simSpeed))
          }
          this.sim = sim
          sim()
        })
    },
    downloadReport () {
      ReportHandler.downloadReport()
    },
    sendReport () {
      let pdf = ReportHandler.sendReport()
      pdf.getDataUrl(function (url) {
        window.sendEmail(url)
      })
    },
    makepdf () {
      ReportHandler.makeReport()
    },
    clickSimPause () {
      console.log('clickSimPause')
      this.isSimPause = !this.isSimPause
      if (!this.isSimPause) this.sim()
    }
  }
}
</script>
<style scoped>
  .nav-pills .nav-link.active, .nav-pills .show > .nav-link {
    color: inherit;
    background-color: lightgray;
  }
</style>
