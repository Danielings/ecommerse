let form = document.getElementById("form-login");
let user = document.getElementById("usuario");
let password = document.getElementById("contrasena");
let mensaje = document.getElementById("mensaje-error");

form.addEventListener("submit", async function (e) {
  e.preventDefault();

  const datosLogin = {
    email: user.value,
    password: password.value,
  };

  try {
    const respuesta = await fetch("http://localhost:3000/api/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(datosLogin),
    });

    if (respuesta.ok) {
      const datos = await respuesta.json();
      localStorage.setItem("token", datos.token);
      localStorage.setItem("usuario", JSON.stringify(datos.usuario));
      window.location.href = "index.html";
    } else {
      const error = await respuesta.json();
      mensaje.removeAttribute("hidden");
      mensaje.textContent = error.mensaje;
      user.value = "";
      password.value = "";
    }
  } catch (error) {
    console.error("error al inisiar sesion", error);
  }
});
