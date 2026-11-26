const form = document.getElementById("form-login");
const user = document.getElementById("usuario");
const password = document.getElementById("contrasena");
const mensaje = document.getElementById("mensaje-error");

form.addEventListener("submit", async function (e) {
  e.preventDefault();

  mensaje.setAttribute("hidden", "");

  const datosLogin = {
    email: user.value,
    password: password.value,
  };

  user.setCustomValidity("");
  password.setCustomValidity("");

  if (user.validity.valueMissing) {
    user.setCustomValidity("el campo email esta vacio");
  } else if (user.validity.typeMismatch) {
    user.setCustomValidity("el formato del email es incorrecto");
  }

  if (password.validity.valueMissing) {
    password.setCustomValidity("El campo contraseña esta vacio");
  }

  if (!user.validity.valid) {
    mensaje.textContent = user.validationMessage;
    user.focus();
    mensaje.removeAttribute("hidden");
    return;
  }

  if (!password.validity.valid) {
    mensaje.textContent = password.validationMessage;
    password.focus();
    mensaje.removeAttribute("hidden");
    return;
  }

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
      if (datos.usuario.rol === "admin") {
        window.location.href = "admin.html";
      } else {
        window.location.href = "index.html";
      }
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
