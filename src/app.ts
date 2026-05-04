import express, { Application } from "express"
import cors from 'cors'
import dotenv from 'dotenv'
import cookieParser from 'cookie-parser'

dotenv.config()
const app: Application = express()

// import data_route from "./routes/getData"
import api_route from "./routes/apiRoutes"

app.use(cors({
    origin: ["http://localhost:4200", "https://sweet-profiterole-c31e74.netlify.app"],
    credentials: true
}));
app.use(express.json());
app.use(cookieParser())

app.use('/api', api_route)
app.use(express.static('public'));

const PORT = process.env.PORT;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
