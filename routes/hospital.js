var express = require("express");
var app = express();
var Usuario = require("../models/usuario");
var Hospital = require("../models/hospital");
var jwt = require("jsonwebtoken");
var bcrypt = require("bcryptjs");
var mdAutenticacion = require("../middlewares/autenticacion");

//////////////////////////////////
// Obtener todos los hospitales
//////////////////////////////////

app.get("/", (req, res, next) => {
    var desde = req.query.desde || 0;
    desde = Number(desde);
    Hospital.find({}, "nombre img")
        .skip(desde)
        .limit(5)
        .populate("usuario", "nombre email")
        .exec((err, hospitales) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: "Error cargando hospitales",
                    errors: err
                });
            }
            Hospital.count({}, (err, conteo) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: "Error count",
                        errors: err
                    });
                }

                res.status(200).json({
                    ok: true,
                    hospitales: hospitales,
                    total: conteo
                });
            });
        });
});

//////////////////////////////////
// Actualizar hospital
//////////////////////////////////
app.put("/:id", mdAutenticacion.verificaToken, (req, res) => {
    var id = req.params.id;
    var body = req.body;

    Hospital.findById(id, (err, hospital) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: "Error al buscar hospital",
                errors: err
            });
        }

        if (!hospital) {
            return res.status(400).json({
                ok: false,
                mensaje: "El hospital con el id " + " no existe",
                errors: { message: "No existe un hospital con este id" }
            });
        }

        (hospital.nombre = body.nombre),
        (hospital.usuario = req.usuario._id),
        hospital.save((err, hospitalGuardado) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: "Error al actualizar hospital",
                    errors: err
                });
            }
            res.status(200).json({
                ok: true,
                hospital: hospitalGuardado,
                usuarioToken: req.usuario
            });
        });
    });
});

//////////////////////////////////
// Crear un nuevo hospital
//////////////////////////////////

app.post("/", mdAutenticacion.verificaToken, (req, res) => {
    var body = req.body;
    var hospital = new Hospital({
        nombre: body.nombre,
        usuario: req.usuario._id
    });

    hospital.save((err, hospitalGuardado) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: "Error al crear hospital",
                errors: err
            });
        }
        res.status(201).json({
            ok: true,
            hospital: hospitalGuardado,
            usuario: req.usuario
        });
    });
});
//////////////////////////////////
// Borrar usuario
//////////////////////////////////

app.delete("/:id", mdAutenticacion.verificaToken, (req, res) => {
    var id = req.params.id;
    Hospital.findByIdAndRemove(id, (err, hospitalBorrado) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: "Error al borrar hospital",
                errors: err
            });
        }

        if (!hospitalBorrado) {
            return res.status(400).json({
                ok: false,
                mensaje: "El hospital con el id " + " no existe",
                errors: { message: "No existe un hospital con este id" }
            });
        }
        res.status(200).json({
            ok: true,
            hospital: hospitalBorrado
        });
    });
});

module.exports = app;