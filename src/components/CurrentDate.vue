<template>
  <div id="current_time">
    <p>現在時刻: {{ currentDate }}</p>
  </div>
</template>

<script>
import { set2num } from "../util/util.js";

export default {
  data() {
    return {
      currentDate: ""
    };
  },
  // 中略
  methods: {
    setCurrentDate: function() {
      var currentTime = new Date();
      var currentHour = this.set2num(currentTime.getHours());
      var currentMin = this.set2num(currentTime.getMinutes());
      var currentSec = this.set2num(currentTime.getSeconds());

      this.currentDate = currentHour + ":" + currentMin + ":" + currentSec;
    },
    startCurrentDate: function() {
      let self = this;
      setInterval(function() {
        self.setCurrentDate();
      }, 1000);
    },
    set2num
  },
  mounted() {
    this.startCurrentDate();
  }
};
</script>
