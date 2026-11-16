function guardiaSeguridad() {
  const usuarioLogeado = localStorage.getItem("usuario");
  const token = localStorage.getItem("token");
  if (!usuarioLogeado || !token) {
    window.location.href = "login.html";
    return;
  }
}

guardiaSeguridad();

const token = localStorage.getItem("token");
const totalGastado = document.getElementById("total-gastado");
const misCompras = document.getElementById("lista-mis-compras");

async function cargarMisCompras() {
  try {
    const respuesta = await fetch(
      "http://localhost:3000/api/cliente/mis-compras",
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      },
    );

    if (respuesta.ok) {
      const datos = await respuesta.json();
      totalGastado.textContent = datos.totalGastado;

      datos.ordenes.forEach((orden) => {
        let nuevoDiv = document.createElement("div");
        nuevoDiv.classList.add("orden");

        let fecha = document.createElement("span");
        fecha.textContent = new Date(orden.fecha).toLocaleString();

        let total = document.createElement("span");
        total.textContent = `$${orden.total}`;

        let cantidad = document.createElement("span");
        const detalles = JSON.parse(orden.detalle);

        const totalProductos = detalles.reduce(
          (acumulador, item) => acumulador + item.cantidad,
          0,
        );

        cantidad.textContent = totalProductos;

        nuevoDiv.appendChild(fecha);
        nuevoDiv.appendChild(total);
        nuevoDiv.appendChild(cantidad);

        misCompras.appendChild(nuevoDiv);
      });
    } else {
      localStorage.clear();
      window.location.href = "login.html";
    }
  } catch (error) {
    console.error("Error al obtener las Compras ", error);
  }
}

cargarMisCompras();
