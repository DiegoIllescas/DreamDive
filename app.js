const express = require("express");
const path = require("path");
const logger = require("morgan");
const bodyParser = require("body-parser");
const session = require("express-session");
const store = new session.MemoryStore();
const cookieParser = require("cookie-parser");
require("dotenv").config();

const { google } = require("googleapis");
const fs = require("fs");
const stream = require("stream");

const { Storage } = require("@google-cloud/storage");
const storage = new Storage({
  projectId: "calcium-ember-427018-t1",
  keyFilename: "./claves_dreamdive.json", // La ruta al archivo JSON de las credenciales
});

const credentials = require("./claves_dreamdive.json");
const authGoogle = new google.auth.GoogleAuth({
  credentials,
  scopes: ["https://www.googleapis.com/auth/drive"],
});

const auth = require("./middleware/auth");
const users = require("./middleware/user");
const posts = require("./middleware/posts");
const entity = require("./middleware/entity");
const profile = require("./middleware/profile");

let app = express();

app.use(express.json({ limit: "50mb" }));

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(
  session({
    secret: process.env.SECRET_KEY,
    cookie: { maxAge: 1000 * 60 * 60 * 3 },
    saveUninitialized: false,
    resave: false,
    store,
  })
);

app.use(logger("dev"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));
app.use(cookieParser());

app.get("/", function (req, res) {
  return res.render("index");
});

app.get("/signup", (req, res) => {
  res.render("signup");
});

app.get("/home", (req, res) => {
  if (!req.cookies["connect.sid"]) {
    return res.redirect("/");
  }
  const cookie = req.cookies["connect.sid"].substring(2, 34);

  if (!store.sessions[cookie]) {
    return res.redirect("/final-steps");
  }

  if (!JSON.parse(store.sessions[cookie]).user.uuid) {
    return res.redirect("/final-steps");
  }

  return res.render("home");
});

app.get("/final-steps", (req, res) => {
  if (!req.cookies["connect.sid"]) {
    return res.redirect("/");
  }

  const cookie = req.cookies["connect.sid"].substring(2, 34);
  if (!store.sessions[cookie]) {
    return res.redirect("/");
  }

  if (JSON.parse(store.sessions[cookie]).user.uuid) {
    return res.redirect("/home");
  }

  return res.render("createAccount");
});

app.get("/identify", (req, res) => {
  res.render("identify");
});

app.get("/explore", (req, res) => {
  if (!req.cookies["connect.sid"]) {
    return res.redirect("/");
  }

  const cookie = req.cookies["connect.sid"].substring(2, 34);
  if (!store.sessions[cookie]) {
    return res.redirect("/");
  }

  return res.render("explore");
});

app.get("/public", (req, res) => {
  if (!req.cookies["connect.sid"]) {
    return res.redirect("/");
  }

  const cookie = req.cookies["connect.sid"].substring(2, 34);
  if (!store.sessions[cookie]) {
    return res.redirect("/");
  }

  return res.render("public");
});

app.get("/saved", (req, res) => {
  if (!req.cookies["connect.sid"]) {
    return res.redirect("/");
  }

  const cookie = req.cookies["connect.sid"].substring(2, 34);
  if (!store.sessions[cookie]) {
    return res.redirect("/");
  }

  return res.render("saved");
});

app.get("/messages", (req, res) => {
  if (!req.cookies["connect.sid"]) {
    return res.redirect("/");
  }

  const cookie = req.cookies["connect.sid"].substring(2, 34);
  if (!store.sessions[cookie]) {
    return res.redirect("/");
  }

  return res.render("messages");
});

app.get("/notifications", (req, res) => {
  if (!req.cookies["connect.sid"]) {
    return res.redirect("/");
  }

  const cookie = req.cookies["connect.sid"].substring(2, 34);
  if (!store.sessions[cookie]) {
    return res.redirect("/");
  }

  return res.render("notifications");
});

