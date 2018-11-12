<template>
  <div class="kintai">
    <div class="contentsLineBox">
      <div id="clockin">
        <p/>
        <a href="#" class="square_btn_checkin" @click="checkoutClockin">出勤打刻</a>
        <p>出勤時刻: {{clockinAt}}</p>
      </div>
      <div id="clockout">
        <p/>
        <a href="#" class="square_btn_checkout" @click="checkoutClockout">退勤打刻</a>
        <p>退勤時刻: {{clockoutAt}}</p>
      </div>
    </div>
  </div>
</template>

<script>
import { db } from "../plugins/firebase";
import { set2num } from "../util/util.js";

export default {
  data() {
    return {
      formattedCurrentDate: {
        YYYY: "",
        MM: "",
        DD: "",
        HH: "",
        mm: ""
      },
      clockinAt: "",
      clockoutAt: "",
      workHour: "",
      workMinutes: "",
      restTime: ""
    };
  },
  methods: {
    setCurrentDateWithFormat() {
      var d = this.$moment();
      this.formattedCurrentDate.YYYY = d.format("YYYY");
      this.formattedCurrentDate.MM = d.format("MM");
      this.formattedCurrentDate.DD = d.format("DD");
      this.formattedCurrentDate.HH = d.format("HH");
      this.formattedCurrentDate.mm = d.format("mm");
    },
    getCurrentDateAtFormattedStr() {
      return (
        this.formattedCurrentDate.YYYY +
        "-" +
        this.formattedCurrentDate.MM +
        "-" +
        this.formattedCurrentDate.DD +
        " " +
        this.formattedCurrentDate.HH +
        ":" +
        this.formattedCurrentDate.mm
      );
    },
    getYearMonthFormattedStr() {
      return (
        this.formattedCurrentDate.YYYY + "-" + this.formattedCurrentDate.MM
      );
    },
    getDateFormattedStr() {
      return (
        this.formattedCurrentDate.YYYY +
        "-" +
        this.formattedCurrentDate.MM +
        "-" +
        this.formattedCurrentDate.DD
      );
    },
    setWorkTime(clockInAt, clockOutAt) {
      var a = this.$moment(clockInAt);
      var b = this.$moment(clockOutAt);
      var duration = this.$moment.duration(b.diff(a));
      var minutes = duration.asMinutes();
      var hour = parseInt(minutes / 60, 10);
      var minuteStr = this.set2num((minutes % 60).toString(10));

      var hourStr = hour.toString(10);
      var restTime = "0";
      if (hour >= 6) {
        hourStr = (hour - 1).toString(10);
        restTime = "60";
      }

      this.workHour = hourStr;
      this.workMinutes = minuteStr;
      this.restTime = restTime;
    },
    getWorkTime() {
      return this.workHour + ":" + this.workMinutes;
    },
    getRestTime() {
      return this.restTime;
    },
    checkoutClockin: function() {
      this.setCurrentDateWithFormat();
      this.clockinAt = this.getCurrentDateAtFormattedStr();
      var yearmonthStr = this.getYearMonthFormattedStr();
      var dateStr = this.getDateFormattedStr();

      db.collection("kintai")
        .add({
          yearmonth: yearmonthStr,
          date: dateStr,
          worker_id: "1",
          week_day: "",
          clock_in_at: this.clockinAt,
          clock_out_at: "",
          comment: "",
          rest_time: "",
          work_time: ""
        })
        .then(ref => {
          console.log("Added document with ID: ", ref.id); // eslint-disable-line no-console
        });
    },
    checkoutClockout: function() {
      this.setCurrentDateWithFormat();
      var clockoutAtStr = this.getCurrentDateAtFormattedStr();
      this.clockoutAt = clockoutAtStr;
      var dateStr = this.getDateFormattedStr();

      var vm = this;
      db.collection("kintai")
        .where("date", "==", dateStr)
        .get()
        .then(function(querySnapshot) {
          querySnapshot.forEach(function(doc) {
            console.log(doc.id, " => ", doc.data()); // eslint-disable-line no-console
            // Build doc ref from doc.id

            vm.setWorkTime(doc.data().clock_in_at, clockoutAtStr);
            var workTime = vm.getWorkTime();
            var restTime = vm.getRestTime();

            // console.log(workTime); // eslint-disable-line no-console
            db.collection("kintai")
              .doc(doc.id)
              .update({
                clock_out_at: clockoutAtStr,
                rest_time: restTime,
                work_time: workTime
              });
          });
        });
    },
    set2num
  }
};
</script>

<style>
.kintai {
  width: 90%;
  height: 250px;
  margin: 0 auto;
}
#clockin {
  width: 45%;
  float: left;
  background-color: #eee;
}
#clockout {
  width: 45%;
  float: right;
  background-color: #eee;
  border: 1;
  padding: 10;
}
#clockout button,
#clockin button {
  width: auto;
  padding: 0;
  margin: 0;
  background: none;
  border: 0;
  font-size: 0;
  line-height: 0;
  overflow: visible;
  cursor: pointer;
}
p {
  padding: 10px;
}
div.contentsLineBox {
  position: relative;
  border: solid 2px #ffc778;
  margin-top: 1.2em;
  padding: 1.2em 1.5em 1em 1.5em;
  /* text-align: left; */
  color: #666;
  height: 200px;
}

.square_btn_checkin {
  display: inline-block;
  padding: 0.5em 1em;
  text-decoration: none;
  background: #668ad8; /*ボタン色*/
  color: #fff;
  border-bottom: solid 4px #627295;
  border-radius: 3px;
}
.square_btn_checkin:active {
  /*ボタンを押したとき*/
  -ms-transform: translateY(4px);
  -webkit-transform: translateY(4px);
  transform: translateY(4px); /*下に動く*/
  border-bottom: none; /*線を消す*/
}

.square_btn_checkout {
  display: inline-block;
  padding: 0.5em 1em;
  text-decoration: none;
  background: #d8668a; /*ボタン色*/
  color: #fff;
  border-bottom: solid 4px #956272;
  border-radius: 3px;
}
.square_btn_checkout:active {
  /*ボタンを押したとき*/
  -ms-transform: translateY(4px);
  -webkit-transform: translateY(4px);
  transform: translateY(4px); /*下に動く*/
  border-bottom: none; /*線を消す*/
}
</style>