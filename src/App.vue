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
          <v-tab>Import from file</v-tab>
          <h2 class="pl-10 pr-10">OR</h2>
          <v-tab>Enter manually</v-tab>
        </v-tabs>
        <v-tabs-items v-model="tab">
          <v-tab-item class="mt-10">
            <v-file-input label="File input" accept=".csv" outlined dense></v-file-input>
          </v-tab-item>
          <v-tab-item class="mt-10">
            <v-text-field
              v-model="adress"
              label="Adress"
              :rules="[rules.required]"
              outlined
            ></v-text-field>
            <v-text-field
              v-model="key"
              :append-icon="show1 ? 'mdi-eye' : 'mdi-eye-off'"
              :rules="[rules.required]"
              :type="show1 ? 'text' : 'password'"
              label="Key"
              outlined
              @click:append="show1 = !show1"
            ></v-text-field>
          </v-tab-item>
        </v-tabs-items>
        <v-btn depressed @click="reset()" color="red" dark class="mr-4">Reset</v-btn>
        <v-btn depressed @click="genereateCodes()" color="green" dark>Generate QRs and PDF</v-btn>
        <div class="d-flex justify-space-between mt-12">
          <v-card outline class="pa-4" width="45%">
            <h3 class="text-center title">
              Adress <br />
              {{ adress }}
            </h3>
            <canvas class="mx-auto d-block" id="adressQRcode"></canvas>
          </v-card>
          <v-card outline class="pa-4" width="45%">
            <h3 class="text-center title">
              Key <br />
              <input
                v-model="key"
                disabled
                :type="show1 ? 'text' : 'password'"
                style="width: 100%"
                class="text-center"
              />
            </h3>
            <canvas class="mx-auto d-block" id="keyQRcode"></canvas>
          </v-card>
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
    adress: '',
    key: '',
    show1: false,
    rules: {
      required: (value) => !!value || 'Required.',
      min: (v) => v.length >= 8 || 'Min 8 characters',
      emailMatch: () => `The email and password you entered don't match`,
    },
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
      this.adress = '';
      this.key = '';
      this.clearQRCodes();
      return false;
    },
    genereateCodes() {
      const adressCanvas = document.getElementById('adressQRcode');
      const keyCanvas = document.getElementById('keyQRcode');
      QRCode.toCanvas(adressCanvas, this.adress, (error) => {
        if (error) console.error(error);
        console.log('success!');
      });
      QRCode.toCanvas(keyCanvas, this.key, (error) => {
        if (error) console.error(error);
        console.log('success!');
      });
    },
  },
};
</script>