app.get("/calendar", (req, res) => {
  if (!req.cookies["connect.sid"]) {
    return res.redirect("/");
  }

  const cookie = req.cookies["connect.sid"].substring(2, 34);
  if (!store.sessions[cookie]) {
    return res.redirect("/");
  }

  return res.render("calendar");
});

app.get("/config", (req, res) => {
  if (!req.cookies["connect.sid"]) {
    return res.redirect("/");
  }

  const cookie = req.cookies["connect.sid"].substring(2, 34);
  if (!store.sessions[cookie]) {
    return res.redirect("/");
  }

  return res.render("config");
});

app.get("/user/uuid", (req, res) => {
  if (!req.cookies["connect.sid"]) {
    return res.redirect("/");
  }

  const cookie = req.cookies["connect.sid"].substring(2, 34);

  return res.status(200).json({
    success: true,
    uuid: JSON.parse(store.sessions[cookie]).user.uuid,
  });
});

app.get("/profile/:uuid", async (req, res) => {
  if (!req.cookies["connect.sid"]) {
    return res.redirect("/");
  }

  const cookie = req.cookies["connect.sid"].substring(2, 34);
  if (!store.sessions[cookie]) {
    return res.redirect("/");
  }

  return res.render("profile", {
    user: await users.getUserByUUID(req.params.uuid),
  });
});

app.get("/sugerence", posts.getSugerence);

app.get("/followers/:uuid", async (req, res) => {
  const num = await profile.numFollowers(req.params.uuid);

  res.status(200).json({ success: true, count: num });
});

app.get("/post/:uuid", async (req, res) => {
  const posts = await profile.getPosts(req.params.uuid);

  return res.status(200).json({ success: true, posts: posts });
});

app.get("/post", async (req, res) => {
  const cookie = req.cookies["connect.sid"].substring(2, 34);
  const postArr = await posts.getSugerence(
    JSON.parse(store.sessions[cookie]).user.uuid
  );

  return res.status(200).json({ success: true, posts: postArr });
});

app.get("/post/foryou", async (req, res) => {
  if (!req.cookies["connect.sid"]) {
    return res.redirect("/");
  }

  const cookie = req.cookies["connect.sid"].substring(2, 34);
  if (!store.sessions[cookie]) {
    return res.redirect("/");
  }

  //console.log(JSON.parse(store.sessions[cookie]).user.uuid);

  let posts = await profile.getFeed(
    JSON.parse(store.sessions[cookie]).user.uuid
  );

  return res.status(200).json({ success: true, posts: posts });
});

app.get("/saved/post", async (req, res) => {
  if (!req.cookies["connect.sid"]) {
    return res.redirect("/");
  }

  const cookie = req.cookies["connect.sid"].substring(2, 34);
  if (!store.sessions[cookie]) {
    return res.redirect("/");
  }

  let posts = await profile.getSaved(
    JSON.parse(store.sessions[cookie]).user.uuid
  );

  return res.status(200).json({ success: true, posts: posts });
});

app.post("/user/add", users.create);

app.post("/login", auth.login);

app.post("/account/add", async (req, res) => {
  if (!req.cookies["connect.sid"]) {
    return res.redirect("/");
  }

  const cookie = req.cookies["connect.sid"].substring(2, 34);
  if (!store.sessions[cookie]) {
    return res.redirect("/");
  }

  if (
    !(await users.setUUID(
      JSON.parse(store.sessions[cookie]).user.email,
      req.body.uuid
    ))
  ) {
    return res.status(400).json({ success: false, error: "Algo salio mal" });
  }

  req.session.user.uuid = req.body.uuid;
  return res.status(200).json({ success: true });
});

