import axios from 'axios'
import { EventBus } from './EventBus'

export default {
  data: {
    listData: null,
    structure: null,
    timelineData: null,
    important: null,
    simData: null
  },
  getAuth (username, password) {
    console.log('getAuth', username, password)
    let param = { username, password }
    let url = '/users/get_auth_token/'
    return axios.post(url, JSON.stringify(param), { headers: {
      'Content-Type': 'application/json'
    } })
      .then(res => {
        console.log('users/get_auth_token', res)
        if (res.data.token) { axios.defaults.headers.common['Authorization'] = 'Token ' + res.data.token }
        return res.data
      })
  },
  getPlantOverview () {
    return axios.get('api/listdata/')
      .then(res => {
        // after ajax call set comp1 show flag to true
        console.log('api/listdata', res)
        this.data.listData = res.data
        return res.data
      })
  },
  getPlantStructure () {
    return axios.get('api/structure')
      .then(res => {
        // after ajax call set comp1 show flag to true
        console.log('api/structure', res)
        this.data.structure = res.data
        return res.data
      })
  },
  getImportant () {
    return axios.post('api/important', JSON.stringify({ 'isSimulation': 'False' }))
      .then(res => {
        // after ajax call set comp1 show flag to true
        console.log('api/important', res)
        this.data.important = res.data
        EventBus.$emit('getImportant')
        return res.data
      })
  },
  getTimelineData (tag, start, end) {
    let st = start.split(' ')
    let ed = end.split(' ')
    let param = { 'date': [st[0], 'T', st[1], ':00.000Z'].join(''), 'date2': [ed[0], 'T', ed[1], ':00.000Z'].join(''), 'tag': tag }
    let url = '/api/data'
    return axios.post(url, JSON.stringify(param))
      .then(res => {
        console.log('api/data', res)
        this.data.timelineData = res.data
        return res.data
      })
  },
  getSimData (start, end) {
    let param = { start, end }
    let url = '/api/simulationlistdata'
    return axios.post(url, JSON.stringify(param))
      .then(res => {
        console.log('api/simulationlistdata', res)
        this.data.simData = res.data
        return res.data
      })
  }
}
