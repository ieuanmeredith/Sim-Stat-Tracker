import { app, BrowserWindow, ipcMain } from "electron";
import { enableLiveReload } from "electron-compile";
import rp = require("request-promise");
import { LoginHandler } from "./classes/auth/login-handler";
import low = require("lowdb");
import FileSync = require("lowdb/adapters/FileSync");
import path = require("path");
import fs = require("fs");
import ChildProcess = require("child_process");

if (require("electron-squirrel-startup")) {
  const appFolder = path.resolve(process.execPath, "..");
  const rootAtomFolder = path.resolve(appFolder, "..");
  const updateDotExe = path.resolve(path.join(rootAtomFolder, "Update.exe"));
  const exeName = path.basename(process.execPath);

  const spawn = function(command: any, args: any) {
    let spawnedProcess;
    try {
      spawnedProcess = ChildProcess.spawn(command, args, {detached: true});
    } catch (error) {}

    return spawnedProcess;
  };

  const spawnUpdate = function(args: any) {
    return spawn(updateDotExe, args);
  };

  const squirrelEvent = process.argv[1];
  switch (squirrelEvent) {
    case "--squirrel-install":
    case "--squirrel-updated":
      // Optionally do things such as:
      // - Add your .exe to the PATH
      // - Write to the registry for things like file associations and
      //   explorer context menus

      // Install desktop and start menu shortcuts
      spawnUpdate(["--createShortcut", exeName]);

      setTimeout(app.quit, 1000);

    case "--squirrel-uninstall":
      // Undo anything you did in the --squirrel-install and
      // --squirrel-updated handlers

      // remove settings files
      if (fs.existsSync("settings.json")) {
        fs.unlinkSync("settings.json");
      }
      if (fs.existsSync("road-settings.json")) {
        fs.unlinkSync("road-settings.json");
      }
      if (fs.existsSync("oval-settings.json")) {
        fs.unlinkSync("oval-settings.json");
      }
      if (fs.existsSync("dirt-road-settings.json")) {
        fs.unlinkSync("dirt-road-settings.json");
      }
      if (fs.existsSync("dirt-oval-settings.json")) {
        fs.unlinkSync("dirt-oval-settings.json");
      }
      // remove db
      if (fs.existsSync("db.json")) {
        fs.unlinkSync("db.json");
      }

      // Remove desktop and start menu shortcuts
      spawnUpdate(["--removeShortcut", exeName]);

      setTimeout(app.quit, 1000);

    case "--squirrel-obsolete":
      // This is called on the outgoing version of your app before
      // we update to the new version - it's the opposite of
      // --squirrel-updated

      app.quit();
    default:
      app.quit();
  }
}

const adapter = new FileSync("db.json");
const db = low(adapter);
// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow: Electron.BrowserWindow | null;

// global db reference
// Set some defaults (required if your JSON file is empty)
db.defaults({ sessionIds: [], sessions: [] })
  .write();

let authcookie: string | null = null;
let custId: number = 0;

const isDevMode = process.execPath.match(/[\\/]electron/);

if (isDevMode) { enableLiveReload(); }

const createWindow = async () => {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    icon: path.join(__dirname, "./assets/app-icon/png/64.png"),
    frame: false
  });

  // and load the index.html of the app.
  mainWindow.loadURL(`file://${__dirname}/index.html`);

  if (fs.existsSync("settings.json")) {
    if (JSON.parse(fs.readFileSync("settings.json", "utf8")).maximize) {
      mainWindow.maximize();
    }
  }

  // Open the DevTools.
  if (isDevMode) {
    mainWindow.webContents.openDevTools();
  }

  // Emitted when the window is closed.
  mainWindow.on("closed", () => {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null;
  });
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", createWindow);

