import { Settings } from "../../settings";
import fs = require("fs");

export class SettingsProvider {
    public loadSettings(): Settings {
        const file = fs.readFileSync("./settings.json", "utf8");
        const settingobj = JSON.parse(file);
        return settingobj as Settings;
      }

    public saveSettings(settings: Settings): void {
    fs.writeFile("./settings.json", JSON.stringify(settings), (err) => {
        if (err) { console.log(err); }
    });
    }

    public loadRoadSettings(): object {
        if (fs.existsSync("./road-settings.json")) {
            const file = fs.readFileSync("./road-settings.json", "utf8");
            const settingobj = JSON.parse(file);
            return settingobj as object;
        } else {
            return {
                "irating": false,
                "incs": false,
                "class": false,
                "track": false
              } as object;
        }
    }
    public saveRoadSettings(settings: object): void {
        fs.writeFile("./road-settings.json", JSON.stringify(settings), (err) => {
            if (err) { console.log(err); }
        });
    }

    public loadOvalSettings(): object {
        if (fs.existsSync("./oval-settings.json")) {
            const file = fs.readFileSync("./oval-settings.json", "utf8");
            const settingobj = JSON.parse(file);
            return settingobj as object;
        } else {
            return {
                "irating": false,
                "incs": false,
                "class": false,
                "track": false
              } as object;
        }
    }
    public saveOvalSettings(settings: object): void {
        fs.writeFile("./oval-settings.json", JSON.stringify(settings), (err) => {
            if (err) { console.log(err); }
        });
    }

    public loadDirtOvalSettings(): object {
        if (fs.existsSync("./dirt-oval-settings.json")) {
            const file = fs.readFileSync("./dirt-oval-settings.json", "utf8");
            const settingobj = JSON.parse(file);
            return settingobj as object;
        } else {
            return {
                "irating": false,
                "incs": false,
                "class": false,
                "track": false
              } as object;
        }
    }
    public saveDirtOvalSettings(settings: object): void {
        fs.writeFile("./dirt-oval-settings.json", JSON.stringify(settings), (err) => {
            if (err) { console.log(err); }
        });
    }

    public loadDirtRoadSettings(): object {
        if (fs.existsSync("./dirt-road-settings.json")) {
            const file = fs.readFileSync("./dirt-road-settings.json", "utf8");
            const settingobj = JSON.parse(file);
            return settingobj as object;
        } else {
            return {
                "irating": false,
                "incs": false,
                "class": false,
                "track": false
              } as object;
        }
    }
    public saveDirtRoadSettings(settings: object): void {
        fs.writeFile("./dirt-road-settings.json", JSON.stringify(settings), (err) => {
            if (err) { console.log(err); }
        });
    }
}
