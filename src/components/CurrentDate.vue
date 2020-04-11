<template>
  <div id="current_time">
    <p>現在時刻: {{ currentDateStr }}</p>
  </div>
</template>

<script>
import { set2fig } from "../util/util.js";

export default {
  data() {
    return {
      currentDateStr: ""
    };
  },
  // 中略
  methods: {
    getCurrentDate: function() {
      var currentTime = new Date();
      var currentHour = set2fig(currentTime.getHours());
      var currentMin = set2fig(currentTime.getMinutes());
      var currentSec = set2fig(currentTime.getSeconds());
      return currentHour + ":" + currentMin + ":" + currentSec;
    },
    currentDate: function() {
      this.currentDateStr = this.getCurrentDate();
    },
    startCurrentDate: function() {
      let self = this;
      setInterval(function() {
        self.currentDate();
      }, 1000);
    }
  },
  mounted() {
    this.startCurrentDate();
  }
};
</script>
