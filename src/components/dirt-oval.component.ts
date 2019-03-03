import { NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { Component, OnInit } from "@angular/core";
import FileSync = require("lowdb/adapters/FileSync");
import low = require("lowdb");
import { IRaceSession, IRow } from "../classes/models/session";
import _ = require("lodash");
import { SettingsProvider } from "../classes/providers/settings/settings-provider";

@Component({
  selector: "dirt-oval-comp",
  templateUrl: "views/components/app/dirt-oval.html"
})
export class DirtOvalComponent implements OnInit {
  public readonly name = "electron-forge";

  private adapter = new FileSync("db.json");
  private db = low(this.adapter);

  private settingsProvider: SettingsProvider = new SettingsProvider();

  private rawData: IRaceSession[];

  private queryData: IRaceSession[];

  private userRaceResults: Array<{sessionId: any, result: IRow}>;

  private userRaceResultsByClass: any;

  private userRaceResultsByTrack: any;

  public roadScope: any = {
    "irating": false,
    "incs": false,
    "class": false,
    "track": false
  };

  public dateFrom: Date;
  public dateTo: Date;

  public ngOnInit(): void {
    console.log("road component initialized");

    if (this.db.get("sessions").value().length === 0) {
      return;
    }

    this.roadScope = this.settingsProvider.loadDirtOvalSettings();

    if (!this.dateFrom || !this.dateTo) {
      this.rawData = this.db.get("sessions").orderBy(x => x.session.start_time).value()
      .filter((session: object) => session["session"]["catid"] === 3) as IRaceSession[];
      this.queryData = this.rawData;
      if (this.queryData.length === 0) {
        return;
      }

      this.dateFrom = new Date(this.rawData[0].session.start_time.split("+")[0]);
      this.dateTo = new Date(this.rawData[this.rawData.length - 1].session.start_time.split("+")[0]);
    }
    else {
      this.rawData = this.db.get("sessions").orderBy(x => x.session.start_time).value()
        .filter(session => session["session"]["catid"] === 3
        && new Date(session.session.start_time.split("+")[0]) >= this.dateFrom
        && new Date(session.session.start_time.split("+")[0]) <= this.dateTo) as IRaceSession[];
      this.queryData = this.rawData;
      if (this.queryData.length === 0) {
        return;
      }

      if (this.roadScope.irating) {
        this.roadScope.irating = false;
        setTimeout(() => { this.roadScope.irating = true; }, 50);
      }
      if (this.roadScope.incs) {
        this.roadScope.incs = false;
        setTimeout(() => { this.roadScope.incs = true; }, 50);
      }
      if (this.roadScope.class) {
        this.roadScope.class = false;
        setTimeout(() => { this.roadScope.class = true; }, 50);
      }
      if (this.roadScope.track) {
        this.roadScope.track = false;
        setTimeout(() => { this.roadScope.track = true; }, 50);
      }
    }

    this.rawData.filter(
      x => new Date(x.session.start_time.split("+")[0]) >= this.dateFrom
        && new Date(x.session.start_time.split("+")[0]) <= this.dateTo
    );

    this.userRaceResults = this.getUserRaceResults(this.queryData);

    // set results by class
    this.userRaceResultsByClass =
    _(this.userRaceResults)
    .groupBy(x => x.result.ccNameShort)
    .map((value, key) => ({ class: decodeURIComponent(key.split("+").join(" ")), rows: value}))
    .value();
    this.userRaceResultsByClass = _.sortBy(this.userRaceResultsByClass, ["class"]);

    // set results by track
    this.userRaceResultsByTrack = _(this.getResultsByTrack(this.queryData))
      .groupBy(x => x.trackName)
      .map((value, key) => ({ track: decodeURIComponent(key.split("+").join(" ")), results: value}))
      .value();
    this.userRaceResultsByTrack = _.sortBy(this.userRaceResultsByTrack, ["track"]);
  }

  public navigate (target: string) {
    this.roadScope[target] = !this.roadScope[target];
    this.settingsProvider.saveDirtOvalSettings(this.roadScope);
  }

  public filterByDate() {
    if (this.dateFrom && this.dateTo) {
      this.ngOnInit();
    }
  }
  public setDate(text: string) {
    if (text !== "") {
      return new Date(text);
    } else {
      return new Date();
    }
  }

  public isValidDate(d: any) {
    return d instanceof Date && !isNaN(d.getTime());
  }

  private getUserRaceResults(rawData: any) {
    const results = [];
    for (let i = 0; i < rawData.length; i++) {
      for (let j = 0; j < rawData[i].session.rows.length; j++) {
        if (rawData[i].session.rows[j].custid.toString() === rawData[i].customer_id
          && rawData[i].session.rows[j].simsestypename === "Race"
          && rawData[i].session.max_team_drivers === 1
          && rawData[i].session.rows[j].newirating > 0) {
            results.push({sessionId: rawData[i].id, result: rawData[i].session.rows[j]});
          }
      }
    }
    return results;
  }

  private getResultsByTrack(rawData: IRaceSession[]) {
    return rawData.map(x => {
      return {
        trackName: x.session.track_name,
        result: x
      };
    });
  }
}

@NgModule({
  imports: [BrowserModule],
  declarations: [DirtOvalModule],
  bootstrap: [DirtOvalModule]
})
export class DirtOvalModule { }
