import { NgModule, Input } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { Component, OnInit } from "@angular/core";
import { IRow } from "../classes/models/session";
import moment = require("moment");
import { shell } from "electron";
import _ = require("lodash");

@Component({
  selector: "class-pos-line-chart",
  templateUrl: "views/components/app/linechart.html"
})
export class ClassPositionLineChartComponent implements OnInit {
  @Input()
  public classResults: { class: string, rows: Array<{sessionId: any, result: IRow}>};
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
      backgroundColor: "rgba(170, 170, 170, 0)",
      borderColor: "rgba(170, 170, 170, 0.3)",
      pointBackgroundColor: "#aaaaaa",
      pointBorderColor: "#aaaaaa",
      pointHoverBackgroundColor: "#aaaaaa",
      pointHoverBorderColor: "#aaaaaa",
    }
  ];

  public display: boolean;
  public toggleable = true;

  public ngOnInit(): void {
    console.log("linechart component initialized");

    this.lineChartData = [];
    this.lineChartLabels = [];

    this.name = this.classResults.class;

    const numberArray: number[] = [];
    const lineChartObj = {
      data: numberArray,
      label: "Position"
    };

    let averageRecord: number[] = [];
    let carNumber: number[] = [];
    let iratingChange: number[] = [];

    this.classResults.rows = _.sortBy(this.classResults.rows, [function(o) { return moment(o["result"]["sessionstarttime"]); }]);

    for (let i = 0; i < this.classResults.rows.length; i ++) {
      lineChartObj.data.push(this.classResults.rows[i].result.finishposinclass + 1);
      this.lineChartLabels.push(moment(this.classResults.rows[i].result.sessionstarttime).format("YYYY-MM-DD"));

      carNumber.push(Number(this.classResults.rows[i].result.carnum));
      iratingChange.push(this.classResults.rows[i].result.newirating - this.classResults.rows[i].result.oldirating);

      let average: number = 0;
      let counter: number = 0;
      for (let j = 1; j <= 8; j++) {
        const index = lineChartObj.data.length - j;
        if (index >= 0) {
          counter += 1;
          average += lineChartObj.data[index];
        }
        else {
          counter += 1;
          average += 0;
        }
      }
      average = average / counter;
      averageRecord.push(Math.round(average));
    }

    const trendLineChartObj = {
      data: averageRecord,
      label: "Position Trend line"
    };

    this.lineChartData.push(lineChartObj);
    this.lineChartData.push(trendLineChartObj);
    this.lineChartData.push({data: carNumber, label: "Car Number"});
    // this.lineChartData.push({data: iratingChange, label: "iRating Change"});
  }

  // events
  public chartClicked(e: any): void {
    console.log(e);
    if (e.active[0]) {
      shell.openExternal(
        `http://members.iracing.com/membersite/member/EventResult.do?&subsessionid=${this.classResults.rows[e.active[0]._index].sessionId}&custid=${this.classResults.rows[e.active[0]._index].result.custid}`
        );
    }
  }

  public chartHovered(e: any): void {
    console.log(e);
  }
}

@NgModule({
  imports: [BrowserModule],
  declarations: [ClassPositionLineChartModule],
  bootstrap: [ClassPositionLineChartModule]
})
export class ClassPositionLineChartModule { }
