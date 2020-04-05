var express = require("express");

var app = express();
var Hospital = require("../models/hospital");
var Medico = require("../models/medico");
var Usuario = require("../models/usuario");

// ===================================
// Busqueda por coleccion
// ===================================

app.get("/coleccion/:tabla/:busqueda", (req, res, next) => {
    var busqueda = req.params.busqueda;
    var regex = new RegExp(busqueda, "i");
    var tabla = req.params.tabla;

    if (tabla === "hospitales") {
        buscarHospitales(busqueda, regex).then((respuesta) => {
            res.status(200).json({
                ok: true,
                mensaje: "Peticion realizada correctamente",
                hospitales: respuesta,
            });
        });
    } else if (tabla === "medicos") {
        buscarMedicos(busqueda, regex).then((respuesta) => {
            res.status(200).json({
                ok: true,
                mensaje: "Peticion realizada correctamente",
                medicos: respuesta,
            });
        });
    } else if (tabla === "usuarios") {
        buscarUsuarios(busqueda, regex).then((respuesta) => {
            res.status(200).json({
                ok: true,
                mensaje: "Peticion realizada correctamente",
                usuarios: respuesta,
            });
        });
    } else {
        return res.status(400).json({
            ok: false,
            error: "Tabla inexistente",
        });
    }
});

// ===================================
// Busqueda general
// ===================================

app.get("/todo/:busqueda", (req, res, next) => {
    var busqueda = req.params.busqueda;
    var regex = new RegExp(busqueda, "i");

    Promise.all([
        buscarHospitales(busqueda, regex),
        buscarMedicos(busqueda, regex),
        buscarUsuarios(busqueda, regex),
    ]).then((respuesta) => {
        res.status(200).json({
            ok: true,
            mensaje: "Peticion realizada correctamente",
            hospitales: respuesta[0],
            medicos: respuesta[1],
            usuarios: respuesta[2],
        });
    });
});

function buscarHospitales(busqueda, regex) {
    return new Promise((resolve, reject) => {
        Hospital.find({ nombre: regex })
            .populate("usuario", "nombre email")
            .exec((err, hospitales) => {
                if (err) {
                    reject("Error al cargar hospitales", err);
                } else {
                    resolve(hospitales);
                }
            });
    });
}

function buscarMedicos(busqueda, regex) {
    return new Promise((resolve, reject) => {
        Medico.find({ nombre: regex })
            .populate("usuario", "nombre email")
            .populate("hospital")
            .exec((err, medicos) => {
                if (err) {
                    reject("Error al cargar medicos", err);
                } else {
                    resolve(medicos);
                }
            });
    });
}

function buscarUsuarios(busqueda, regex) {
    return new Promise((resolve, reject) => {
        Usuario.find({}, "nombre email role")
            .or([{ nombre: regex }, { email: regex }])
            .exec((err, usuarios) => {
                if (err) {
                    reject("Error al cargar usuarios", err);
                } else {
                    resolve(usuarios);
                }
            });
    });
}

module.exports = app;