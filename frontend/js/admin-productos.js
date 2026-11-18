function guardiaSeguridad() {
  const usuarioLogeado = localStorage.getItem("usuario");
  const token = localStorage.getItem("token");
  if (!usuarioLogeado || !token) {
    window.location.href = "login.html";
    return;
  }

  const usuarioObjeto = JSON.parse(usuarioLogeado);

  if (usuarioObjeto.rol !== "admin") {
    window.location.href = "index.html";
    return;
  }
}

guardiaSeguridad();

const tabla = document.getElementById("tabla-productos");
const token = localStorage.getItem("token");
let productos = [];
let isEditable = null;
let modo = "editar";

const dialogo = document.getElementById("dialogo-editar");
const form = document.getElementById("form-editar");
const inputName = document.getElementById("edit-nombre");
const inpuntPrecio = document.getElementById("edit-precio");
const selectCategory = document.getElementById("edit-categoria");
const inputImg = document.getElementById("edit-img");
const vistaPrevia = document.getElementById("edit-img-preview");
const errorEdit = document.getElementById("edit-error");
const btnCancelar = document.getElementById("btn-cancelar-edicion");
const btnGuardar = document.getElementById("btn-guardar-edicion");
const btnSesion = document.getElementById("btn-cerrar-sesion");
const btnAgregar = document.getElementById("btn-agregar-producto");
const titulo = document.getElementById("titulo-dialogo");

async function cargarProductos() {
  try {
    const respuesta = await fetch("http://localhost:3000/api/productos");
    if (respuesta.ok) {
      productos = await respuesta.json();
      renderizarTabla();
    }
  } catch (error) {
    console.error("error al cargar los productos", error);
  }
}

function renderizarTabla() {
  tabla.innerHTML = "";
  productos.forEach((producto) => {
    let tr = document.createElement("tr");

    let nombre = document.createElement("td");
    nombre.textContent = producto.nombre;

    let precio = document.createElement("td");
    precio.textContent = producto.precio;

    let categoria = document.createElement("td");
    categoria.textContent = producto.categoria;

    let tdImg = document.createElement("td");
    let img = document.createElement("img");
    img.src = producto.img;
    tdImg.appendChild(img);

    let tdAccions = document.createElement("td");
    let btnEdit = document.createElement("button");
    btnEdit.dataset.id = producto.id;
    btnEdit.textContent = "✏️";
    btnEdit.classList.add("btn-editar");
    let btnEliminar = document.createElement("button");
    btnEliminar.dataset.id = producto.id;
    btnEliminar.textContent = "🗑️";
    btnEliminar.classList.add("btn-eliminar");
    tdAccions.appendChild(btnEdit);
    tdAccions.appendChild(btnEliminar);

    tr.appendChild(nombre);
    tr.appendChild(precio);
    tr.appendChild(categoria);
    tr.appendChild(tdImg);
    tr.appendChild(tdAccions);

    tabla.appendChild(tr);
  });
}

tabla.addEventListener("click", async function (e) {
  const boton = e.target.closest("button");
  if (!boton) return;

  const idProduct = parseInt(boton.dataset.id);
  if (boton.classList.contains("btn-editar")) {
    abrirEdit(idProduct);
  } else if (boton.classList.contains("btn-eliminar")) {
    if (!confirm("¿Eliminar este producto?")) return;
    try {
      const respuesta = await fetch(
        `http://localhost:3000/api/admin/productos/${idProduct}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (respuesta.ok) {
        cargarProductos();
      }
    } catch (error) {
      console.error("error al eliminar el producto", error);
    }
  }
});

function abrirEdit(id) {
  const producto = productos.find((p) => p.id === id);
  if (!producto) return;

  modo = "editar";
  isEditable = id;
  inputName.value = producto.nombre;
  inpuntPrecio.value = producto.precio;
  selectCategory.value = producto.categoria;
  inputImg.value = producto.img;
  vistaPrevia.src = producto.img;
  titulo.textContent = "Editar Producto";
  btnGuardar.textContent = "Guardar Cambios";
  errorEdit.hidden = "true";
  dialogo.showModal();
}

btnAgregar.addEventListener("click", function () {
  abrirAgregar();
});

function abrirAgregar() {
  modo = "crear";
  form.reset();
  titulo.textContent = "Agregar Producto";
  btnGuardar.textContent = "Guardar Producto";
  vistaPrevia.removeAttribute("src");
  dialogo.showModal();
}

btnCancelar.addEventListener("click", function () {
  dialogo.close();
});

inputImg.addEventListener("input", function () {
  vistaPrevia.src = inputImg.value;
});

form.addEventListener("submit", async function (e) {
  e.preventDefault();

  const datos = {
    nombre: inputName.value.trim(),
    precio: parseFloat(inpuntPrecio.value),
    categoria: selectCategory.value,
    img: inputImg.value.trim(),
  };
  const url =
    modo === "crear"
      ? `http://localhost:3000/api/admin/productos`
      : `http://localhost:3000/api/admin/productos/${isEditable}`;
  const method = modo === "crear" ? "POST" : "PUT";

  try {
    const respuesta = await fetch(url, {
      method: method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(datos),
    });

    if (respuesta.ok) {
      dialogo.close();
      cargarProductos();
    } else {
      errorEdit.textContent = "No se pudo guardar el producto.";
      errorEdit.hidden = false;
    }
  } catch (error) {
    console.error("error al editar el producto", error);
  }
});

btnSesion.addEventListener("click", function () {
  localStorage.clear();
  window.location.href = "login.html";
});

cargarProductos();