app.post("/posts/add", async (req, res) => {
  if (!req.cookies["connect.sid"]) {
    return res.redirect("/");
  }

  const cookie = req.cookies["connect.sid"].substring(2, 34);
  if (!store.sessions[cookie]) {
    return res.redirect("/");
  }

  if (
    !(await posts.create(
      JSON.parse(store.sessions[cookie]).user.uuid,
      req.body
    ))
  ) {
    return res.status(400).json({ success: false, error: "Algo salio mal" });
  }

  return res.status(200).json({ success: true });
});

app.post("/follow/add", async (req, res) => {
  if (!req.cookies["connect.sid"]) {
    return res.redirect("/");
  }

  const cookie = req.cookies["connect.sid"].substring(2, 34);
  if (!store.sessions[cookie]) {
    return res.redirect("/");
  }

  if (
    !(await profile.follow(
      JSON.parse(store.sessions[cookie]).user.uuid,
      req.body
    ))
  ) {
    return res.status(400).json({ success: false, error: "Algo salio mal" });
  }

  return res.status(200).json({ success: true });
});

app.post("/friendship/send", async (req, res) => {
  if (!req.cookies["connect.sid"]) {
    return res.redirect("/");
  }

  const cookie = req.cookies["connect.sid"].substring(2, 34);
  if (!store.sessions[cookie]) {
    return res.redirect("/");
  }

  if (
    !(await profile.sendFriendRequest(
      JSON.parse(store.sessions[cookie]).user.uuid,
      req.body
    ))
  ) {
    return res.status(400).json({ success: false, error: "Algo salio mal" });
  }

  return res.status(200).json({ success: true });
});

app.post("/search", entity.get);

app.post("/like/:id", async (req, res) => {
  if (!req.cookies["connect.sid"]) {
    return res.redirect("/");
  }

  const cookie = req.cookies["connect.sid"].substring(2, 34);
  if (!store.sessions[cookie]) {
    return res.redirect("/");
  }

  if (
    !(await posts.addlike(
      JSON.parse(store.sessions[cookie]).user.uuid,
      req.params.id
    ))
  ) {
    return res.status(400).json({ success: false, error: "Algo salio mal" });
  }

  return res.status(200).json({ success: true });
});

app.post("/save/:id", async (req, res) => {
  if (!req.cookies["connect.sid"]) {
    return res.redirect("/");
  }

  const cookie = req.cookies["connect.sid"].substring(2, 34);
  if (!store.sessions[cookie]) {
    return res.redirect("/");
  }

  if (
    !(await posts.addSave(
      JSON.parse(store.sessions[cookie]).user.uuid,
      req.params.id
    ))
  ) {
    return res.status(400).json({ success: false, error: "Algo salio mal" });
  }

  return res.status(200).json({ success: true });
});

app.put("/friendship/accept", async (req, res) => {
  if (!req.cookies["connect.sid"]) {
    return res.redirect("/");
  }

  const cookie = req.cookies["connect.sid"].substring(2, 34);
  if (!store.sessions[cookie]) {
    return res.redirect("/");
  }

  if (
    !(await profile.acceptFriendRequest(
      JSON.parse(store.sessions[cookie]).user.uuid,
      req.body
    ))
  ) {
    return res.status(400).json({ success: false, error: "Algo salio mal" });
  }

  return res.status(200).json({ success: true });
});

app.put("/friendship/decline", async (req, res) => {
  if (!req.cookies["connect.sid"]) {
    return res.redirect("/");
  }

  const cookie = req.cookies["connect.sid"].substring(2, 34);
  if (!store.sessions[cookie]) {
    return res.redirect("/");
  }

  if (
    !(await profile.declineFriendRequest(
      JSON.parse(store.sessions[cookie]).user.uuid,
      req.body
    ))
  ) {
    return res.status(400).json({ success: false, error: "Algo salio mal" });
  }

  return res.status(200).json({ success: true });
});

