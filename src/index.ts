import mongoose from "mongoose";
import express from "express";
import job from "./jobs/job";
export const app = express();
console.log(Date.parse(new Date().toString()));
mongoose
  .connect("mongodb://localhost:27017/", {
    dbName: "test",
    user: "root",
    pass: "root",
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
  })
  .then(async (connection) => {
    app.listen(app.get("port"), () => {
      console.log(
        "App is running at http://localhost:%d in %s mode",
        app.get("port"),
        app.get("env")
      );
      console.log("Press CTRL-C to stop\n");
      job.initUuid().then(() => {
        job.refresh();
      });
    });
    app.on("close", () => {
      app.removeAllListeners();
    });
  })
  .catch((error) => console.log(error));
