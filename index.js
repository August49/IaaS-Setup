import express from "express";
import dotenv from "dotenv";
dotenv.config();

const app = express();
const { PORT, NODE_ENV, HOST } = process.env; 
 
  
app.get("/", (req, res) => {  
  res.send("Hello world!!")
}); 


app.listen(PORT, HOST, () => {
  console.log(`Server is running on http://${HOST}:${PORT}`);
});
