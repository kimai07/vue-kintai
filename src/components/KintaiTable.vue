<template>
  <div class="kintai_table">
    <!-- Table -->
    <h2>勤務表: {{ currentDate.YYYY }}年{{ currentDate.MM }}月</h2>
    <div id="other_table">
      <button @click="prev">前の月</button>
      <button @click="next">次の月</button>
    </div>
    <table border="1" width="100%">
      <!-- header -->
      <thead>
        <tr>
          <th v-for="(value, key) in columns" v-bind:key="key">
            {{ value }}
          </th>
        </tr>
      </thead>
      <!-- data -->
      <tbody>
        <tr v-for="(day, i) in kintaiDatas" v-bind:key="i">
          <td>{{ day.month }}/{{ day.day }}</td>
          <td v-bind:style="day.styleObject">{{ day.dayofweek }}</td>
          <td>{{ day.clockinDate }}</td>
          <td>{{ day.clockoutDate }}</td>
          <td>{{ day.restTime }}</td>
          <td>{{ day.comment }}</td>
          <td>{{ day.workTime }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
import { holidayList } from "../assets/holiday_list.json";
import { db } from "../plugins/firebase";
import { set2fig } from "../util/util.js";

export default {
  data() {
    return {
      holidayList: holidayList,
      currentDate: {
        YYYY: "",
        MM: "",
        DD: "",
        HH: "",
        mm: "",
        ddd: ""
      },
      columns: [
        "日付",
        "曜日",
        "出勤時刻",
        "退勤時刻",
        "休憩時間",
        "備考",
        "勤務時間"
      ],
      kintaiDatas: [],
      days_max: 0,
      display_index: 0
    };
  },
  methods: {
    setCurrentDate: function() {
      this.currentDate.YYYY = this.date.format("YYYY");
      this.currentDate.MM = this.date.format("MM");
      this.currentDate.DD = this.date.format("DD");
      this.currentDate.HH = this.date.format("HH");
      this.currentDate.mm = this.date.format("mm");
      this.currentDate.ddd = this.date.format("ddd");
    },
    isHoliday: function(dd) {
      // 年月日を取得
      // 祝日リストに日付が含まれるかどうか調べ、結果を返す

      if (2017 < this.currentDate.YYYY && this.currentDate.YYYY < 2021) {
        let h = this.holidayList[this.currentDate.YYYY][this.currentDate.MM];
        if (h == null) return false;
        return h.indexOf(dd) !== -1;
      }
      return false;
    },
    makeKintaiDatas: function() {
      var weekListEn = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
      var weekList = ["月", "火", "水", "木", "金", "土", "日"];
      const targetIndex = weekListEn.findIndex(dayofweek => {
        return dayofweek === this.currentDate.ddd;
      });
      var startIndex = (targetIndex - this.currentDate.DD + 7) % 7;

      var yearmonthTarget = this.currentDate.YYYY + "-" + this.currentDate.MM;

      var records = {};
      db.collection("kintai")
        .where("yearmonth", "==", yearmonthTarget)
        .orderBy("date", "asc")
        .get()
        .then(querySnapshots => {
          this.kintaiDatas = [];
          querySnapshots.forEach(doc => {
            // console.log(doc.id, " => ", doc.data()); // eslint-disable-line no-console
            // console.log(doc.data().clock_in_date); // eslint-disable-line no-console

            records[doc.data().date] = {
              id: doc.id,
              yearmonth: doc.data().yearmonth,
              weekday: doc.data().weekday,
              date: doc.data().date,
              workerId: doc.data().worker_id,
              clockinDate: doc.data().clock_in_at,
              clockoutDate: doc.data().clock_out_at,
              restTime: doc.data().rest_time,
              comment: doc.data().comment,
              workTime: doc.data().work_time
            };
          });
          for (var i = 1; i <= this.days_max; i++) {
            var color = "";
            var clockinDate = ""; //"9:55";
            var clockoutDate = ""; //"19:56";
            var workTime = ""; //"8:01";
            var restTime = ""; //"60";
            var comment = "";

            var day = this.set2fig(i);
            if (yearmonthTarget + "-" + day in records) {
              // console.log(yearmonthTarget + "-" + day); // eslint-disable-line no-console
              var record = records[yearmonthTarget + "-" + day];
              // console.log(record); // eslint-disable-line no-console

              restTime = record.restTime;
              comment = record.comment;
              workTime = record.workTime;

              if (record.clockinDate.indexOf(" ") >= 0) {
                // console.log(record.clockinDate); // eslint-disable-line no-console
                clockinDate = record.clockinDate.split(" ")[1];
              }
              if (record.clockoutDate.indexOf(" ") >= 0) {
                clockoutDate = record.clockoutDate.split(" ")[1];
                if (!workTime || workTime == "0:00") {
                  var a = this.$moment(record.clockinDate);
                  var b = this.$moment(record.clockoutDate);
                  var duration = this.$moment.duration(b.diff(a));
                  var minutes = duration.asMinutes();
                  var hour = parseInt(minutes / 60, 10);
                  var minuteStr = this.set2fig((minutes % 60).toString(10));

                  var hourStr = hour.toString(10);
                  restTime = "0";
                  if (hour >= 6) {
                    hourStr = (hour - 1).toString(10);
                    restTime = "60";
                  }
                  workTime = hourStr + ":" + minuteStr;
                }
              }
            }

            var day_type = (startIndex + i) % 7;

            switch (true) {
              case day_type === 5:
                color = "blue";
                break;
              case day_type === 6:
              case this.isHoliday(i) === true:
                color = "red";
                break;
              default:
            }

            this.kintaiDatas.push({
              year: this.currentDate.YYYY,
              month: this.currentDate.MM,
              day: i.toString(),
              dayofweek: weekList[day_type],
              clockinDate: clockinDate,
              clockoutDate: clockoutDate,
              comment: comment,
              restTime: restTime,
              workTime: workTime,
              styleObject: {
                color: color
              }
            });
          }
        })
        .catch(function(error) {
          console.log("Error getting documents: ", error); // eslint-disable-line no-console
        });
    },
    prev: function() {
      this.display_index -= 1;
      this.date = this.$moment().subtract(-this.display_index, "months");
      this.setCurrentDate();
      this.days_max = new Date(
        this.currentDate.YYYY,
        this.currentDate.MM,
        0
      ).getDate();
      this.makeKintaiDatas();
    },
    next: function() {
      this.display_index += 1;
      this.date = this.$moment().add(this.display_index, "months");
      this.setCurrentDate();
      this.days_max = new Date(
        this.currentDate.YYYY,
        this.currentDate.MM,
        0
      ).getDate();
      this.makeKintaiDatas();
    },
    set2fig
  },
  mounted() {
    this.date = this.$moment();
    this.setCurrentDate();
    this.days_max = new Date(
      this.currentDate.YYYY,
      this.currentDate.MM,
      0
    ).getDate();
    this.makeKintaiDatas();
  }
};
</script>

<style>
.kintai_table {
  width: 90%;
  margin: 0 auto;
}

#other_table {
  width: 100%;
  margin: 10px;
}
</style>
