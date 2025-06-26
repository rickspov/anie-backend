// Función para buscar respuesta personalizada para Anie
function buscarRespuesta(mensaje) {
  if (typeof mensaje !== 'string') return 'Estoy aquí para escucharte 🦋 Cuéntame lo que quieras.';
  const texto = mensaje.toLowerCase();

  if (texto.includes('no se que hacer')) {
    return 'Entiendo que te sientas perdido/a. Estoy aquí para ayudarte a encontrar un camino paso a paso.';
  }
  if (texto.includes('como estas')) {
    return 'Gracias por preguntar 😊 Yo estoy aquí para escucharte y acompañarte en lo que necesites.';
  }
  if (texto.includes('que hago')) {
    return 'A veces no sabemos qué hacer, y está bien. ¿Quieres contarme qué te preocupa para que podamos buscar juntos una solución?';
  }
  if (texto.includes('estoy triste')) {
    return 'Siento mucho que te sientas triste. Estoy aquí contigo y podemos hablar sobre lo que te pasa.';
  }
  if (texto.includes('me siento mal')) {
    return 'Lamento que te sientas mal. Si quieres, cuéntame más para poder acompañarte mejor.';
  }
  if (texto.includes('hola')) {
    return '¡Hola! 😊 Me alegra que hayas venido a hablar conmigo. ¿Cómo te sientes hoy?';
  }

  return 'Estoy aquí para escucharte 🦋 Cuéntame lo que quieras.';
}

// Ejemplos de uso:
console.log(buscarRespuesta('Hola Anie!'));
// → ¡Hola! 😊 Me alegra que hayas venido a hablar conmigo. ¿Cómo te sientes hoy?

console.log(buscarRespuesta('No se que hacer con mi vida...'));
// → Entiendo que te sientas perdido/a. Estoy aquí para ayudarte a encontrar un camino paso a paso.

console.log(buscarRespuesta('¿Cómo estas?'));
// → Gracias por preguntar 😊 Yo estoy aquí para escucharte y acompañarte en lo que necesites.

console.log(buscarRespuesta('Me siento mal hoy'));
// → Lamento que te sientas mal. Si quieres, cuéntame más para poder acompañarte mejor.

console.log(buscarRespuesta('Estoy triste por una situación.'));
// → Siento mucho que te sientas triste. Estoy aquí contigo y podemos hablar sobre lo que te pasa.

console.log(buscarRespuesta('¿Qué hago ahora?'));
// → A veces no sabemos qué hacer, y está bien. ¿Quieres contarme qué te preocupa para que podamos buscar juntos una solución?

console.log(buscarRespuesta('Quiero hablar.'));
// → Estoy aquí para escucharte 🦋 Cuéntame lo que quieras. 