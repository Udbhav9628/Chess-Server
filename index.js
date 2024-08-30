const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const connectedIds = new Map();

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
    socket.on("callUser", ({ userTocall, from, RTCsessionDescription }) => {
        console.log('In callUser - ', RTCsessionDescription);
        io.to(userTocall).emit("callUser", { from, userId: userTocall, RTCsessionDescription });
    });

    socket.on('randomCall', ({ whoIsCalling }) => {
        console.log('in this');
        let callingTo = connectedIds?.keys().next().value;
        if (callingTo === socket.id) {
            callingTo = connectedIds?.keys().next().value;
        }
        if (callingTo != socket.id) {
            console.log('This is  Calling To User - ', callingTo);
            io.to(callingTo).emit("callUser", { from: whoIsCalling, userId: callingTo });
        }
    });

    socket.on("answerCall", ({ to, opponent, sessionDescription }) => {
        io.to(to).emit("callAccepted", opponent, sessionDescription);
    });

    socket.on("ICEcandidate", (data) => {
        console.log("ICEcandidate data.calleeId", data.calleeId);
        let calleeId = data.calleeId;
        let rtcMessage = data.rtcMessage;
        console.log("socket.user emit", socket.user);

        socket.to(calleeId).emit("ICEcandidate", {
            sender: socket.user,
            rtcMessage: rtcMessage,
        });
    });

    socket.on("chessMove", ({ moveObj, towhom }) => {
        io.to(towhom).emit("chessMove", moveObj);
    });

    socket.on("disconnect", () => {
        console.log('this is disconnect');
        socket.broadcast.emit("CallEnded");
        connectedIds?.delete(socket.id)

        console.log('Set After Deleting Id -- ', socket.id);
        console.log(connectedIds);
    });

    console.log("new Clint Connected  -  " + socket.id);
    connectedIds?.set(socket.id, socket.id)

    console.log('Set After Set new Id');
    console.log(connectedIds);
});

Server.listen("8000", () => {
    console.log("Server Is Running on PORT 8000 --- ");
});
