require("express-async-errors");
require("dotenv").config();

const express = require("express");
const app = express();

const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const socketIo = require("./utils/soketIo");
const connectDB = require("./connections/db");

const server = http.createServer(app);

// routes
const userRouter = require("./routes/user");
const gameRouter = require("./routes/game");

// error handlers middlewares
const notFountMiddleware = require("./middleware/notFound");
const errorHandlerMiddleware = require("./middleware/errorHandler");

const io = new Server(server, {
    cors: {
        origin: "http://localhost:3000",
    },
});

socketIo(io);

app.use(
    cors({
        origin: "*",
        methods: "GET,POST,PUT,DELETE",
    })
);

app.use(express.json());

app.use("/api/v1/game", userRouter);
app.use("/api/v1/game", gameRouter);

app.use(notFountMiddleware);
app.use(errorHandlerMiddleware);

const PORT = process.env.PORT || 5000;

const start = async () => {
    try {
        await connectDB(process.env.MONGO_URI);
        server.listen(PORT, () => {
            console.log(`Server is listening on port ${PORT}`);
        });
    } catch (err) {
        console.log(err);
    }
};

start();
