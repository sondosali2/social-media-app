import * as dotenv from 'dotenv'
import path from 'node:path'
dotenv.config({ path: path.resolve('./Src/.env') })
import connectDB from "./Src/DB/connection.js"
import express from 'express'
import router from './Src/Modules/User/userRoute.js'
import { globalerror } from './Src/utils/asyncHandler.js'
import profilerouter from './Src/Modules/profile/profileRoute.js'
import postRoute from './Src/Modules/post/post.route.js'
import helmet from 'helmet'
import cors from 'cors'
import rateLimit from 'express-rate-limit'
const app = express()
connectDB()
///rate-limiter
const limiter = rateLimit({
  limit:5,
  windowMs:2*60*1000})
  const postLimiter = rateLimit({
    limit:3,
    windowMs:2*60*1000
  })
app.use('/user',limiter)
app.use('/post',postLimiter)
//app.use(cors())
app.use(helmet())
//cors
const whitelist = ['http://127.0.0.1:5001', 'http://localhost:5001', 'http://example2.com'];

app.use((req, res, next) => {
  const origin = req.header('origin');

  if (origin && !whitelist.includes(origin)) {
    return res.status(403).send("Not allowed by CORS");
  }

  if (origin) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Methods', '*');
  res.setHeader('Access-Control-Allow-Headers', '*');
  res.setHeader('Access-Control-Allow-Private-Network', true);

  next();
});

app.use(express.json())
app.use("/user",router)
app.use("/profile",profilerouter)
app.use("/post",postRoute)

app.use(globalerror)
app.use((req, res) => {
  res.status(404).send("<h1>404</h1>");
});
app.get("/", (req, res) => {
  res.send("Hello World!");
})
app.listen(process.env.port, () => {
    console.log(`Example app listening on port ${process.env.port}`)
})