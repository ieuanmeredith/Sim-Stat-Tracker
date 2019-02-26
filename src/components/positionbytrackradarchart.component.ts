import { NgModule, Input } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { Component, OnInit } from "@angular/core";
import { IRaceSession } from "../classes/models/session";

@Component({
  selector: "pos-track-radar-chart",
  templateUrl: "views/components/app/radarchart.html"
})
export class PositionByTrackRadarChartComponent implements OnInit {
  @Input()
  public trackResults: Array<{ track: string, results: Array<{ trackName: string, result: IRaceSession}>}>;
  @Input()
  public name: string = "Track Summary";
  // radarChart ng2-charts
  public radarChartData: any[] = [];
  public radarChartLabels: any[] = [];
  public radarChartOptions: any = {
    responsive: true
  };
  public radarChartLegend: boolean = true;
  public radarChartType: string = "radar";
  public radarChartColors: object[] = [
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
    console.log("radarChart component initialized");

    this.radarChartData = [];
    this.radarChartLabels = [];

    const dataArray: number[] = [];
    const radarChartObj = {
      data: dataArray,
      label: "Avg class position"
    };
    const dataArrayCarNum: number[] = [];
    const radarChartObjCarNum = {
      data: dataArrayCarNum,
      label: "Avg Car Number"
    };
    const dataArrayiRatingChange: number[] = [];
    const radarChartObjiRatingChange = {
      data: dataArrayiRatingChange,
      label: "Avg iRating Change"
    };

    for (let i = 0; i < this.trackResults.length; i++) {
      if (this.trackResults[i].results.length >= 5) {
        this.radarChartLabels.push(decodeURIComponent(this.trackResults[i].track).split("+").join(" "));
        let avgResult = 0;
        let avgCarNum = 0;
        let avgiRChange = 0;
        let counter = 0;
        for (let j = 0; j < this.trackResults[i].results.length; j++) {
          for (let k = 0; k < this.trackResults[i].results[j].result.session.rows.length; k++) {
            if (this.trackResults[i].results[j].result.session.rows[k].simsestypename === "Race"
            && this.trackResults[i].results[j].result.session.rows[k].custid.toString() === this.trackResults[i].results[j].result.customer_id
            && this.trackResults[i].results[j].result.session.max_team_drivers === 1) {
              avgResult += this.trackResults[i].results[j].result.session.rows[k].finishposinclass;
              avgCarNum += Number(this.trackResults[i].results[j].result.session.rows[k].carnum);
              avgiRChange +=
                (this.trackResults[i].results[j].result.session.rows[k].newirating -
                  this.trackResults[i].results[j].result.session.rows[k].oldirating);
              counter += 1;
            }
          }
        }
        avgResult = avgResult / counter;
        avgCarNum = avgCarNum / counter;
        avgiRChange = avgiRChange / counter;
        radarChartObj.data.push(Math.round(avgResult));
        radarChartObjCarNum.data.push(Math.round(avgCarNum));
        radarChartObjiRatingChange.data.push(Math.round(avgiRChange));
      }
    }

    this.radarChartData.push(radarChartObj);
    this.radarChartData.push(radarChartObjiRatingChange);
    this.radarChartData.push(radarChartObjCarNum);
  }

  // events
  public chartClicked(e: any): void {
    console.log(e);
  }

  public chartHovered(e: any): void {
    console.log(e);
  }
}

@NgModule({
  imports: [BrowserModule],
  declarations: [PositionByTrackRadarChartModule],
  bootstrap: [PositionByTrackRadarChartModule]
})
export class PositionByTrackRadarChartModule { }
