const express = require("express")
const http = require("http")
const Socketio = require("socket.io")
const formatMessage = require("./utils/messages")
const {userJoin,getCurrentUser,userLeave,getRoomUsers} = require("./utils/users")

const app = express()
const server = http.createServer(app)
const io = Socketio(server)

app.use(express.json())
require('dotenv').config();
const port = process.env.PORT
const {connection} = require("./config/db")

const {userRouter} = require("./routers/userroute")

const cors = require("cors")
const { Socket } = require("socket.io")
app.use(cors())

app.get("/",(req,res)=>{
    res.send("welcome to home page of my chat application")
})

app.use("/users",userRouter)

//Run when client connected
io.on("connection", socket => {

    socket.on("joinRoom",({username, room})=>{
const user = userJoin(socket.id, username, room)
    socket.join(user.room)
    //welcome user    
        socket.emit("message", formatMessage("ChatApp","welcome to chatApp"))

    // broadcast when user conenects
    socket.broadcast.to(user.room).emit("message", formatMessage("ChatApp", `${user.username} joined the chat`));

        io.to(user.room).emit("roomUsers",{
            room: user.room,
            users: getRoomUsers(user.room)
        })

    })

    // console.log("new ws client has been conneted");

   
    //listen for chat msg

    socket.on("chatMessage",msg => {

        const user = getCurrentUser(socket.id)
        io.to(user.room).emit("message", formatMessage(user.username, msg))
    })

     
    // runs when client disconnect
    socket.on("disconnect", ()=>{
        const user= userLeave(socket.id);

        if(user){

            io.to(user.room).emit("message", formatMessage("ChatApp",` ${user.username} has left the chat`))

            io.to(user.room).emit("rooUsers",{
                room: user.room,
                users: getRoomUsers(user.room)
            })
        }
    })


})

server.listen(port,async(req,res)=>{
try {
await connection
    console.log("connected to db")
} catch (error) {
    console.log("error",error)
}    console.log(`app is running at ${port}`)
})