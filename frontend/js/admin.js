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

const token = localStorage.getItem("token");
const listaOrdenes = document.getElementById("lista-ordenes");
const gananciasTotales = document.getElementById("ganancias-totales");
const totalVentas = document.getElementById("cantidad-ventas");
const btnSalir = document.getElementById("btn-cerrar-sesion");

async function cargarReportes() {
  try {
    const respuesta = await fetch("http://localhost:3000/api/admin/reportes", {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (respuesta.ok) {
      const datos = await respuesta.json();
      gananciasTotales.textContent = `$${datos.metricas.total_ventas}`;
      totalVentas.textContent = datos.metricas.cantidad_ventas;

      datos.ordenes.forEach((orden) => {
        let nuevoDiv = document.createElement("div");
        let fecha = document.createElement("span");
        let total = document.createElement("span");
        let cantidad = document.createElement("span");

        nuevoDiv.classList.add("orden");
        fecha.textContent = new Date(orden.fecha).toLocaleDateString();
        total.textContent = orden.total;
        const detalles = JSON.parse(orden.detalle);

        const totalProductos = detalles.reduce(
          (acumlador, item) => acumlador + item.cantidad,
          0,
        );
        cantidad.textContent = totalProductos;

        nuevoDiv.appendChild(fecha);
        nuevoDiv.appendChild(total);
        nuevoDiv.appendChild(cantidad);
        listaOrdenes.appendChild(nuevoDiv);
      });
    } else {
      localStorage.clear();
      window.location.href = "login.html";
    }
  } catch (error) {
    console.error("error al obtener las ordenes ", error);
  }
}

btnSalir.addEventListener("click", function () {
  localStorage.clear();
  window.location.href = "login.html";
});

cargarReportes();