// Quit when all windows are closed.
app.on("window-all-closed", () => {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.

ipcMain.on("exit", () => {
  app.quit();
});
ipcMain.on("maximize", () => {
  if (mainWindow != null) {
    mainWindow.maximize();
  }
});
ipcMain.on("unmaximize", () => {
  if (mainWindow != null) {
    mainWindow.unmaximize();
  }
});
ipcMain.on("minimize", () => {
  if (mainWindow != null) {
    mainWindow.minimize();
  }
});

ipcMain.on("iracing-login", (event: any, arg: any) => {
  // create login request
  let request =
    rp.post(`https://members.iracing.com/membersite/Login?username=${arg[0]}&password=${arg[1]}`,
      {
        timeout: 5000,
        simple: false,
        resolveWithFullResponse: true,
        jar: true
      });

  // attempt login and process cookies
  request.then(function (response: any) {
    const loginResponse = LoginHandler.login(response);

    if (loginResponse.authcookie !== null) {
      authcookie = loginResponse.authcookie;
      event.returnValue = true;
    }
    else {
      event.returnValue = false;
    }
  })
  .catch(function (err: any) {
      // in the event of any error, return false
      // TODO: add file system logging
      console.log(err);
      event.returnValue = false;
      // event.sender.send("iracing-login-reply", false);
  });
});

ipcMain.on("get-latest-version-number", (event: any, arg: any) => {
  const options = {
    uri: "http://simstats.simracing247.com/v.txt",
    simple: false,
    resolveWithFullResponse: true
  };

  const versionNumber = rp.get(options);
  versionNumber.then((response: any) => {
    event.sender.send("get-latest-version-reply", response.body);
  });
});

ipcMain.on("get-cust-id", (event: any, arg: any) => {
  const options = {
    uri: "http://members.iracing.com/membersite/member/Profile.do",
    headers: {
        Cookie: `${authcookie};`
    },
    simple: false,
    resolveWithFullResponse: true
  };

  const custIdRequest = rp.get(options);
  custIdRequest.then((response: any) => {
    const custIdIndex = response.body.indexOf("this.currentCustId = ");
    custId = response.body.substring(custIdIndex + 21, custIdIndex + 100).split(";")[0];

    console.log(custId);
    event.sender.send("get-cust-id-reply", custId);
  })
  .catch((err) => {
    console.log(err);
    event.sender.send("get-cust-id-reply", false);
  });
});

ipcMain.on("begin-data-sync", (event: any, arg: any) => {
  // 1st Jan 2008
  const startDate: Date = new Date(1199113200000);
  const numberOfYearsToGet = (new Date().getFullYear()) - (startDate.getFullYear());
  let data: object[] = [];
  let yearsRetrieved: number = 0;

  // get results by year to avoid timeout for members with large numbers of races.
  for (let i = 0; i <= numberOfYearsToGet; i++) {
    const deltaStartDate = new Date(startDate);
    deltaStartDate.setFullYear(deltaStartDate.getFullYear() + i);

    const deltaEndDate = new Date(deltaStartDate);
    deltaEndDate.setFullYear(deltaEndDate.getFullYear() + 1);

    const options = {
      uri: `http://members.iracing.com/memberstats/member/GetResults?custid=${arg[0]}&showraces=1&showquals=0&showtts=0&showops=0&showofficial=1&showunofficial=0&showrookie=0&showclassd=1&showclassc=1&showclassb=1&showclassa=1&showpro=1&showprowc=1&lowerbound=0&upperbound=250000&sort=start_time&order=desc&format=json&category%5B%5D=1&category%5B%5D=2&category%5B%5D=3&category%5B%5D=4&starttime_low=${deltaStartDate.getTime()}&starttime_high=${deltaEndDate.getTime()}`,
      headers: {
          Cookie: `${authcookie};`
      },
      simple: false,
      resolveWithFullResponse: true
    };

    const resultsRequest = rp.get(options);

    setTimeout(function() {
      resultsRequest.then((response: any) => {
        const resultsData: object = JSON.parse(response.body).d.r;
        if (resultsData) {
          data = data.concat(resultsData);
        }

        yearsRetrieved += 1;

        if (yearsRetrieved > numberOfYearsToGet) {
          const sessionsToSync: Array<{id: string, customer_id: number}> = [];

          for (let j = 0; j < data.length; j++) {
            const sessionId = db.get("sessionIds")
              .find({ id: data[j]["41"], customer_id: custId})
              .value();
            if (!sessionId) {
              db.get("sessionIds")
              .push({ id: data[j]["41"], customer_id: custId})
              .write();
            }
          }

          // create delta array of results not yet sync'd
          const sessionIds = db.get("sessionIds").value();
          for (let j = 0; j < sessionIds.length; j++) {
            const sessionId = db.get("sessions")
            .find({customer_id: custId, id: sessionIds[j].id})
            .value();

            if (!sessionId) {
              sessionsToSync.push(sessionIds[j]);
            }
          }

          event.sender.send("sync-total-reply", sessionsToSync.length);
          let counter = 0;
          for (let j = 0; j < sessionsToSync.length; j++) {
            const sessionId = db.get("sessions")
            .find({customer_id: custId, id: sessionsToSync[j].id})
            .value();

            if (sessionId) {
              continue;
            }
            // send request
            setTimeout(function() {
              const sessionoptions = {
                uri: `http://members.iracing.com/membersite/member/GetSubsessionResults?subsessionID=${sessionsToSync[j].id}`,
                headers: {
                    Cookie: `${authcookie};`
                },
                timeout: 10 * 1000,
                simple: false,
                resolveWithFullResponse: true
              };

              const sessionRequest = rp.get(sessionoptions);
              sessionRequest.then((sessionresponse: any) => {
                if (sessionresponse.statusCode === 200)  {
                  const sessiondata = JSON.parse(sessionresponse.body);

                  sessiondata.rows = sessiondata.rows.filter(
                    (row: any) => row.custid.toString() === custId.toString() &&
                                  row.simsestypename === "Race"
                  );

                  db.get("sessions")
                  .push({customer_id: custId, id: sessiondata.subsessionid, session: sessiondata})
                  .write();

                  event.sender.send("sync-increment-reply", true);
                }
                else {
                  console.log(sessionresponse.statusCode);
                  console.log(sessionresponse.statusMessage);
                }
              }).error(err => {
                console.log(err);
              })
              .catch(err => {
                console.log(err);
              });
            }, (counter * 1000));
            counter += 1;
          }
        }
      });
    }, 300);
  }
});
