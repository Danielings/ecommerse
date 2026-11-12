let form = document.getElementById("form-login");
let user = document.getElementById("usuario");
let password = document.getElementById("contrasena");
let mensaje = document.getElementById("mensaje-error");

let usuariosRegistrados = [
  { usuario: "admin", password: "1234", nombre: "Administrador" },
  { usuario: "cliente", password: "abcd", nombre: "Juan Pérez" },
  { usuario: "cliente2", password: "12345", nombre: "Jose Lujan" },
];

form.addEventListener("submit", function (e) {
  e.preventDefault();

  let usuario = usuariosRegistrados.find(
    (item) => item.usuario === user.value && item.password === password.value,
  );

  if (usuario) {
    localStorage.setItem("usuarioLogeado", usuario.usuario);
    window.location.href = "index.html";
  } else {
    mensaje.removeAttribute("hidden");
    mensaje.textContent = "Credenciales Invalidas";
    user.value = "";
    password.value = "";
  }
});
