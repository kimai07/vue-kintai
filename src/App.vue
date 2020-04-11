<template>
  <div id="app" class="container">
    <current-date />
    <kintai />
    <kintai-table />
  </div>
</template>

<script>
import CurrentDate from "./components/CurrentDate";
import Kintai from "./components/Kintai";
import KintaiTable from "./components/KintaiTable";

export default {
  name: "app",
  components: {
    CurrentDate,
    Kintai,
    KintaiTable
  },
  data() {
    return {};
  },
  methods: {},
  mounted() {},
  computed: {}
};
</script>

<style>
#app {
  font-family: "Avenir", Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
