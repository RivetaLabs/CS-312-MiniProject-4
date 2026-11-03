import express from "express";
import session from "express-session";
import { randomUUID } from "node:crypto";

const app = express();
const port = process.env.PORT || 3000;
const users = [];
const posts = [];

app.use(express.json());
app.use(session({
    secret: process.env.SESSION_SECRET || randomUUID(),
    resave: false,
    saveUninitialized: false,
    cookie: { sameSite: "lax" }
}));

app.get("/api/posts", (req, res) => {
    res.json({ posts, user: req.session.user || null });
});

app.post("/api/signup", (req, res) => {
    const { user_id, password, name } = req.body || {};

    if (typeof user_id !== "string" || typeof password !== "string" ||
        typeof name !== "string" || !user_id.trim() || !password.trim() ||
        !name.trim() || user_id.length > 255 || password.length > 255 || name.length > 255) {
        return res.status(400).json({ error: "Too long or two short" });
    }
    if (users.find(user => user.user_id === user_id.trim())) {
        return res.status(409).json({ error: "That is taken." });
    }
    users.push({ user_id: user_id.trim(), password, name: name.trim() });
    res.status(201).json({ message: "Account created." });
});

app.post("/api/signin", (req, res, next) => {
    const { user_id, password } = req.body || {};
    if (typeof user_id !== "string" || typeof password !== "string") {
        return res.status(400).json({ error: "Enter your user ID and password." });
    }
    const user = users.find(user => user.user_id === user_id.trim() && user.password === password);
    if (!user) {
        return res.status(401).json({ error: "Incorrect user ID or password." });
    }
    req.session.regenerate(error => {
        if (error) return next(error);
        req.session.user = { user_id: user.user_id, name: user.name };
        res.json({ user: req.session.user });
    });
});

app.use("/api/posts", (req, res, next) => {
    if (!req.session.user) {
        return res.status(401).json({ error: "You have to Sign in first." });
    }
    next();
});

app.post("/api/posts", (req, res) => {
    const { title, body, category } = req.body || {};
    if (typeof title !== "string" || !title.trim() || title.length > 255 ||
        typeof body !== "string" || !body.trim()) {
        return res.status(400).json({ error: "Enter a title thats valid" });
    }
    if (!["tech", "sports", "money-moves"].includes(category)) {
        return res.status(400).json({ error: "Choose one of the listed categories." });
    }
    const post = {
        blog_id: randomUUID(),
        creator_name: req.session.user.name,
        creator_user_id: req.session.user.user_id,
        title: title.trim(),
        body: body.trim(),
        category,
        date_created: new Date().toISOString()
    };
    posts.unshift(post);
    res.status(201).json({ post });
});

app.post("/api/posts/:id/edit", (req, res) => {
    const post = posts.find(post => post.blog_id === req.params.id &&
        post.creator_user_id === req.session.user.user_id);
    if (!post) {
        return res.status(404).json({ error: "Post not found or not yours." });
    }
    const { title, body } = req.body || {};
    if (typeof title !== "string" || !title.trim() || title.length > 255 ||
        typeof body !== "string" || !body.trim()) {
        return res.status(400).json({ error: "Title and body have to be valid" });
    }
    post.title = title.trim();
    post.body = body.trim();
    res.json({ post });
});

app.post("/api/posts/:id/delete", (req, res) => {
    const index = posts.findIndex(post => post.blog_id === req.params.id &&
        post.creator_user_id === req.session.user.user_id);
    if (index === -1) {
        return res.status(404).json({ error: "Post not found or not yours." });
    }
    posts.splice(index, 1);
    res.json({ message: "Post deleted." });
});

app.use("/api", (req, res) => {
    res.status(404).json({ error: "Route not found." });
});
app.use(express.static("client/dist"));
app.use((error, req, res, next) => {
    if (res.headersSent) return next(error);
    res.status(error.status || 500).json({
        error: error.status === 400 ? "Invalid JSON." : "Request failed."
    });
});

app.listen(port, () => {
    console.log("Server is running on port " + port);
});