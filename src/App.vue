<template>
  <v-app>
    <v-app-bar app color="dark" dark>
      <div class="d-flex align-center">
        <h1>QRcode Generator</h1>
      </div>
    </v-app-bar>
    <v-main>
      <v-container>
        <v-tabs v-model="tab" class="mt-12">
          <v-tab :disabled="Boolean(form.data.address || form.data.key)">Import from file</v-tab>
          <h2 class="pl-10 pr-10">OR</h2>
          <v-tab :disabled="Boolean(file)">Enter manually</v-tab>
        </v-tabs>
        <v-tabs-items v-model="tab" class="mb-12">
          <v-tab-item class="mt-10">
            <v-file-input
              v-model="file"
              label="File input"
              accept=".csv"
              outlined
              dense
              @change="extractDataFromFile()"
            ></v-file-input>
            <v-btn depressed @click="reset()" color="red" class="mr-4" dark>Reset</v-btn>
            <v-btn
              :loading="PDFLoader"
              :disabled="pdfLoading || !fileData.length"
              depressed
              @click="generateFromFile()"
              color="green"
              class="white--text"
            >
              Generate QRs and PDF
            </v-btn>
          </v-tab-item>
          <v-tab-item class="mt-10">
            <v-text-field
              v-model="form.data.address"
              label="Address"
              :rules="[form.rules.required]"
              outlined
            ></v-text-field>
            <v-text-field
              v-model="form.data.key"
              :append-icon="form.show1 ? 'mdi-eye' : 'mdi-eye-off'"
              :rules="[form.rules.required]"
              :type="form.show1 ? 'text' : 'password'"
              label="Key"
              outlined
              @click:append="form.show1 = !form.show1"
            ></v-text-field>
            <v-btn depressed @click="reset()" color="red" dark class="mr-4">Reset</v-btn>
            <v-btn
              :loading="PDFLoader"
              :disabled="pdfLoading || !form.data.address || !form.data.key"
              depressed
              @click="generateFromInputs()"
              color="green"
              class="white--text"
            >
              Generate QRs and PDF
            </v-btn>
          </v-tab-item>
        </v-tabs-items>
        <div v-if="Boolean(form.data.address || form.data.key)" class="mb-12 qrs-container">
          <div class="pa-12 page d-flex justify-space-between">
            <div style="max-width: 45%">
              <h3 class="text-center title">
                Address <br />
                {{ form.data.address }}
              </h3>
              <canvas class="mx-auto d-block" id="addressQRcode"></canvas>
            </div>
            <div style="max-width: 45%">
              <h3 class="text-center title">
                Key <br />
                {{ form.data.key }}
              </h3>
              <canvas class="mx-auto d-block" id="keyQRcode"></canvas>
            </div>
          </div>
        </div>
        <div v-if="fileData.length" class="qrs-container">
          <div
            v-for="(arr, arrIndex) in fileData"
            :key="arr[0].key"
            :class="`pa-12 page page-${arrIndex - 1}`"
          >
            <div
              v-for="(item, itemIndex) in arr"
              :key="item.address"
              class="d-flex flex-wrap justify-space-between mb-12"
            >
              <div class="pa-4" style="max-width: 45%">
                <h3 class="text-center title">
                  Address <br />
                  {{ item.address }}
                </h3>
                <canvas
                  class="mx-auto d-block"
                  :id="`addressQRcode${arrIndex}${itemIndex}`"
                ></canvas>
              </div>
              <div outline class="pa-4" style="max-width: 45%">
                <h3 class="text-center title">
                  Key <br />
                  {{ item.key }}
                </h3>
                <canvas class="mx-auto d-block" :id="`keyQRcode${arrIndex}${itemIndex}`"></canvas>
              </div>
            </div>
          </div>
        </div>
      </v-container>
    </v-main>
  </v-app>
</template>

<style lang="scss" scoped>
.qrs-container {
  opacity: 0;
  position: absolute;
  top: -10000vh;
  left: -1000vw;
  word-break: break-all;
}
</style>

<script>
import QRCode from 'qrcode';
import html2PDF from 'jspdf-html2canvas';

export default {
  name: 'App',

  data: () => ({
    tab: null,
    PDFLoader: null,
    pdfLoading: false,
    form: {
      data: {
        address: '',
        key: '',
      },
      show1: false,
      rules: {
        required: (value) => !!value || 'Required.',
        min: (v) => v.length >= 8 || 'Min 8 characters',
        emailMatch: () => `The email and password you entered don't match`,
      },
    },
    file: null,
    fileData: [],
  }),
  methods: {
    clearQRCodes() {
      const canvasesArr = document.querySelectorAll('canvas');
      canvasesArr.forEach((canvas) => {
        const context = canvas.getContext('2d');
        context.clearRect(0, 0, canvas.width, canvas.height);
      });
    },
    reset() {
      this.form.data.address = '';
      this.form.data.key = '';
      this.file = null;
      this.fileData = [];
      this.clearQRCodes();
      return false;
    },
    // eslint-disable-next-line consistent-return
    extractDataFromFile() {
      if (this.file === null) {
        this.fileData = [];
        return false;
      }

      const reader = new FileReader();
      reader.readAsBinaryString(this.file);
      reader.onload = () => {
        const data = reader.result.replace(/\n/g, ',').split(',');
        data.splice(0, 4);

        for (let i = 0; i < data.length; i += 2) {
          const obj = {};
          obj.address = data[i];
          obj.key = data[i + 1];
          this.fileData.push(obj);
        }

        const size = 3;
        const arr = [];

        for (let i = 0; i < this.fileData.length; i += size)
          arr.push(this.fileData.slice(i, i + size));

        this.fileData = arr;
      };
    },
    async generateFromFile() {
      this.PDFLoader = 'loading';
      this.fileData.forEach((arr, index) => {
        arr.forEach((item, itemIndex) => {
          const addressCanvas = document.querySelector(`#addressQRcode${index}${itemIndex}`);
          const keyCanvas = document.querySelector(`#keyQRcode${index}${itemIndex}`);
          QRCode.toCanvas(addressCanvas, item.address, { width: 280 });
          QRCode.toCanvas(keyCanvas, item.key, { width: 280 });
        });
      });
      await this.genereatePDF();
      this.PDFLoader = null;
      return false;
    },
    generateFromInputs() {
      this.PDFLoader = 'loading';
      Object.entries(this.form.data).forEach(([key, value]) => {
        const canvas = document.querySelector(`#${key}QRcode`);
        QRCode.toCanvas(canvas, value, { width: 280 });
      });
      this.genereatePDF();
      this.PDFLoader = null;
      return false;
    },
    async genereatePDF() {
      const nodes = document.querySelectorAll('.page');
      await html2PDF(nodes, {
        jsPDF: {
          format: 'a4',
        },
        imageType: 'image/jpeg',
        output: `./pdf/qrcodes-${new Date()
          .toLocaleString()
          .replace(/\s/g, ':')
          .replace(',', '')}.pdf`,
      });
    },
  },
};
</script>
