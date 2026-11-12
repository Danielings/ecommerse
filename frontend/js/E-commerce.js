const productos = [
  {
    id: 1,
    nombre: "Camiseta Básica",
    precio: 299,
    categoria: "ropa",
    imagen:
      "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=500&q=80",
  },
  {
    id: 2,
    nombre: "Zapatillas Deportivas",
    precio: 899,
    categoria: "calzado",
    imagen:
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=500&q=80",
  },
  {
    id: 3,
    nombre: "Pantalón Vaquero",
    precio: 599,
    categoria: "ropa",
    imagen:
      "https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&w=500&q=80",
  },
  {
    id: 4,
    nombre: "Chaqueta de Cuero",
    precio: 1499,
    categoria: "ropa",
    imagen:
      "https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=500&q=80",
  },
  {
    id: 5,
    nombre: "Gorra Casual",
    precio: 199,
    categoria: "accesorios",
    imagen:
      "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?auto=format&fit=crop&w=500&q=80",
  },
  {
    id: 6,
    nombre: "Mochila Urbana",
    precio: 699,
    categoria: "accesorios",
    imagen:
      "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=500&q=80",
  },
  {
    id: 7,
    nombre: "Reloj Minimalista",
    precio: 1299,
    categoria: "accesorios",
    imagen:
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=500&q=80",
  },
  {
    id: 8,
    nombre: "Gafas de Sol",
    precio: 450,
    categoria: "accesorios",
    imagen:
      "https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&w=500&q=80",
  },
  {
    id: 9,
    nombre: "Sudadera con Capucha",
    precio: 799,
    categoria: "ropa",
    imagen:
      "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=500&q=80",
  },
  {
    id: 10,
    nombre: "Botas de Invierno",
    precio: 1199,
    categoria: "calzado",
    imagen:
      "https://images.unsplash.com/photo-1608256246200-53e635b5b65f?auto=format&fit=crop&w=500&q=80",
  },
  {
    id: 11,
    nombre: "Cinturón de Cuero",
    precio: 250,
    categoria: "accesorios",
    imagen:
      "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=500&q=80",
  },
  {
    id: 12,
    nombre: "Bufanda de Lana",
    precio: 320,
    categoria: "accesorios",
    imagen:
      "https://images.unsplash.com/photo-1520903920243-00d872a2d1c9?auto=format&fit=crop&w=500&q=80",
  },
];

function guardiaSeguridad() {
  let usuario = localStorage.getItem("usuarioLogeado");
  if (usuario === null) {
    window.location.href = "login.html";
  }
}

guardiaSeguridad();

let carrito = [];

let gridProductos = document.getElementById("grid-productos");
let gridCarrito = document.getElementById("lista-carrito");
let btn = document.getElementById("btn-finalizar");
let subTotal = document.getElementById("subtotal");
let iva = document.getElementById("iva");
let total = document.getElementById("total");
let categoriaActual = "todos";
let filtro = document.querySelector(".filtros");
let btnSesion = document.getElementById("btn-cerrar-sesion");

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
    renderizarProductos();
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

    img.src = productosAMostrar[i].imagen;
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

renderizarProductos();

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

btn.addEventListener("click", function () {
  if (carrito.length === 0) {
    alert("No hay productos para procesar la venta");
  } else {
    alert("Compra finalizada");
    carrito = [];
    localStorage.setItem("carrito", JSON.stringify(carrito));
    renderizarCarrito();
  }
});

cargarCarrito();
