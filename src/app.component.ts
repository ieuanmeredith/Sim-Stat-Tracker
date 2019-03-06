import { NgModule, NgZone } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { Component, OnInit } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { RoadComponent } from "./components/road.component";
import { ipcRenderer, shell } from "electron";
import { ChartsModule } from "ng2-charts";
import { IRatingLineChartComponent } from "./components/iratinglinechart.component";
import low = require("lowdb");
import FileSync = require("lowdb/adapters/FileSync");
import { ClassPositionLineChartComponent } from "./components/classpositionlinechart.component";
import { PositionByTrackRadarChartComponent } from "./components/positionbytrackradarchart.component";
import { IncidentLineChartComponent } from "./components/incidentslinechart.component";
import { TrackStatsLineChartComponent } from "./components/trackstatslinechart.component";
import fs = require("fs");
import { Settings } from "./classes/settings";
import { PositionByCarClassRadarChartComponent } from "./components/positionbycarclassradarchart.component";
import { SettingsProvider } from "./classes/providers/settings/settings-provider";
import { OvalComponent } from "./components/oval.component";
import { DirtRoadComponent } from "./components/dirt-road.component";
import { DirtOvalComponent } from "./components/dirt-oval.component";
import { LicenseOverviewComponent } from "./components/licenseoverview.component";

@Component({
  selector: "App",
  templateUrl: "views/components/app/index.html"
})
export class AppComponent implements OnInit {
  public readonly name = "electron-forge";
  private authed: boolean = false;
  private currentPage: string = "";
  private settingsProvider: SettingsProvider = new SettingsProvider();
  private latestVersionNumber: string = "";
  private readonly version: string = "1.1.1";

  // database setup
  private adapter = new FileSync("db.json");
  private db = low(this.adapter);

  // sync variables
  private getCustIdReply: any;
  private syncTotalReply: any;
  private syncIncrementReply: any;
  private versionNumberReply: any;
  public syncTotal: number = 0;
  public syncCompleted: number = 0;
  public syncStage: "Fetching" | "Syncing" | "Complete";
  private custId: number;

  // settings
  public settings: Settings;

  // constructor with injected zone
  constructor(private zone: NgZone) {

  }

  public ngOnInit(): void {
    console.log("app component initialized");

    // settings init
    if (fs.existsSync("settings.json")) {
      this.settings = this.settingsProvider.loadSettings();
      if (this.settings.currentPage !== "") {
        this.navigate(this.settings.currentPage);
      }
    }
    else {
      this.settings = new Settings();
      this.settingsProvider.saveSettings(this.settings);
    }

    ipcRenderer.send("get-latest-version-number");

    // #region ipcMain replies
    this.versionNumberReply = ipcRenderer.on("get-latest-version-reply", (event: any, arg: any) => {
      if (arg) {
        this.zone.run(() => {
          this.latestVersionNumber = arg;
        });
      }
      else {
        // ERROR
      }
    });
    this.getCustIdReply = ipcRenderer.on("get-cust-id-reply", (event: any, arg: any) => {
      if (arg) {
        this.zone.run(() => {
          // BEGIN SYNC
          this.custId = arg;
          ipcRenderer.send("begin-data-sync", [arg]);
        });
      }
      else {
        // ERROR
      }
    });
    this.syncTotalReply = ipcRenderer.on("sync-total-reply", (event: any, arg: any) => {
      if (arg) {
        // SET SYNC TOTAL
        this.zone.run(() => {
          this.syncTotal = arg;
          this.syncStage = "Syncing";

          if (arg === 0) {
            this.syncStage = "Complete";
          }
        });
      }
      else {
        this.zone.run(() => {
          this.syncStage = "Complete";
        });
      }
    });
    this.syncIncrementReply = ipcRenderer.on("sync-increment-reply", (event: any, arg: any) => {
      if (arg) {
        // SET SYNC TOTAL
        this.zone.run(() => {
          this.syncCompleted += 1;
          if (this.syncCompleted === this.syncTotal) {
            this.syncStage = "Complete";
          }
        });
      }
      else {
        // ERROR
      }
    });
    // #endregion
  }

  public navigate(target: string) {
    this.currentPage = target;
    this.settings.currentPage = target;
    this.settingsProvider.saveSettings(this.settings);
  }

  public openDownload() {
    shell.openExternal("http://simstats.simracing247.com");
  }
  public coffee() {
    shell.openExternal("https://www.buymeacoffee.com/k4evKzxPp");
  }

  public manualSync() {
    this.syncCompleted = 0;
    this.syncTotal = 0;
    ipcRenderer.send("begin-data-sync", [this.custId]);
  }

  public iRacingLogin(form: any) {
    const response = ipcRenderer.sendSync("iracing-login", [form.value.username, form.value.password]);
    console.log(response);
    if (!response) {
      // set error message that login failed
      this.authed = false;
      form.error = "Login failed";
    } else {
      this.authed = response;
      this.syncStage = "Fetching";
      ipcRenderer.send("get-cust-id");
    }
  }

  public changeTheme() {
    this.settings.darkTheme = !this.settings.darkTheme;
    this.settingsProvider.saveSettings(this.settings);
  }

  public exit() {
    ipcRenderer.send("exit");
  }
  public minimize() {
    ipcRenderer.send("minimize");
  }
  public maximize() {
    ipcRenderer.send("maximize");
    this.settings.maximize = true;
    this.settingsProvider.saveSettings(this.settings);
  }
  public unmaximize() {
    ipcRenderer.send("unmaximize");
    this.settings.maximize = false;
    this.settingsProvider.saveSettings(this.settings);
  }
}

@NgModule({
  imports: [BrowserModule, FormsModule, ChartsModule],
  declarations: [
    AppComponent,
    RoadComponent,
    OvalComponent,
    DirtRoadComponent,
    DirtOvalComponent,
    IRatingLineChartComponent,
    ClassPositionLineChartComponent,
    PositionByTrackRadarChartComponent,
    IncidentLineChartComponent,
    TrackStatsLineChartComponent,
    PositionByCarClassRadarChartComponent,
    LicenseOverviewComponent
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
