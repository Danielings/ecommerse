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

app.post("/api/ventas", async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ mensaje: "No autorizado" });

  try {
    const datosUsuario = jwt.verify(token, process.env.JWT_SECRET);
    let subtotal = 0;
    const detallesCalculados = [];
    const { carrito } = req.body;
    const sql =
      "INSERT INTO ventas (usuario_id,total,detalle,fecha) VALUES (?,?,?,NOW( ))";

    if (!Array.isArray(carrito) || !carrito || carrito.length === 0)
      return res
        .status(400)
        .json({ mensaje: "Carrito es invalido o esta vacio" });

    const idsProductos = carrito.map((item) => item.id);
    const sqlProduct =
      "SELECT id, nombre, precio FROM productos WHERE id IN (?)";
    const [productosEncontrados] = await conexionBD.query(sqlProduct, [
      idsProductos,
    ]);

    for (const item of carrito) {
      if (item.cantidad <= 0)
        return res
          .status(400)
          .json({ mensaje: `Cantidad invalida para el producto ${item.id}` });

      const productosDB = productosEncontrados.find((p) => p.id === item.id);

      if (!productosDB)
        return res
          .status(400)
          .json({ mensaje: `Producto ${item.id} no existe` });

      const precioReal = productosDB.precio;
      subtotal += precioReal * item.cantidad;

      detallesCalculados.push({
        id: productosDB.id,
        nombre: productosDB.nombre,
        precio: precioReal,
        cantidad: item.cantidad,
      });
    }

    const iva = subtotal * 0.16;
    const total = subtotal + iva;

    const valores = [
      datosUsuario.id,
      total,
      JSON.stringify(detallesCalculados),
    ];
    const [fila] = await conexionBD.query(sql, valores);

    res
      .status(200)
      .json({ mensaje: "Venta registrada con exito", total: total });
  } catch (error) {
    console.error("Error al procesar la venta:", error);
    res.status(403).json({ mensaje: "Token invalido o expirado" });
  }
});

//crear productos
app.post("/api/admin/productos", async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ mensaje: "No autorizado" });

  try {
    const datosUsuario = jwt.verify(token, process.env.JWT_SECRET);
    if (datosUsuario.rol !== "admin")
      return res
        .status(403)
        .json({ mensaje: "No tienes los permisos necesarios" });

    const { nombre, precio, categoria, img } = req.body;
    if (!nombre || !precio)
      return res.status(400).json({ mensaje: "Error en los datos ingresados" });

    const sql =
      "INSERT INTO productos (nombre,precio,categoria,img) VALUES (?,?,?,?)";
    const valores = [nombre, precio, categoria, img];

    const [filas] = await conexionBD.query(sql, valores);

    res.status(201).json({ mensaje: "Producto creado con exito" });
  } catch (error) {
    console.error("error al crear el producto ", error);
    res.status(500).json({ mensaje: "Error interno del servidor" });
  }
});

//Obtener Productos
app.get("/api/productos", async (req, res) => {
  try {
    const sql = "SELECT id,nombre,precio,categoria, img FROM productos";
    const [filas] = await conexionBD.query(sql);

    res.status(200).json(filas);
  } catch (error) {
    console.error("error al obtener los productos", error);
    res.status(500).json({ mensaje: "Error interno del servidor" });
  }
});

//Actualizar Productos
app.put("/api/admin/productos/:id", async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ mensaje: "No autorizado" });

  try {
    const datosUsuario = jwt.verify(token, process.env.JWT_SECRET);
    if (datosUsuario.rol !== "admin")
      return res
        .status(403)
        .json({ mensaje: "No tienes los permisos necesarios" });

    const { nombre, precio, categoria, img } = req.body;
    const sql =
      "UPDATE productos SET nombre = ?, precio = ?, categoria = ?, img = ? WHERE id = ?";
    const idProducto = req.params.id;
    const valores = [nombre, precio, categoria, img, idProducto];

    const [filas] = await conexionBD.query(sql, valores);

    res.status(200).json({ mensaje: "Producto actualizado con exito" });
  } catch (error) {
    console.error("error al actualizar el producto", error);
    res.status(500).json({ mensaje: "Error interno del servidor" });
  }
});

//Eliminar Producto
app.delete("/api/admin/productos/:id", async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ mensaje: "No autorizado" });

  try {
    const datosUsuario = jwt.verify(token, process.env.JWT_SECRET);
    if (datosUsuario.rol !== "admin")
      return res
        .status(403)
        .json({ mensaje: "No tienes los permisos necesarios" });

    const sql = "DELETE FROM productos WHERE id =?";
    const idProducto = req.params.id;

    const [filas] = await conexionBD.query(sql, [idProducto]);

    if (filas.affectedRows === 0)
      return res.status(404).json({ mensaje: "El producto no existe" });

    res.status(200).json({ mensaje: "Producto eliminado con exito" });
  } catch (error) {
    console.error("Error al eliminar el producto", error);
    res.status(500).json({ mensaje: "Error interno del servidor" });
  }
});

// Reporte de ventas
app.get("/api/admin/reportes", async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ mensaje: "No autorizado" });

  try {
    const datosUsuario = jwt.verify(token, process.env.JWT_SECRET);
    if (datosUsuario.rol !== "admin")
      return res.status(403).json({ mensaje: "Acceso Denegado" });

    const sqlMetricas = `
      SELECT 
        COALESCE(SUM(total), 0) AS total_ventas, 
        COUNT(*) AS cantidad_ventas 
      FROM ventas 
      WHERE DATE(fecha) = CURDATE()
    `;
    const [metricas] = await conexionBD.query(sqlMetricas);

    const sqlOrdenes = `
      SELECT id, total, detalle, fecha 
      FROM ventas 
      WHERE DATE(fecha) = CURDATE() 
      ORDER BY fecha DESC
    `;
    const [ordenes] = await conexionBD.query(sqlOrdenes);

    res.status(200).json({ metricas: metricas[0], ordenes: ordenes });
  } catch (error) {
    console.error("error al obtener los reportes ", error);
    res.status(500).json({ mensaje: "Error interno del servidor" });
  }
});

//Obtener las compras de clientes
app.get("/api/cliente/mis-compras", async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ mensaje: "No autorizado" });

  try {
    const datosUsuario = jwt.verify(token, process.env.JWT_SECRET);
    const usuario_id = datosUsuario.id;

    const sqlOrdenes =
      "SELECT id, total, detalle, fecha FROM ventas WHERE usuario_id = ?";
    const [ordenes] = await conexionBD.query(sqlOrdenes, [usuario_id]);

    const sqlTotal =
      "SELECT SUM(total) AS total_compras FROM ventas WHERE usuario_id = ?";

    const [totalCompras] = await conexionBD.query(sqlTotal, [usuario_id]);
    const totalGastado = totalCompras[0].total_compras || 0;

    res.status(200).json({ ordenes: ordenes, totalGastado: totalGastado });
  } catch (error) {
    console.error("error al obtener las ordenes ", error);
    res.status(500).json({ mensaje: "Error del servidor" });
  }
});

app.listen(PUERTO, () => {
  console.log(`Servidor corriendo en http://localhost:${PUERTO}`);
});
