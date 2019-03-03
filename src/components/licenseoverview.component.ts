import { NgModule, Input } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { Component, OnInit } from "@angular/core";
import { IRow } from "../classes/models/session";
import moment = require("moment");
import { shell } from "electron";

@Component({
  selector: "license-overview",
  templateUrl: "views/components/app/overview.html"
})
export class LicenseOverviewComponent implements OnInit {
  @Input()
  public data: Array<{sessionId: any, result: IRow, subsessionId: any}>;

  public irating: number;
  public totalRaces: number;
  public racesCompleted: number = 0;
  public racesDnf: number = 0;

  public lineChartData: any[] = [];
  public lineChartLabels: any[] = [];
  public lineChartOptions: any = {
    responsive: true,
    elements: {
      point: { radius: 0 }
    }
  };
  public lineChartLegend: boolean = true;
  public lineChartType: string = "line";
  public lineChartColors: object[] = [
    { // blue
      backgroundColor: "rgba(56,208,255,0.2)",
      borderColor: "rgba(56, 208, 255, 1.0)",
      pointBackgroundColor: "rgba(56, 208, 255, 1.0)",
      pointBorderColor: "rgba(56, 208, 255, 1.0)",
      pointHoverBackgroundColor: "#fff",
      pointHoverBorderColor: "rgba(56, 208, 255, 1.0)"
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
      backgroundColor: "rgba(148,159,177,0)",
      borderColor: "#dddddd",
      pointBackgroundColor: "#dddddd",
      pointBorderColor: "#dddddd",
      pointHoverBackgroundColor: "#dddddd",
      pointHoverBorderColor: "#dddddd",
    }
  ];

  public display = true;
  public toggleable = false;

  public ngOnInit(): void {
    console.log("linechart component initialized");

    if (!this.data) {
      return;
    }
    this.irating = this.data[this.data.length - 1].result.newirating;
    this.totalRaces = this.data.length;

    let dnfRecord: number[] = [];
    let compRecord: number[] = [];
    let avgDnf: number[] = [];

    for (let i = 0; i < this.data.length; i++) {
      if (this.data[i].result.reasonoutid === 0) {
        this.racesCompleted += 1;
      } else {
        this.racesDnf += 1;
      }

      if (this.racesDnf !== 0) {
        avgDnf.push(Number(this.racesCompleted / this.racesDnf));
      } else {
        avgDnf.push(this.racesCompleted);
      }

      dnfRecord.push(this.racesDnf);
      compRecord.push(this.racesCompleted);
      this.lineChartLabels.push(moment(this.data[i].result.sessionstarttime).format("YYYY-MM-DD"));
    }

    const compLineChartObj = {
      data: compRecord,
      label: "Races Completed"
    };

    const dnfLineChartObj = {
      data: dnfRecord,
      label: "Races DNF"
    };

    const avgObj = {
      data: avgDnf,
      label: "Finish:DNF Ratio"
    };

    this.lineChartData.push(compLineChartObj);
    this.lineChartData.push(dnfLineChartObj);
    this.lineChartData.push(avgObj);
  }

  public chartClicked(e: any): void {
    console.log(e);
    if (e.active[0]) {
      shell.openExternal(
        `http://members.iracing.com/membersite/member/EventResult.do?&subsessionid=${this.data[e.active[0]._index].subsessionId}&custid=${this.data[e.active[0]._index].result.custid}`
        );
    }
  }

  public chartHovered(e: any): void {
    console.log(e);
  }
}

@NgModule({
  imports: [BrowserModule],
  declarations: [LicenseOverviewModule],
  bootstrap: [LicenseOverviewModule]
})
export class LicenseOverviewModule { }
