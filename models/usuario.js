var mongoose = require("mongoose");
var uniqueValidator = require("mongoose-unique-validator");

var Schema = mongoose.Schema;

var rolesValidos = {
    values: ["ADMIN", "USER"],
    message: "{VALUE} no es un rol permitido",
};

var usuarioSchema = new Schema({
    nombre: { type: String, required: [true, "El nombre es necesario"] },
    email: { type: String, required: [true, "El correo es necesario"] },
    password: { type: String, required: [true, "La contraseña es necesaria"] },
    email: {
        type: String,
        unique: true,
        required: [true, "El email es necesario"],
    },
    img: { type: String, required: false },
    role: { type: String, required: true, default: "USER", enum: rolesValidos },
    google: { type: Boolean, default: false },
});

usuarioSchema.plugin(uniqueValidator, { message: "{PATH} ya existente" });
module.exports = mongoose.model("Usuario", usuarioSchema);