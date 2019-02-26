import { NgModule, Input } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { Component, OnInit } from "@angular/core";
import { IRaceSession } from "../classes/models/session";
import { shell } from "electron";

@Component({
  selector: "incs-line-chart",
  templateUrl: "views/components/app/linechart.html"
})
export class IncidentLineChartComponent implements OnInit {
  @Input()
  public data: IRaceSession[];
  @Input()
  public name: string = "Line Chart";
  // lineChart ng2-charts
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

    this.data = this.data.sort(function compare(a, b) {
      let dateA = new Date(a.session.start_time.split("+")[0]);
      let dateB = new Date(b.session.start_time.split("+")[0]);
      return dateA.getTime() - dateB.getTime();
    });

    this.lineChartData = [];
    this.lineChartLabels = [];

    const numberArray: number[] = [];
    const lineChartObj = {
      data: numberArray,
      label: "Incidents per race"
    };

    let incsPerLap: number[] = [];
    let averageRecord: number[] = [];

    for (let i = 0; i < this.data.length; i++) {
      for (let j = 0; j < this.data[i].session.rows.length; j++) {
        if (this.data[i].session.rows[j].custid.toString() === this.data[i].customer_id
          && this.data[i].session.rows[j].simsestypename === "Race"
          && this.data[i].session.rows[j].lapscomplete > 3
          && this.data[i].session.max_team_drivers === 1) {
            lineChartObj.data.push(
              this.data[i].session.rows[j].incidents
              );
            this.lineChartLabels.push(this.data[i].session.start_time.split("+")[0]);

            incsPerLap.push(this.data[i].session.rows[j].incidents / this.data[i].session.rows[j].lapscomplete);

            let average: number = 0;
            let counter: number = 0;
            for (let k = 1; k <= 15; k++) {
              const index = lineChartObj.data.length - k;
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
            averageRecord.push(average);
          }
      }
    }
    const trendLineChartObj = {
      data: averageRecord,
      label: "Trend line"
    };

    this.lineChartData.push(lineChartObj);
    this.lineChartData.push(trendLineChartObj);
    this.lineChartData.push({data: incsPerLap, label: "Incidents Per Lap"});
  }

  public toggleView() {

  }

  // events
  public chartClicked(e: any): void {
    console.log(e);
    if (e.active[0]) {
      shell.openExternal(
        `http://members.iracing.com/membersite/member/EventResult.do?&subsessionid=${this.data[e.active[0]._index].session.subsessionid}&custid=${this.data[e.active[0]._index].customer_id}`
        );
    }
  }

  public chartHovered(e: any): void {
    console.log(e);
  }
}

@NgModule({
  imports: [BrowserModule],
  declarations: [IncidentsLineChartModule],
  bootstrap: [IncidentsLineChartModule]
})
export class IncidentsLineChartModule { }
