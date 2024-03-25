import express from "express";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import { exec } from "child_process";
dotenv.config();

const app = express();
const { PORT, NODE_ENV, HOST } = process.env;

app.use(bodyParser.json());

app.get("/", (req, res) => {
  res.send("Running Github Webhook Server");
});

app.post("/events", (req, res) => {
  const payload = req.body;

  console.log(payload);

  // Check if the webhook event is a push to the production branch
  if (payload.ref === "refs/heads/main") {
    console.log("Received a push event on the prod branch");
    // TODO: Add your code to handle the push event
    // run the deployment script
    exec("bash ./deploy.sh", (error, stdout, stderr) => {
      if (error) {
        console.error(`exec error: ${error}`);
        return;
      }
      console.log(`stdout: ${stdout}`);
      console.error(`stderr: ${stderr}`);
    });
  }

  res.status(200).send("OK");
});

app.listen(PORT, HOST, () => {
  console.log(`Server is running on http://${HOST}:${PORT}`);
});
