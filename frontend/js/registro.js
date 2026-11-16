const form = document.getElementById("form-registro");
const nombre = document.getElementById("nombre-input");
const email = document.getElementById("email");
const password = document.getElementById("password");
const confirmarPassword = document.getElementById("confirmar_password");
const msjError = document.getElementById("mensaje-error");

nombre.addEventListener("input", function () {
  validarName(nombre.value);
});

email.addEventListener("input", function () {
  validarEmail(email.value);
});

password.addEventListener("input", function () {
  validarPassword(password.value);
  if (confirmPassword.value !== "") {
    confirmPassword(password.value, confirmarPassword.value);
  }
});

confirmarPassword.addEventListener("input", function () {
  confirmPassword(password.value, confirmarPassword.value);
});

function validarName(valor) {
  const validacion = /^[A-ZÁÉÍÓÚÑ][a-záéíóúñ]+\s+[A-ZÁÉÍÓÚÑ][a-záéíóúñ]+$/;
  const error = document.getElementById("error-nombre");
  if (valor === "") {
    nombre.classList.remove("valido", "invalido");
    error.classList.add("oculto");
  } else if (validacion.test(valor)) {
    nombre.classList.add("valido");
    nombre.classList.remove("invalido");
    error.classList.add("oculto");
    return true;
  } else {
    nombre.classList.add("invalido");
    nombre.classList.remove("valido");
    error.textContent = "Debe escribir un nombre valido";
    error.classList.remove("oculto");
    return false;
  }
}

function validarEmail(valor) {
  const validacion = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const error = document.getElementById("error-email");

  if (valor === "") {
    email.classList.remove("valido", "invalido");
    error.classList.add("oculto");
  } else if (validacion.test(valor)) {
    email.classList.add("valido");
    email.classList.remove("invalido");
    error.classList.add("oculto");
    return true;
  } else {
    email.classList.add("invalido");
    email.classList.remove("valido");
    error.textContent = "Debe ingresar un correo electronico valido";
    error.classList.remove("oculto");
    return false;
  }
}

function validarPassword(valor) {
  const validacion = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
  const error = document.getElementById("error-password");

  if (valor === "") {
    password.classList.remove("valido", "invalido");
    error.classList.add("oculto");
  } else if (validacion.test(valor)) {
    password.classList.add("valido");
    password.classList.remove("invalido");
    error.classList.add("oculto");
    return true;
  } else {
    password.classList.add("invalido");
    password.classList.remove("valido");
    error.textContent =
      "Introduce una combinación de al menos 8 caracteres, letras y signos de puntuación (como ! y &).";
    error.classList.remove("oculto");
    return false;
  }
}

function confirmPassword(valor1, valor2) {
  const error = document.getElementById("error-confirmar_password");
  if (valor1 === "" || valor2 === "") {
    password.classList.remove("valido", "invalido");
    confirmarPassword.classList.remove("valido", "invalido");
    error.classList.add("oculto");
  } else if (valor1 === valor2) {
    password.classList.add("valido");
    password.classList.remove("invalido");
    confirmarPassword.classList.add("valido");
    confirmarPassword.classList.remove("invalido");
    error.classList.add("oculto");
    return true;
  } else {
    password.classList.add("invalido");
    password.classList.remove("valido");
    confirmarPassword.classList.add("invalido");
    confirmarPassword.classList.remove("valido");
    error.textContent = "La contraseña no coincide";
    error.classList.remove("oculto");
    return false;
  }
}

function validarForm() {
  if (
    validarName(nombre.value) &
    validarEmail(email.value) &
    validarPassword(password.value) &
    confirmPassword(password.value, confirmarPassword.value)
  ) {
    return true;
  } else {
    return false;
  }
}

form.addEventListener("submit", async function (e) {
  e.preventDefault();
  try {
    const respuesta = await fetch("http://localhost:3000/api/registro", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        nombre: nombre.value,
        email: email.value,
        password: password.value,
        rol: "cliente",
      }),
    });

    if (respuesta.ok) {
      if (validarForm()) {
        nombre.value = "";
        email.value = "";
        password.value = "";
        confirmarPassword.value = "";
        nombre.classList.remove("valido", "invalido");
        email.classList.remove("valido", "invalido");
        password.classList.remove("valido", "invalido");
        confirmarPassword.classList.remove("valido", "invalido");
      }
      window.location.href = "login.html";
    } else {
      msjError.textContent = "Error al registrarse";
      msjError.removeAttribute("hidden");
    }
  } catch (error) {
    console.error("error al registrarse ", error);
  }
});