app.put("/updateProfile", async (req, res) => {
  try {
    if (!req.cookies["connect.sid"]) {
      return res.status(401).json({ success: false, error: "Unauthorized" }); // No autorizado
    }

    const cookie = req.cookies["connect.sid"].substring(2, 34);
    if (!store.sessions[cookie]) {
      return res.status(401).json({ success: false, error: "Unauthorized" }); // No autorizado
    }

    const userUUID = JSON.parse(store.sessions[cookie]).user.uuid;
    const { name, description, photo, background } = req.body;

    // https://storage.googleapis.com/dreamdive/%40lizardina-photo.jpg
    let photoB64 = "";
    let photoURL = "https://storage.googleapis.com/dreamdive/purpleprofile.png";
    let backgroundB64 = "";
    let backgroundURL = "https://storage.googleapis.com/dreamdive/default.jpg";

    if (photo) {
      photoB64 = photo.replace(/^data:image\/\w+;base64,/, "");
      photoURL = await uploadImageToStorage(photoB64, `${userUUID}-photo.jpg`);
    }

    if (background) {
      backgroundB64 = background.replace(/^data:image\/\w+;base64,/, "");
      backgroundURL = await uploadImageToStorage(
        backgroundB64,
        `${userUUID}-background.jpg`
      );
    }

    console.log("--> name", name, "description", description);
    console.log("Photo profile URL:", photoURL);
    console.log("Background URL:", backgroundURL);

    // Actualizar datos en la base de datos

    // Suponiendo que tienes un método users.updateProfile()
    const updateResult = await users.updateProfile(userUUID, {
      name,
      description,
      photoURL,
      backgroundURL,
    });

    if (!updateResult) {
      return res
        .status(500)
        .json({ success: false, error: "Error updating profile" }); // Error al actualizar el perfil
    }

    return res
      .status(200)
      .json({ success: true, message: "Profile updated successfully" }); // Perfil actualizado con éxito
  } catch (error) {
    console.error("Error updating profile:", error);
    return res
      .status(500)
      .json({ success: false, error: "Internal Server Error" }); // Error del servidor
  }
});

async function uploadImageToStorage(base64Image, fileName) {
  const bucketName = "dreamdive"; // Reemplaza con el nombre de tu bucket
  const bucket = storage.bucket(bucketName);
  const file = bucket.file(fileName);

  const buffer = Buffer.from(base64Image, "base64");
  const bufferStream = new stream.PassThrough();
  bufferStream.end(buffer);

  await file.save(bufferStream);

  // No es necesario hacer el archivo público si ya configuraste el bucket para acceso público

  const publicUrl = `https://storage.googleapis.com/${bucketName}/${fileName}`;
  return publicUrl;
}

app.delete("/sesion", (req, res) => {
  req.session.destroy((err) => {
    if (!err) {
      return res.status(200).json({ success: true });
    }
  });
});

app.delete("/like/:id", async (req, res) => {
  if (!req.cookies["connect.sid"]) {
    return res.redirect("/");
  }

  const cookie = req.cookies["connect.sid"].substring(2, 34);
  if (!store.sessions[cookie]) {
    return res.redirect("/");
  }

  if (
    !(await posts.removeLike(
      JSON.parse(store.sessions[cookie]).user.uuid,
      req.params.id
    ))
  ) {
    return res.status(400).json({ success: false, error: "Algo salio mal" });
  }

  return res.status(200).json({ success: true });
});

app.delete("/save/:id", async (req, res) => {
  if (!req.cookies["connect.sid"]) {
    return res.redirect("/");
  }

  const cookie = req.cookies["connect.sid"].substring(2, 34);
  if (!store.sessions[cookie]) {
    return res.redirect("/");
  }

  if (
    !(await posts.removeSave(
      JSON.parse(store.sessions[cookie]).user.uuid,
      req.params.id
    ))
  ) {
    return res.status(400).json({ success: false, error: "Algo salio mal" });
  }

  return res.status(200).json({ success: true });
});

app.listen(4000);

console.log("Server Started on Port 4000");

module.exports = app;
