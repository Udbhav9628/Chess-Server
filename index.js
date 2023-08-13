const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
const Server = require("http").createServer(app);

const io = require("socket.io")(Server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"],
    },
});

app.use(cors());
app.use(bodyParser.json());

app.get("/", (req, res) => {
    return res.status(200).send("App Is Running");
});

io.on("connection", (socket) => {

    //emit for send events
    socket.emit("me", socket.id);

    //on for listen events
    socket.on("callUser", ({ userTocall, from }) => {
        io.to(userTocall).emit("callUser", { from, userId: userTocall });
    });

    socket.on("answerCall", ({ to, opponent }) => {
        console.log('This Is comming --', to, "    ", opponent);
        io.to(to).emit("callAccepted", opponent);
    });

    socket.on("chessMove", ({ moveObj, towhom }) => {
        io.to(towhom).emit("chessMove", moveObj);
    });

    socket.on("disconnect", () => {
        socket.broadcast.emit("CallEnded");
    });

    console.log("new Clint Connected  -  " + socket.id);
});

Server.listen("8000", () => {
    console.log("Server Is Running on PORT 8000 --- ");
});
