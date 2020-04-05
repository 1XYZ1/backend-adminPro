var express = require("express");
var app = express();
var Usuario = require("../models/usuario");
var bcrypt = require("bcryptjs");
var jwt = require("jsonwebtoken");
var SEED = require("../config/config").SEED;

// GOOGLE SIGNIN
const CLIENT_ID = require("../config/config").CLIENT_ID;
const { OAuth2Client } = require("google-auth-library");
const client = new OAuth2Client(CLIENT_ID);

// =========================
// Autenticacion Google
// =========================

async function verify(token) {
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: CLIENT_ID, // Specify the CLIENT_ID of the app that accesses the backend
        // Or, if multiple clients access the backend:
        //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
    });
    const payload = ticket.getPayload();
    return {
        nombre: payload.name,
        email: payload.email,
        img: payload.picture,
        google: true,
    };
}

app.post("/google", async(req, res) => {
    var token = req.body.token;
    var googleUser = await verify(token).catch((err) => {
        res.status(403).json({
            ok: false,
            mensaje: "Token invalido: " + err,
        });
    });

    Usuario.findOne({ email: googleUser.email }, (err, usuarioDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: "Error al buscar usuario",
                errors: err,
            });
        }

        if (usuarioDB) {
            if (usuarioDB.google === false) {
                return res.status(400).json({
                    ok: false,
                    mensaje: "Debe usar su autenticacion normal",
                });
            } else {
                var token = jwt.sign({ usuario: usuarioDB }, SEED, {
                    expiresIn: 14400,
                });

                res.status(200).json({
                    ok: true,
                    usuario: usuarioDB,
                    token: token,
                });
            }
        } else {
            // El usuario no exist hay que crearlo
            var usuario = new Usuario({
                nombre: googleUser.nombre,
                email: googleUser.email,
                img: googleUser.img,
                google: true,
                password: ":)",
            });

            usuario.save((err, usuarioDB) => {
                var token = jwt.sign({ usuario: usuarioDB }, SEED, {
                    expiresIn: 14400,
                });

                res.status(200).json({
                    ok: true,
                    usuario: usuarioDB,
                    token: token,
                });
            });
        }
    });

    // res.status(200).json({
    //     ok: true,
    //     mensaje: "peticion realizada correctamente",
    //     googleUser: googleUser,
    // });
});

// =========================
// Autenticacion Normal
// =========================

app.post("/", (req, res) => {
    var body = req.body;

    Usuario.findOne({ email: body.email }, (err, usuarioDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: "Error al buscar usuario",
                errors: err,
            });
        }
        // Cambiar mensaje (quitar email)
        if (!usuarioDB) {
            return res.status(400).json({
                ok: false,
                mensaje: "Credenciales incorrectas - email",
                errors: err,
            });
        }
        // Cambiar mensaje (quitar password)

        if (!bcrypt.compareSync(body.password, usuarioDB.password)) {
            return res.status(400).json({
                ok: false,
                mensaje: "Credenciales incorrectas - password",
                errors: err,
            });
        }
        usuarioDB.password = ":)";

        // Crear Token
        // Expira en 4 horas
        var token = jwt.sign({ usuario: usuarioDB }, SEED, { expiresIn: 14400 });

        res.status(200).json({
            ok: true,
            usuario: usuarioDB,
            token: token,
            id: usuarioDB._id,
        });
    });
});

module.exports = app;