function guardiaSeguridad() {
  const usuarioLogeado = localStorage.getItem("usuario");
  const token = localStorage.getItem("token");

  if (!usuarioLogeado || !token) {
    return (window.location.href = "login.html");
  }
}

guardiaSeguridad();

const url = "http://localhost:3000/api/cliente/billetera";

const saldo = document.getElementById("saldo-actual");
const movimientos = document.getElementById("lista-movimientos");
const btnRecarga = document.getElementById("btn-recargar");
const token = localStorage.getItem("token");

async function cargarBilletera() {
  try {
    const respuesta = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (respuesta.ok) {
      const datos = await respuesta.json();
      saldo.textContent = `$${datos.saldo}`;

      renderizarMovimientos(datos);
    } else {
      localStorage.clear();
      window.location.href = "login.html";
    }
  } catch (error) {
    console.error(
      "error al obtener el historial y el saldo de la billetera",
      error,
    );
  }
}

function renderizarMovimientos(datos) {
  movimientos.innerHTML = "";
  datos.movimientos.forEach((p) => {
    let nuevoDiv = document.createElement("div");
    nuevoDiv.classList.add("movimiento");

    let movimientoInfo = document.createElement("div");
    movimientoInfo.classList.add("movimiento-info");

    let descripcion = document.createElement("strong");
    descripcion.textContent = p.descripcion;

    let fecha = document.createElement("small");
    fecha.textContent = new Date(p.fecha).toLocaleString();

    movimientoInfo.appendChild(descripcion);
    movimientoInfo.appendChild(fecha);

    let monto = document.createElement("span");
    monto.classList.add("movimiento-monto");
    monto.textContent = `$${p.monto}`;

    if (p.tipo === "recarga" || p.monto > 0) {
      monto.classList.add("positivo");
    } else {
      monto.classList.add("negativo");
    }

    nuevoDiv.appendChild(movimientoInfo);
    nuevoDiv.appendChild(monto);

    movimientos.appendChild(nuevoDiv);
  });
}

btnRecarga.addEventListener("click", async function () {
  const descripcion = document.getElementById("descripcion-recarga");
  const monto = document.getElementById("monto-recarga");

  const montoValor = parseFloat(monto.value);

  if (!montoValor || montoValor <= 0) {
    alert("el monto debe ser mayor a 0");
    return;
  }

  const datos = {
    monto: montoValor,
    descripcion: descripcion.value,
  };

  try {
    const respuesta = await fetch(
      "http://localhost:3000/api/cliente/recargar",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(datos),
      },
    );

    if (respuesta.ok) {
      alert("recarga exitosa");
      descripcion.value = "";
      monto.value = "";
      cargarBilletera();
    } else {
      const error = await respuesta.json();
      alert(error.mensaje || "Error al recargar");
    }
  } catch (error) {
    console.error("error al realizar la recarga", error);
    alert("Error de conexión con el servidor");
  }
});

cargarBilletera();
