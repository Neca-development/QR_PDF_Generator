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
          <v-tab :disabled="Boolean(form.data.adress || form.data.key)">Import from file</v-tab>
          <h2 class="pl-10 pr-10">OR</h2>
          <v-tab :disabled="Boolean(file)">Enter manually</v-tab>
        </v-tabs>
        <v-tabs-items v-model="tab">
          <v-tab-item class="mt-10">
            <v-file-input
              v-model="file"
              label="File input"
              accept=".csv"
              outlined
              dense
              @change="extractDataFromFile()"
            ></v-file-input>
            <v-btn depressed @click="reset()" color="red" dark class="mr-4">Reset</v-btn>
            <v-btn depressed @click="generateFromFile()" color="green" dark>
              Generate QRs and PDF
            </v-btn>
          </v-tab-item>
          <v-tab-item class="mt-10">
            <v-text-field
              v-model="form.data.adress"
              label="Adress"
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
            <v-btn depressed @click="generateFromInputs()" color="green" dark>
              Generate QRs and PDF
            </v-btn>
          </v-tab-item>
        </v-tabs-items>
        <div
          v-if="Boolean(form.data.adress || form.data.key)"
          class="d-flex justify-space-between mt-12"
        >
          <v-card outline class="pa-4" width="45%">
            <h3 class="text-center title">
              Adress <br />
              {{ form.data.adress }}
            </h3>
            <canvas class="mx-auto d-block" id="adressQRcode"></canvas>
          </v-card>
          <v-card outline class="pa-4" width="45%">
            <h3 class="text-center title">
              Key <br />
              <input
                v-model="form.data.key"
                disabled
                :type="form.show1 ? 'text' : 'password'"
                style="width: 100%"
                class="text-center"
              />
            </h3>
            <canvas class="mx-auto d-block" id="keyQRcode"></canvas>
          </v-card>
        </div>
        <div v-if="fileData.length">
          <div
            v-for="(item, index) in fileData"
            :key="item.key"
            class="d-flex justify-space-between mt-12"
          >
            <v-card outline class="pa-4" width="45%">
              <h3 class="text-center title">
                Adress <br />
                {{ item.adress }}
              </h3>
              <canvas class="mx-auto d-block" :id="`adressQRcode${index}`"></canvas>
            </v-card>
            <v-card outline class="pa-4" width="45%">
              <h3 class="text-center title">
                Key <br />
                {{ item.key }}
              </h3>
              <canvas class="mx-auto d-block" :id="`keyQRcode${index}`"></canvas>
            </v-card>
          </div>
        </div>
      </v-container>
    </v-main>
  </v-app>
</template>

<script>
import QRCode from 'qrcode';

export default {
  name: 'App',

  data: () => ({
    tab: null,
    form: {
      data: {
        adress: '',
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
      this.form.data.adress = '';
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
          obj.adress = data[i];
          obj.key = data[i + 1];
          this.fileData.push(obj);
        }
      };
    },
    generateFromFile() {
      this.fileData.forEach((value, index) => {
        const adressCanvas = document.querySelector(`#adressQRcode${index}`);
        const keyCanvas = document.querySelector(`#keyQRcode${index}`);
        QRCode.toCanvas(adressCanvas, value.adress);
        QRCode.toCanvas(keyCanvas, value.key);
        return false;
      });
    },
    generateFromInputs() {
      Object.entries(this.form.data).forEach(([key, value]) => {
        const canvas = document.querySelector(`#${key}QRcode`);
        QRCode.toCanvas(canvas, value);
        return false;
      });
    },
    genereateCodes() {},
  },
};
</script>
