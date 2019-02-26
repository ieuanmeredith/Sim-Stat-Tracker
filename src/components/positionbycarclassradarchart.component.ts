import { NgModule, Input } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { Component, OnInit } from "@angular/core";
import { IRow } from "../classes/models/session";

@Component({
  selector: "pos-class-radar-chart",
  templateUrl: "views/components/app/radarchart.html"
})
export class PositionByCarClassRadarChartComponent implements OnInit {
  @Input()
  public classResults: Array<{ class: string, rows: Array<{sessionId: any, result: IRow}>}>;
  @Input()
  public name: string = "Car Class Summary";
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
      backgroundColor: "rgba(239, 40, 40, 0)",
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

    for (let i = 0; i < this.classResults.length; i++) {
      if (this.classResults[i].rows.length >= 5) {
        this.radarChartLabels.push(decodeURIComponent(this.classResults[i].class).split("+").join(" "));
        let avgResult = 0;
        let avgCarNum = 0;
        let avgiRChange = 0;
        let counter = 0;
        for (let k = 0; k < this.classResults[i].rows.length; k++) {
          if (this.classResults[i].rows[k].result.simsestypename === "Race") {
            avgResult += this.classResults[i].rows[k].result.finishposinclass;
            avgCarNum += Number(this.classResults[i].rows[k].result.carnum);
            avgiRChange +=
              (this.classResults[i].rows[k].result.newirating -
                this.classResults[i].rows[k].result.oldirating);
            counter += 1;
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
  declarations: [PositionByCarClassRadarChartModule],
  bootstrap: [PositionByCarClassRadarChartModule]
})
export class PositionByCarClassRadarChartModule { }
