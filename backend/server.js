require("dotenv").config()
const http = require("http");
const express = require("express");
const mongoose = require("mongoose");
const app = express();
const server = http.createServer(app);
const { initializeSocket } = require("./sockets/socketManager");
const port = process.env.PORT || 3000;
const dbURI = process.env.DB_URI || "mongodb://localhost:27017";
const frontendDomain = process.env.FRONTEND_DOMAIN
const cors = require("cors")
const session = require("express-session")
const MongoStore = require('connect-mongo');
const authRoutes = require("./routes/authRoutes")
const friendsRoutes = require("./routes/friendsRoutes")
const userRoutes = require("./routes/userRoutes")
const chatRoutes = require("./routes/chatRoutes")
const sessionMiddleware = session({
    secret: process.env.SESSION_SECRET,
    resave: true,
     cookie: { 
        sameSite: false,
        secure: true,
        partitioned: true,
        maxAge: (7 * 24 * 60 * 60 * 1000)
    },
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: dbURI }),
});

app.set('trust proxy', 1)
app.use(sessionMiddleware);
app.use(express.json());
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', frontendDomain );
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  next();
});
app.use(cors({
    origin: frontendDomain,
    methods: ["POST", "DELETE", "PATCH"],
    credentials: true
}));
mongoose.connect(dbURI)
.then(() => {
    server.listen(port, () => {
        initializeSocket(server, sessionMiddleware);
        console.log(`Server listening on port ${port}`);
    })
})
.catch(err => {
    console.log(err);
})

app.use("/", authRoutes)
app.use("/friends", friendsRoutes)
app.use("/user", userRoutes)
app.use("/chat", chatRoutes)
