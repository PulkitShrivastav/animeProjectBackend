import express, { Application } from "express"
import cors from 'cors'
import dotenv from 'dotenv'

dotenv.config()
const app: Application = express()

// import data_route from "./routes/getData"
import api_route from "./routes/apiRoutes"

app.use(cors());
app.use(express.json());

app.use('/api', api_route)

const PORT = process.env.PORT;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
