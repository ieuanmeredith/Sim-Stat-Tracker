import { NgModule, Input } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { Component, OnInit } from "@angular/core";
import moment = require("moment");
import { shell } from "electron";
import _ = require("lodash");
import { IRaceSession } from "../classes/models/session";

@Component({
  selector: "track-stats-line-chart",
  templateUrl: "views/components/app/linechart.html"
})
export class TrackStatsLineChartComponent implements OnInit {
  @Input()
  public trackResults: { track: string, results: Array<{ trackName: string, result: IRaceSession}>};
  @Input()
  public name: string = "Line Chart";
  // lineChart ng2-charts
  public lineChartData: any[] = [];
  public lineChartLabels: any[] = [];
  public lineChartOptions: any = {
    responsive: true
  };
  public lineChartLegend: boolean = true;
  public lineChartType: string = "line";
  public lineChartColors: object[] = [
    { // blue
      backgroundColor: "rgba(56,208,255,0)",
      borderColor: "#38d0ff",
      pointBackgroundColor: "#38d0ff",
      pointBorderColor: "#38d0ff",
      pointHoverBackgroundColor: "#fff",
      pointHoverBorderColor: "#38d0ff"
    },
    { // red
      backgroundColor: "rgba(148,159,177,0)",
      borderColor: "#ef2828",
      pointBackgroundColor: "#ef2828",
      pointBorderColor: "#ef2828",
      pointHoverBackgroundColor: "#ef2828",
      pointHoverBorderColor: "#ef2828",
    },
    { // grey
      backgroundColor: "rgba(170, 170, 170, 0.1)",
      borderColor: "#aaaaaa",
      pointBackgroundColor: "#aaaaaa",
      pointBorderColor: "#aaaaaa",
      pointHoverBackgroundColor: "#aaaaaa",
      pointHoverBorderColor: "#aaaaaa",
    }
  ];

  public display = false;
  public toggleable = true;

  public ngOnInit(): void {
    console.log("linechart component initialized");

    this.lineChartData = [];
    this.lineChartLabels = [];

    this.name = decodeURIComponent(this.trackResults.track);

    const numberArray: number[] = [];
    const lineChartObj = {
      data: numberArray,
      label: "Class position"
    };

    let averageRecord: number[] = [];
    let carNumber: number[] = [];

    this.trackResults.results = _.sortBy(this.trackResults.results,
      [function(o) { return moment(o["result"]["session"]["sessionstarttime"]); }]);

    for (let l = 0; l < this.trackResults.results.length; l++) {
      for (let i = 0; i < this.trackResults.results[l].result.session.rows.length; i ++) {

        if (this.trackResults.results[l].result.session.rows[i].custid === Number(this.trackResults.results[l].result.customer_id)
        && this.trackResults.results[l].result.session.rows[i].simsestypename === "Race"
        && this.trackResults.results[l].result.session.max_team_drivers === 1) {

          lineChartObj.data.push(this.trackResults.results[l].result.session.rows[i].finishposinclass + 1);
          this.lineChartLabels.push(moment(this.trackResults.results[l].result.session.rows[i].sessionstarttime)
            .format("YYYY-MM-DD"));

          carNumber.push(Number(this.trackResults.results[l].result.session.rows[i].carnum));

          let average: number = 0;
          let counter: number = 0;
          for (let j = 1; j <= 8; j++) {
            const index = lineChartObj.data.length - j;
            if (index >= 0) {
              counter += 1;
              average += lineChartObj.data[index];
            }
          }
          average = average / counter;
          averageRecord.push(Math.round(average));
        }
      }
    }
    const trendLineChartObj = {
      data: averageRecord,
      label: "Trend line"
    };

    this.lineChartData.push(lineChartObj);
    this.lineChartData.push(trendLineChartObj);
    this.lineChartData.push({data: carNumber, label: "Car Number"});
  }

  // events
  public chartClicked(e: any): void {
    console.log(e);
    if (e.active[0]) {
      shell.openExternal(
        `http://members.iracing.com/membersite/member/EventResult.do?&subsessionid=${this.trackResults.results[e.active[0]._index].result.session.subsessionid}&custid=${this.trackResults.results[e.active[0]._index].result.customer_id}`
        );
    }
  }

  public chartHovered(e: any): void {
    console.log(e);
  }
}

@NgModule({
  imports: [BrowserModule],
  declarations: [TrackStatsLineChartModule],
  bootstrap: [TrackStatsLineChartModule]
})
export class TrackStatsLineChartModule { }
