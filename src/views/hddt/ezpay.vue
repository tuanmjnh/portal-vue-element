<template>
  <div class="app-container">
    <div class="el-row">
      <el-input v-model="params.ma_tt" type="textarea" :autosize="{ minRows: 2, maxRows: 4}"
        placeholder="Mã thanh toán cần tạo nếu có">
      </el-input>
    </div>
    <div class="el-row">
      <div class="el-col el-col-24">
        <el-date-picker v-model="params.kyhoadon" type="date" format="yyyy-MM" placeholder="Kỳ hóa đơn"
          @change="onChangeKyhoadon">
        </el-date-picker>
        <el-tooltip effect="dark" :content="$t('global.add')" placement="bottom">
          <el-button type="primary" :loading="loading" @click="onSubmit">
            <svg-icon icon-class="edit-saved" />
          </el-button>
        </el-tooltip>
      </div>
    </div>
    <div class="el-row">
      <div v-if="exportData.xmlKhachHang" class="el-col el-col-6 el-xs-24 el-sm-24">
        <label>Khách hàng: </label>
        <export-data :data="exportData.xmlKhachHang" :items="[
      { title: 'Export .xml' , type: 'xml' },
      { title: 'Export .zip' , type: 'zip-xml' }
      ]" :filename="exportData.filenameKhachHang" :zipname="exportData.zipnameKhachHang" />
      </div>
      <div v-if="exportData.xmlHoadon" class="el-col el-col-6 el-xs-24 el-sm-24">
        <label>Hóa đơn: </label>
        <export-data :data="exportData.xmlHoadon" :items="[
      { title: 'Export .xml' , type: 'xml' },
      { title: 'Export .zip' , type: 'zip-xml' }
      ]" :filename="exportData.filenameHoadon" :zipname="exportData.zipnameHoadon" />
      </div>
    </div>
  </div>
</template>

