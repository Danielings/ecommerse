const express = require("express");
const cors = require("cors");
require("dotenv").config();
const mysql2 = require("mysql2/promise");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const PUERTO = process.env.PORT || 3000;
const app = express();
app.use(express.json());
app.use(cors());

const conexionBD = mysql2.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

app.get("/api/test", (req, res) => {
  res.status(200).json({ mensaje: `la base de datos esta funcionando` });
});

app.post("/api/registro", async (req, res) => {
  try {
    const { nombre, email, password, rol } = req.body;
    const salt = 10;
    const passwordhash = await bcrypt.hash(password, salt);
    const valores = [nombre, email, passwordhash, rol];

    const sql =
      "INSERT INTO usuarios (nombre,email,password,rol,fecha_registro)  VALUES (?,?,?,?,NOW())";

    const [resultado] = await conexionBD.query(sql, valores);

    if (resultado) {
      res.status(201).json({ mensaje: "Usuario registrado con exito" });
    }
  } catch (error) {
    console.error("error de registro", error);
    res.status(500).json({ mensaje: "Error al registar" });
  }
});

app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const sql =
      "SELECT id, nombre, email, password, rol FROM usuarios WHERE email = ?";
    const [filas] = await conexionBD.query(sql, [email]);
    const usuario = filas[0];

    if (!usuario) {
      res.status(401).json({ mensaje: "Credenciales invalidas" });
      return;
    }
    const validacionPassword = await bcrypt.compare(password, usuario.password);
    if (!validacionPassword) {
      res.status(401).json({ mensaje: "Credenciales invalidas" });
      return;
    }
    const payload = { id: usuario.id, rol: usuario.rol };
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "12h",
    });
    res.status(200).json({
      mensaje: "Login exitoso",
      token: token,
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        email: usuario.email,
        rol: usuario.rol,
      },
    });
  } catch (error) {
    console.error("Error al inisiar sesion:", error);
    return res.status(500).json({ mensaje: "Error interno del servidor" });
  }
});

app.listen(PUERTO, () => {
  console.log(`Servidor corriendo en http://localhost:${PUERTO}`);
});
