import pdfMake from 'pdfmake/build/pdfmake'
import pdfFonts from 'pdfmake/build/vfs_fonts'
import html2canvas from 'html2canvas'
// import canvg from 'canvg'
import $ from 'jquery'
pdfMake.vfs = pdfFonts.pdfMake.vfs

var docDefinition = {
  content: [
    {
      text: 'Report',
      style: 'header'
    }
    /* 'Bulleted list example:',
    {
      // to treat a paragraph as a bulleted list, set an array of items under the ul key
      ul: [
        'Item 1',
        'Item 2',
        'Item 3',
        { text: 'Item 4', bold: true }
      ],
      style: 'list'
    },
    'Numbered list example:',
    {
      // for numbered lists set the ol key
      ol: [
        'Item 1',
        'Item 2',
        'Item 3'
      ],
      style: 'list'
    } */
  ],
  styles: {
    header: {
      fontSize: 22,
      bold: true,
      alignment: 'center'
    },
    list: {
      margin: [0, 5, 0, 15]
    },
    date: {
      fontSize: 18,
      bold: true,
      alignment: 'center'
    }
  }
}

export default {
  pdf: pdfMake.createPdf(docDefinition),
  saveToCanvas (svg) {
    var img = new Image()
    var serializer = new XMLSerializer()
    var svgStr = serializer.serializeToString(svg)
    img.src = 'data:image/svg+xml;base64,' + window.btoa(svgStr)
    // var svgImg = new Blob([svgStr], { type: 'image/svg+xml;charset=utf-8' })
    var svgImg = new Blob([svgStr], { type: 'image/svg+xml;charset=utf-8' })
    var url = window.URL.createObjectURL(svgImg)
    $('#detail-body').append('<img src="' + url + '"/>')

    /* canvas to png */
    // var svgSize = svg.getBBox()
    var canvas = document.createElement('canvas')
    // canvas.width = svgSize.width
    // canvas.height = svgSize.height
    var ctx = canvas.getContext('2d')
    img.onload = function () {
      ctx.drawImage(img, 0, 0)
      var url = canvas.toDataURL('image/png')
      docDefinition.content.push({ 'image': url, 'width': 500 })
      $('#detail-body').append('<img src="' + url + '"/>')
    }

    /* blob to base64 url */
    /*
    var reader = new FileReader()
    reader.readAsDataURL(svgImg)
    reader.onload = function () {
      var base64data = reader.result
      console.log(base64data)
      // docDefinition.content.push({ 'image': base64data, 'width': 400 })
    }
    */
  },
  makePDF () {
    return new Promise(function (resolve, reject) {
      console.log(docDefinition)
      resolve(docDefinition)
    })
  },
  screenshot () {
    console.log('Screen shot')
    var zoomWidth = $('.zoom')[0].getBBox().width
    $('.zoom')[0].setAttribute('width', '0')

    html2canvas($('#detail-body')[0], { allowTaint: true }).then(canvas => {
      var url = canvas.toDataURL('img/png', 1.0)
      docDefinition.content.push({ 'image': url, 'width': 500 })
    })

    html2canvas($('#timeline')[0], { allowTaint: true }).then(canvas => {
      var url = canvas.toDataURL('img/png', 1.0)
      docDefinition.content.push({ 'image': url, 'width': 500 })
      $('.zoom')[0].setAttribute('width', zoomWidth)
    })
  },
  sendReport () {
    console.log('Send report')
    var date = $('#sidebarToggle')[0].innerHTML
    docDefinition.content.push({ 'text': date, 'style': 'date' })
    this.screenshot()
    return this.pdf
  },
  makeReport (data) {
    var date = $('#sidebarToggle')[0].innerHTML
    docDefinition.content.push({ 'text': date, 'style': 'date' })
    this.screenshot()
  },
  downloadReport () {
    console.log('Download report')
    // this.screenshot()
    this.makePDF().then((doc) => {
      console.log(doc)
      // var pdf = pdfMake.createPdf(doc)
      // pdf.download('report.pdf')
      this.pdf.download('global.pdf')
    })
  }
}
