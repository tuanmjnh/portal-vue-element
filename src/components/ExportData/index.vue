<template>
  <el-dropdown trigger="click" class="export-data" @command="Export">
    <el-button type="primary" plain size="mini">
      <svg-icon :icon-class="icon" />
    </el-button>
    <el-dropdown-menu slot="dropdown">
      <el-dropdown-item v-for="(item, i) in items" :key="i" :command="item">
        {{ item.title }}
      </el-dropdown-item>
    </el-dropdown-menu>
  </el-dropdown>
</template>

<script>
import moment from 'moment'
import JSZip from 'jszip'
export default {
  props: {
    data: { type: [Array, String], default: null },
    getData: { type: Function, default: () => { } },
    icon: { type: String, default: 'download' }, // more_vert
    tooltip: { type: String, default: 'Export' },
    color: { type: String, default: 'default' },
    filename: { type: String, default: 'export' },
    zipname: { type: String, default: 'export' },
    suffixFileName: { type: Boolean, default: false },
    items: {
      type: Array,
      default: () => [
        { title: 'Export .csv', type: 'csv' },
        { title: 'Export .xml', type: 'xml' },
        { title: 'Export .pdf', type: 'pdf' },
        { title: 'Export .sql', type: 'sql' }
      ]
    }
  },
  data: () => ({}),
  methods: {
    Export(item) {
      if (item.type === 'csv') {
        this.getData().then((x) => {
          if (!x) {
            console.log('No data available!')
            return
          }
          // console.log(x.has)
          this.ExportCSV(x)
        })
      } else if (item.type === 'xml') {
        this.ExportXML(this.data)
      } else if (item.type === 'zip-xml') {
        this.ExportZipXML(this.data)
      }
    },
    ExportCSV(data = []) {
      // console.log(data)
      if (data.length < 1) {
        console.log('No data available!')
        return
      }
      let csvContent = ''// "data:text/csv;charset=utf-8,"
      csvContent += [
        `"${Object.keys(data[0]).join('","')}"`,
        ...data.map(item => `"${Object.values(item).join('","')}"`)
      ].join('\r\n').replace(/(^\[)|(\]$)/gm, '')
      var BOM = '\uFEFF'
      // encodeURI(csvContent)
      var blob = new Blob([BOM + csvContent], { type: 'text/plain;charset=utf-8' }) // 'text/csvcharset=utf-8'
      var csvUrl = window.webkitURL.createObjectURL(blob)
      const link = document.createElement('a')
      link.setAttribute('href', csvUrl)
      link.setAttribute('download', `${this.suffixFileName ? `${this.filename}_${moment().format('YYYYMMDDhhmmss')}` : this.filename}.csv`)
      link.click()
      // const link = document.createElement("a")
      // link.setAttribute("href", data)
      // link.setAttribute("download", "export.csv")
      // link.click()
    },
    ExportXML(xmlString) {
      if (!xmlString) {
        console.log('No data available!')
        return
      }
      var BOM = '\uFEFF'
      var blob = new Blob([BOM + xmlString], { type: 'text/xml;charset=utf-8' }) //  'text/xml;charset=utf-8'
      var url = window.webkitURL.createObjectURL(blob)
      const link = document.createElement('a')
      link.setAttribute('href', url)
      link.setAttribute('download', `${this.suffixFileName ? `${this.filename}_${moment().format('YYYYMMDDhhmmss')}` : this.filename}.xml`)
      link.click()
    },
    ExportZipXML(xmlString) {
      if (!xmlString) {
        console.log('No data available!')
        return
      }
      const zip = new JSZip()
      zip.file(`${this.filename}.xml`, xmlString)
      zip.generateAsync({ type: 'blob' })
        .then((blob) => {
          // saveAs(blob, `${this.zipname}.zip`)
          var url = window.webkitURL.createObjectURL(blob)
          const link = document.createElement('a')
          link.setAttribute('href', url)
          link.setAttribute('download', `${this.suffixFileName ? `${this.zipname}_${moment().format('YYYYMMDDhhmmss')}` : this.zipname}.zip`)
          link.click()
        })
        .catch((err) => {
          console.log(err)
        })
    },
    ex() {
      var CSV = ''
      var ShowLabel = true
      var arrData = []
      var filename = 'a'
      // This condition will generate the Label/Header
      // if (ShowLabel) {
      //   var head = ""

      //   //This loop will extract the label from 1st index of on array
      //   for (var index in arrData[0]) {
      //     //Now convert each value to string and comma-seprated
      //     head += index + ','
      //   }
      //   head = head.slice(0, -1)
      //   //append Label row with line break
      //   CSV += head + '\r\n'
      // }

      // 1st loop is to extract each row
      for (var i = 0; i < arrData.length; i++) {
        var row = ''
        // 2nd loop will extract each column and convert it in string comma-seprated
        for (var index in arrData[i]) {
          row += '"' + arrData[i][index] + '",'
        }
        row.slice(0, row.length - 1)
        // add a line break after each row
        CSV += row + '\r\n'
      }

      if (CSV === '') {
        alert('Invalid data')
        return
      }

      // this trick will generate a temp "a" tag
      var link = document.createElement('a')
      link.id = 'lnkDwnldLnk'

      // this part will append the anchor tag and remove it after automatic click
      document.body.appendChild(link)

      var BOM = '\uFEFF'
      var csv = BOM + CSV
      var blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
      var csvUrl = window.webkitURL.createObjectURL(blob)
      filename = filename + '.csv'
      // $("#lnkDwnldLnk").attr({ 'download': filename, 'href': csvUrl })
      // $('#lnkDwnldLnk')[0].click()
      // document.body.removeChild(link)
    }
  }
}
</script>

<style>
/* .export-data {
  padding: 8px;
  cursor: pointer;
} */
/* .export-data svg {
  width: 26px!important;
  height: 26px!important;
} */
</style>
