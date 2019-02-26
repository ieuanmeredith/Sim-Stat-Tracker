import { NgModule, Input } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { Component, OnInit } from "@angular/core";
import { IRaceSession } from "../classes/models/session";
import { shell } from "electron";

@Component({
  selector: "irating-line-chart",
  templateUrl: "views/components/app/linechart.html"
})
export class IRatingLineChartComponent implements OnInit {
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
  public lineChartColors: object[] = [];

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
      label: "iRating"
    };

    for (let i = 0; i < this.data.length; i++) {
      for (let j = 0; j < this.data[i].session.rows.length; j++) {
        if (this.data[i].session.rows[j].custid.toString() === this.data[i].customer_id
          && this.data[i].session.rows[j].simsestypename === "Race"
          && this.data[i].session.rows[j].newirating > 0
          && this.data[i].session.max_team_drivers === 1) {
            lineChartObj.data.push(this.data[i].session.rows[j].newirating);
            this.lineChartLabels.push(this.data[i].session.start_time.split("+")[0]);
          }
      }
    }
    this.lineChartData.push(lineChartObj);
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
  declarations: [IRatingLineChartModule],
  bootstrap: [IRatingLineChartModule]
})
export class IRatingLineChartModule { }