<script>
import * as api from '@/api/hddt'
import * as xml from '@/utils/xml'
import ExportData from '@/components/ExportData'
export default {
  components: { ExportData },
  data() {
    return {
      loading: false,
      billTime: '',
      kindOfService: '',
      exportData: {
        xmlHoadon: '',
        xmlKhachHang: '',
        filenameHoadon: 'hoadon',
        filenameKhachHang: 'cus',
        zipnameHoadon: `hoadon_${this.billTime}`,
        zipnameKhachHang: `khachhang_${this.billTime}`
      },
      params: {
        kyhoadon: this.$moment().add(-1, 'months'),
        ma_tt: ''
      }
    }
  },
  methods: {
    onSubmit() {
      this.loading = true
      this.initData()
      api.getHDDT({
        time: this.params.kyhoadon,
        kyhoadon: this.$moment(this.params.kyhoadon).valueOf(),
        ma_tt: this.params.ma_tt ? this.params.ma_tt.split('\n') : []
      }).then(async (rs) => {
        // var xmlString = xml.objectToXml(rs)
        // console.log(xmlString)
        this.exportData.xmlHoadon = await this.createHoaDon({ data: rs, kyhoadon: this.params.kyhoadon })
        this.exportData.xmlKhachHang = await this.createKhachHang({ data: rs, kyhoadon: this.params.kyhoadon })
      }).finally(() => {
        this.reset()
      })
    },
    onChangeKyhoadon(val) {
      this.initData()
    },
    createHoaDon({ data, kyhoadon }) {
      return new Promise((resolve, reject) => {
        let xmlHoadon = `<Invoices><BillTime>${this.billTime}</BillTime>\r\n`
        for (const i of data) {
          xmlHoadon += `<Inv>`
          xmlHoadon += `<key>${i.fkey}</key>`
          xmlHoadon += `<Invoice>`
          xmlHoadon += `<CusCode>${i.ma_tt}</CusCode>`
          xmlHoadon += `<CusName><![CDATA[${i.ten_tt}]]></CusName>`
          xmlHoadon += `<CusAddress><![CDATA[${i.diachi_tt}]]></CusAddress>`
          xmlHoadon += `<CusPhone>${i.dienthoai_lh}</CusPhone>`
          xmlHoadon += `<CusTaxCode></CusTaxCode>`
          xmlHoadon += `<PaymentMethod>TM/CK</PaymentMethod>`
          xmlHoadon += `<KindOfService>${this.kindOfService}</KindOfService>`
          xmlHoadon += `<Products>`
          xmlHoadon += `<Product>`
          xmlHoadon += `<ProdName><![CDATA[Cước dịch vụ viễn thông]]></ProdName>`
          xmlHoadon += `<ProdUnit></ProdUnit>`
          xmlHoadon += `<ProdQuantity></ProdQuantity>`
          xmlHoadon += `<ProdPrice></ProdPrice>`
          xmlHoadon += `<Amount>${i.cuoc_cthue}</Amount>`
          xmlHoadon += `</Product>`
          xmlHoadon += `<Product>`
          xmlHoadon += `<ProdName><![CDATA[Cước dịch vụ Viễn thông không thuế]]></ProdName>`
          xmlHoadon += `<ProdUnit></ProdUnit>`
          xmlHoadon += `<ProdQuantity></ProdQuantity>`
          xmlHoadon += `<ProdPrice></ProdPrice>`
          xmlHoadon += `<Amount>${i.cuoc_kthue}</Amount>`
          xmlHoadon += `</Product>`
          xmlHoadon += `<Product>`
          xmlHoadon += `<ProdName><![CDATA[Chiết khấu + đa dịch vụ]]></ProdName>`
          xmlHoadon += `<ProdUnit></ProdUnit>`
          xmlHoadon += `<ProdQuantity></ProdQuantity>`
          xmlHoadon += `<ProdPrice></ProdPrice>`
          xmlHoadon += `<Amount>0</Amount>`
          xmlHoadon += `</Product>`
          xmlHoadon += `<Product>`
          xmlHoadon += `<ProdName><![CDATA[Khuyến mại]]></ProdName>`
          xmlHoadon += `<ProdUnit></ProdUnit>`
          xmlHoadon += `<ProdQuantity></ProdQuantity>`
          xmlHoadon += `<ProdPrice></ProdPrice>`
          xmlHoadon += `<Amount>${i.tien_km}</Amount>`
          xmlHoadon += `</Product>`
          xmlHoadon += `</Products>`
          xmlHoadon += `<Extra><![CDATA[${i.tuyenthu};${i.cantru};${i.tong_pt}]]></Extra>`
          xmlHoadon += `<MaThanhToan>${i.qrcode}</MaThanhToan>`
          xmlHoadon += `<Total>${i.tien}</Total>`
          xmlHoadon += `<DiscountAmount></DiscountAmount>`
          xmlHoadon += `<VATRate>10</VATRate>`
          xmlHoadon += `<VATAmount>${i.vat}</VATAmount>`
          xmlHoadon += `<Amount>${i.tong}</Amount>`
          xmlHoadon += `<AmountInWords>${i.tong_chu}</AmountInWords>`
          xmlHoadon += `</Invoice>`
          xmlHoadon += `</Inv>\r\n`
        }
        xmlHoadon += '</Invoices>'
        resolve(xmlHoadon)
      })
    },
    createKhachHang({ data, kyhoadon }) {
      return new Promise((resolve, reject) => {
        let xml = '<Customers>\r\n'
        for (const i of data) {
          xml += `<Customer>`
          xml += `<Name><![CDATA[${i.ten_tt}]]></Name>`
          xml += `<Code>${i.ma_tt}</Code>`
          xml += `<TaxCode><![CDATA[${i.ms_thue}]]></TaxCode>`
          xml += `<Address><![CDATA[${i.diachi_tt}]]></Address>`
          xml += `<BankAccountName><![CDATA[]]></BankAccountName>`
          xml += `<BankName><![CDATA[]]></BankName>`
          xml += `<BankNumber><![CDATA[]]></BankNumber>`
          xml += `<Email><![CDATA[]]></Email>`
          xml += `<Fax><![CDATA[]]></Fax>`
          xml += `<Phone><![CDATA[${i.dienthoai_lh}]]></Phone>`
          xml += `<ContactPerson><![CDATA[]]></ContactPerson>`
          xml += `<RepresentPerson><![CDATA[]]></RepresentPerson>`
          xml += `<CusType>1</CusType>`
          xml += `<MaThanhToan>${i.qrcode}</MaThanhToan>`
          xml += `</Customer>\r\n`
        }
        xml += '</Customers>'
        resolve(xml)
      })
    },
    getMaThanhToanHD(kyhoadon, ma_tt, type) {
      // Ver 1
      // string first = "0002010102112620970415010686973800115204123453037045802VN5910VIETINBANK6005HANOI6106100000";
      // Ver 2
      const first = '0002020102112620994814010686973800115204000153037045802VN5914VNPT VINAPHONE6005HANOI6106100000'
      const time = '0106' + kyhoadon
      const province = '0703' + 'BCN' // HNI
      // Portal = 1,
      // HDDT = 2,
      // HDGiay = 3,
      // AnPhamThuCuoc = 4, //(thông báo cước, biên lai, phiếu thu
      // AnPhamQLTT = 5 //bản kê thu cước
      const QRType = '0818' + '2'
      const details = type === 2 ? 'CUOC MANG DI DONG' : 'CUOC MANG CO DINH'
      const last = time + this.fixMaThanhToan(ma_tt) + province + QRType + details
      const tagLength = '62' + last.Length.ToString()
      return first + tagLength + last
      // "<MaThanhToan><![CDATA[0002010102112620970415010686973800115204123453037045802VN5909VIETINBANK6005HANOI6106100000626301060720170613  024357434690703BCN08172CUOC MANG CODINH]]></MaThanhToan>"
    },
    fixMaThanhToan(ma_cq, preFixMain = '06', dfLenght = 13) {
      ma_cq = ma_cq.Trim()
      const count = ma_cq.length
      let preFixMaCQ = ''
      if (count < dfLenght)
        for (let i = 0; i < dfLenght - count; i++) {
          preFixMaCQ = ' ' + preFixMaCQ
        }
      else if (count > dfLenght) dfLenght = count

      return preFixMain + dfLenght + ma_cq + preFixMaCQ
    },
    reset() {
      this.loading = false
    },
    initData() {
      this.billTime = this.$moment(this.params.kyhoadon).format('YYYYMM01')
      this.kindOfService = this.$moment(this.params.kyhoadon).format('MM/YYYY')
      this.exportData.xmlHoadon = ''
      this.exportData.xmlKhachHang = ''
      this.exportData.zipnameHoadon = `hoadon_${this.billTime}`
      this.exportData.zipnameKhachHang = `khachhang_${this.billTime}`
    }
  }
}
</script>

<style>
</style>
