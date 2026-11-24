function guardiaSeguridad() {
  let usuarioLogeado = localStorage.getItem("usuario");
  if (usuarioLogeado === null) {
    window.location.href = "login.html";
    return;
  }

  const usuarioObjeto = JSON.parse(usuarioLogeado);
}

const token = localStorage.getItem("token");
let carrito = [];
let productos = [];

guardiaSeguridad();

let gridProductos = document.getElementById("grid-productos");
let gridCarrito = document.getElementById("lista-carrito");
let btn = document.getElementById("btn-finalizar");
let subTotal = document.getElementById("subtotal");
let iva = document.getElementById("iva");
let total = document.getElementById("total");
let categoriaActual = "todos";
let filtro = document.querySelector(".filtros");
let btnSesion = document.getElementById("btn-cerrar-sesion");

async function cargarProductos() {
  try {
    const respuesta = await fetch("http://localhost:3000/api/productos");
    if (respuesta.ok) {
      productos = await respuesta.json();
      renderizarProductos();
      cargarCarrito();
    } else {
      console.error("error al obtener los productos");
    }
  } catch (error) {
    console.error("error de red ", error);
  }
}

btnSesion.addEventListener("click", function () {
  localStorage.clear();
  window.location.href = "login.html";
});

filtro.addEventListener("click", function (e) {
  if (e.target.classList.contains("filtro")) {
    let filtroClick = e.target.dataset.categoria;
    let filtroActivo = document.querySelectorAll(".filtro");
    filtroActivo.forEach((item) => item.classList.remove("activo"));
    e.target.classList.add("activo");
    categoriaActual = filtroClick;
    cargarProductos();
  }
});

function renderizarProductos() {
  gridProductos.innerHTML = "";
  let productosAMostrar = productos.filter(
    (item) => categoriaActual === "todos" || item.categoria === categoriaActual,
  );
  for (let i = 0; i < productosAMostrar.length; i++) {
    let divProduct = document.createElement("div");
    let img = document.createElement("img");
    let name = document.createElement("h3");
    let price = document.createElement("p");
    let boton = document.createElement("button");
    boton.dataset.idProducto = productosAMostrar[i].id;
    divProduct.classList.add("producto");

    img.src = productosAMostrar[i].img;
    name.textContent = productosAMostrar[i].nombre;
    price.textContent = `${productosAMostrar[i].precio}$`;
    boton.textContent = "Agregar";
    boton.classList.add("btn-agregar");

    divProduct.appendChild(img);
    divProduct.appendChild(name);
    divProduct.appendChild(price);
    divProduct.appendChild(boton);

    gridProductos.appendChild(divProduct);
  }
}

function agregarCarrito(idProducto) {
  let itemCarrito = carrito.find((item) => item.id === idProducto);

  if (itemCarrito) {
    itemCarrito.cantidad++;
  } else {
    let item = {
      id: idProducto,
      cantidad: 1,
    };

    carrito.push(item);
  }
  guardarCarrito();
  renderizarCarrito();
}

gridProductos.addEventListener("click", function (e) {
  if (e.target.classList.contains("btn-agregar")) {
    let idProducto = e.target.dataset.idProducto;
    let idNumber = parseInt(idProducto);
    agregarCarrito(idNumber);
  }
});

function renderizarCarrito() {
  gridCarrito.innerHTML = "";
  let contar = carrito.reduce((contador, item) => {
    return contador + item.cantidad;
  }, 0);

  let subbTotal = carrito.reduce((acumulador, item) => {
    let producto = productos.find((p) => p.id === item.id);

    return acumulador + producto.precio * item.cantidad;
  }, 0);

  let ivas = subbTotal * 0.16;
  let totales = subbTotal + ivas;

  subTotal.textContent = subbTotal.toFixed(2);
  iva.textContent = ivas.toFixed(2);
  total.textContent = totales.toFixed(2);

  for (let i = 0; i < carrito.length; i++) {
    let producto = productos.find((item) => item.id === carrito[i].id);
    let divCarrito = document.createElement("div");
    let name = document.createElement("h4");
    let price = document.createElement("p");
    let cantidad = document.createElement("span");
    let botonEliminar = document.createElement("button");
    let botonCantidad = document.createElement("button");
    let botonReducir = document.createElement("button");
    botonEliminar.dataset.idEliminar = carrito[i].id;
    botonCantidad.dataset.idCantidad = carrito[i].id;
    botonReducir.dataset.idReducir = carrito[i].id;

    divCarrito.classList.add("item-carrito");
    botonCantidad.classList.add("btn-mas");
    cantidad.classList.add("item-cantidad");
    botonReducir.classList.add("btn-menos");
    botonEliminar.classList.add("btn-eliminar");
    botonCantidad.textContent = "+";
    botonReducir.textContent = "-";
    botonEliminar.textContent = "Eliminar";
    cantidad.textContent = carrito[i].cantidad;

    name.textContent = producto.nombre;
    price.textContent = producto.precio;

    divCarrito.appendChild(name);
    divCarrito.appendChild(price);
    divCarrito.appendChild(cantidad);
    divCarrito.appendChild(botonCantidad);
    divCarrito.appendChild(botonReducir);
    divCarrito.appendChild(botonEliminar);

    gridCarrito.appendChild(divCarrito);
  }
}

gridCarrito.addEventListener("click", function (e) {
  if (e.target.classList.contains("btn-eliminar")) {
    let idEliminar = parseInt(e.target.dataset.idEliminar);
    eliminarCarrito(idEliminar);
  }

  if (e.target.classList.contains("btn-mas")) {
    let idCantidad = parseInt(e.target.dataset.idCantidad);
    modificarCantidad(idCantidad, 1);
  }

  if (e.target.classList.contains("btn-menos")) {
    let idReducir = parseInt(e.target.dataset.idReducir);
    modificarCantidad(idReducir, -1);
  }
});

function eliminarCarrito(idEliminar) {
  carrito = carrito.filter((item) => item.id !== idEliminar);
  guardarCarrito();
  renderizarCarrito();
}

function modificarCantidad(idCantidad, valor) {
  let item = carrito.find((item) => item.id === idCantidad);
  item.cantidad += valor;

  if (item.cantidad <= 0) {
    eliminarCarrito(idCantidad);
  }
  guardarCarrito();
  renderizarCarrito();
}

function guardarCarrito() {
  localStorage.setItem("carrito", JSON.stringify(carrito));
}

function cargarCarrito() {
  let carritoGuardado = localStorage.getItem("carrito");
  if (carritoGuardado !== null) {
    carrito = JSON.parse(carritoGuardado);
  }

  renderizarCarrito();
}

btn.addEventListener("click", async function () {
  try {
    const respuesta = await fetch("http://localhost:3000/api/ventas", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ carrito: carrito }),
    });

    if (respuesta.ok) {
      alert("venta exitosa");
      carrito = [];
      localStorage.setItem("carrito", JSON.stringify(carrito));
      renderizarCarrito();
    } else {
      const error = await respuesta.json();
      alert(error.mensaje);
    }
  } catch (error) {
    console.error("error al procesar venta", error);
  }
});

cargarProductos();
