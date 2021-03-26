<template>
  <v-app>
    <v-app-bar app color="primary" dark>
      <div class="d-flex align-center">
        <h1>QRcode Generator</h1>
      </div>
    </v-app-bar>
    <v-main>
      <v-container>
        <v-tabs>
          <v-tab>Import from file</v-tab>
          <v-tab>Enter manually</v-tab>
        </v-tabs>
      </v-container>
    </v-main>
  </v-app>
</template>

<script>
export default {
  name: 'App',

  data: () => ({
    //
  }),
};
</script>
