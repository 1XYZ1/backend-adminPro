// Requires
var express = require("express");
var mongoose = require("mongoose");
var bodyParser = require("body-parser");

// Inicializar variables

var app = express();

// bodyParser
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
// parse application/json
app.use(bodyParser.json());

// Importar Rutas

var appRoutes = require("./routes/app");
var usuarioRoutes = require("./routes/usuario");
var hospitalRoutes = require("./routes/hospital");
var medicoRoutes = require("./routes/medico");
var loginRoutes = require("./routes/login");
var busquedaRoutes = require("./routes/busqueda");
var uploadRoutes = require("./routes/upload");
var imagenesRoutes = require("./routes/imagenes");

// Conexion Base de Datos
mongoose.connection.openUri(
    "mongodb://localhost:27017/hospitalDB",
    (err, res) => {
        if (err) throw err;
        console.log("Base de datos:\x1b[32m%s\x1b[0m", " online");
    }
);

// Server Index

// var serveIndex = require("serve-index");
// app.use(express.static(__dirname + "/"));
// app.use("/uploads", serveIndex(__dirname + "/uploads"));

// Rutas
app.use("/usuario", usuarioRoutes);
app.use("/hospital", hospitalRoutes);
app.use("/medico", medicoRoutes);
app.use("/login", loginRoutes);
app.use("/busqueda", busquedaRoutes);
app.use("/upload", uploadRoutes);
app.use("/imagenes", imagenesRoutes);
app.use("/", appRoutes);

// Escuchar Peticiones

app.listen(3000, () => {
    console.log("Express server puerto 3000:\x1b[32m%s\x1b[0m", " online");
});