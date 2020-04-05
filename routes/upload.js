var express = require("express");
var fileUpload = require("express-fileupload");
var fs = require("fs");
var app = express();

var Usuario = require("../models/usuario");
var Medico = require("../models/medico");
var Hospital = require("../models/hospital");

// default options
app.use(fileUpload());

app.put("/:tipo/:id", (req, res, next) => {
    var tipo = req.params.tipo;
    var id = req.params.id;

    //  Tipos de coleccion

    var tiposValidos = ["medicos", "hospitales", "usuarios"];

    if (tiposValidos.indexOf(tipo) < 0) {
        res.status(400).json({
            ok: false,
            mensaje: "Tipo de coleccion invalido",
            errors: { message: "Tipo de coleccion invalido" },
        });
    }

    if (!req.files) {
        res.status(400).json({
            ok: false,
            mensaje: "Error al seleccionar archivo",
            errors: { message: "Debe seleccionar una imagen" },
        });
    }

    // Obtener nombre archivo

    var archivo = req.files.imagen;
    var nombreCortado = archivo.name.split(".");
    var extensionArchivo = nombreCortado[nombreCortado.length - 1];

    // Validar solo estas extensiones

    var extensiones = ["png", "jpg", "gif", "jpeg"];

    if (extensiones.indexOf(extensionArchivo) < 0) {
        res.status(400).json({
            ok: false,
            mensaje: "Extension no permitida",
            errors: {
                message: "Las unicas extensiones permitidas son " + extensiones.join(", "),
            },
        });
    }

    // Nombre archivo personalizada
    var nombreArchivo = `${id}-${new Date().getMilliseconds()}.${extensionArchivo}`;

    // Mover archivos del temporan al un path

    var path = `./uploads/${tipo}/${nombreArchivo}`;

    archivo.mv(path, (err) => {
        if (err) {
            res.status(500).json({
                ok: false,
                mensaje: "Error al mover archivo",
                errors: err,
            });
        }

        subirPorTipo(res, id, nombreArchivo, tipo);

        // res.status(200).json({
        //     ok: true,
        //     mensaje: "Archivo movido",
        // });
    });
});

function subirPorTipo(res, id, nombreArchivo, tipo) {
    if (tipo === "usuarios") {
        Usuario.findById(id, (err, usuario) => {
            if (!usuario) {
                return res.status(400).json({
                    ok: false,
                    mensaje: "Usuario no existe",
                });
            }
            var pathViejo = "./uploads/usuarios/" + usuario.img;

            // si existe, elimina la imagen anterior
            if (fs.existsSync(pathViejo)) {
                fs.unlinkSync(pathViejo);
            }

            usuario.img = nombreArchivo;

            usuario.save((err, usuarioActualizado) => {
                usuarioActualizado.password = ":)";
                return res.status(200).json({
                    ok: true,
                    mensaje: "Imagen de usuario actualizada correctamente",
                    usuario: usuarioActualizado,
                });
            });
        });
    }

    if (tipo === "medicos") {
        Medico.findById(id, (err, medico) => {
            if (!medico) {
                return res.status(400).json({
                    ok: false,
                    mensaje: "Medico no existe",
                });
            }
            var pathViejo = "./uploads/medicos/" + medico.img;

            // si existe, elimina la imagen anterior
            if (fs.existsSync(pathViejo)) {
                fs.unlinkSync(pathViejo);
            }

            medico.img = nombreArchivo;

            medico.save((err, medicoActualizado) => {
                medicoActualizado.password = ":)";
                return res.status(200).json({
                    ok: true,
                    mensaje: "Imagen de medico actualizada correctamente",
                    medico: medicoActualizado,
                });
            });
        });
    }

    if (tipo === "hospitales") {
        Hospital.findById(id, (err, hospital) => {
            if (!hospital) {
                return res.status(400).json({
                    ok: false,
                    mensaje: "Hospital no existe",
                });
            }
            var pathViejo = "./uploads/hospitales/" + hospital.img;

            // si existe, elimina la imagen anterior
            if (fs.existsSync(pathViejo)) {
                fs.unlinkSync(pathViejo);
            }

            hospital.img = nombreArchivo;
            hospital.save((err, hospitalActualizado) => {
                return res.status(200).json({
                    ok: true,
                    mensaje: "Imagen de hospital actualizada correctamente",
                    hospital: hospitalActualizado,
                });
            });
        });
    }
}

module.exports = app;