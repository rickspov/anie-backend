import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';

// Cargar variables de entorno
dotenv.config();

const app = express();
const port = process.env.PORT || 4000;

app.use(cors({ origin: '*' }));
app.options('*', cors());

// Esto permite cualquier origen, útil para desarrollo.
// En producción puedes restringirlo a dominios específicos así:
// app.use(cors({ origin: ['https://tudominio.com', 'http://localhost:5173'] }));

app.use(express.json());

// Historial en memoria con estado
const historial = [];
// Estados de sesión en memoria
const sessionStates = {};

// Utilidad para capitalizar la primera letra
function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// Normaliza texto: minúsculas, sin acentos, sin signos, sin espacios extra
function normalizar(texto) {
  return texto
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // quita acentos
    .replace(/[¡!¿?.,;:]/g, '') // quita signos de puntuación
    .replace(/\s+/g, ' ') // espacios simples
    .trim();
}

// Detectar estado emocional por palabras clave
function detectarEstadoEmocional(mensaje) {
  const texto = normalizar(mensaje);
  
  // Estados emocionales
  const estados = {
    bien: {
      keywords: ['bien', 'feliz', 'contento', 'alegre', 'genial', 'excelente'],
      respuesta: '¡Qué bueno que te sientas bien! 😊 ¿Qué te ha hecho sentir así?',
      nextState: 'talk'
    },
    moderado: {
      keywords: ['moderado', 'regular', 'normal', 'mas o menos', 'así así'],
      respuesta: 'Entiendo, a veces las cosas están en el medio. ¿Quieres contarme más sobre cómo te sientes?',
      nextState: 'talk'
    },
    triste: {
      keywords: ['triste', 'deprimido', 'desanimado', 'mal', 'tristeza'],
      respuesta: 'Lamento que te sientas triste. Estoy aquí para escucharte. ¿Quieres contarme qué te está pasando?',
      nextState: 'talk'
    },
    ansioso: {
      keywords: ['ansioso', 'nervioso', 'estresado', 'ansiedad', 'preocupado', 'inquieto'],
      respuesta: 'La ansiedad puede ser muy difícil. Respira profundo. ¿Quieres que te ayude a calmar esos nervios?',
      nextState: 'talk'
    }
  };

  for (const [estado, config] of Object.entries(estados)) {
    for (const keyword of config.keywords) {
      if (texto.includes(keyword)) {
        return {
          estado,
          respuesta: config.respuesta,
          nextState: config.nextState
        };
      }
    }
  }
  
  return null;
}

// Detectar saludos
function detectarSaludo(mensaje) {
  const texto = normalizar(mensaje);
  const saludos = [
    'hola', 'hey', 'buenos dias', 'buen dia', 'buenas tardes', 
    'buenas noches', 'klk', 'qlk', 'que tal', 'saludos'
  ];
  
  for (const saludo of saludos) {
    if (texto.includes(saludo)) {
      return {
        respuesta: `¡${capitalize(saludo.includes('klk') ? 'Klk' : saludo)}! 😄 Soy Anie, ¿cómo te sientes hoy?`,
        options: ['Bien 😊', 'Regular 😐', 'Triste 😔', 'Ansioso 😰'],
        nextState: 'start'
      };
    }
  }
  
  return null;
}

// Utilidad para agregar el emoji de mariposa a 'Anie'
function anieConMariposa(texto) {
  return texto.replace(/Anie/gi, match => match + ' 🦋');
}

// Función principal de respuesta con máquina de estados
function generarRespuesta(mensaje, sessionId) {
  const estadoActual = sessionStates[sessionId] || 'start';
  
  // Detectar saludos (siempre disponibles)
  const saludoResp = detectarSaludo(mensaje);
  if (saludoResp) {
    sessionStates[sessionId] = saludoResp.nextState;
    return saludoResp;
  }
  
  // Si estamos en estado inicial, detectar estado emocional
  if (estadoActual === 'start') {
    const estadoEmocional = detectarEstadoEmocional(mensaje);
    if (estadoEmocional) {
      sessionStates[sessionId] = estadoEmocional.nextState;
      return {
        respuesta: estadoEmocional.respuesta,
        options: ['Contar más', 'Necesito ayuda', 'Programar sesión'],
        nextState: estadoEmocional.nextState
      };
    }
  }
  
  // Si estamos en estado de conversación
  if (estadoActual === 'talk') {
    // Detectar intenciones de programar
    const texto = normalizar(mensaje);
    if (texto.includes('programar') || texto.includes('cita') || texto.includes('sesion') || texto.includes('agendar')) {
      sessionStates[sessionId] = 'schedule';
      return {
        respuesta: 'Perfecto, te ayudo a programar una sesión. ¿Qué día te viene mejor?',
        options: ['Hoy', 'Mañana', 'Esta semana', 'Próxima semana'],
        nextState: 'schedule'
      };
    }
    
    // Detectar necesidad de ayuda
    if (texto.includes('ayuda') || texto.includes('no se que hacer') || texto.includes('solo')) {
      return {
        respuesta: 'No estás solo, estoy aquí para acompañarte. ¿Quieres que programemos una sesión o prefieres seguir hablando?',
        options: ['Seguir hablando', 'Programar sesión', 'Necesito más ayuda'],
        nextState: 'talk'
      };
    }
    
    // Respuesta empática general
    return {
      respuesta: 'Te escucho. ¿Quieres contarme más o prefieres que programemos una sesión?',
      options: ['Contar más', 'Programar sesión', 'Terminar por hoy'],
      nextState: 'talk'
    };
  }
  
  // Si estamos en estado de programación
  if (estadoActual === 'schedule') {
    const texto = normalizar(mensaje);
    if (texto.includes('hoy') || texto.includes('ahora')) {
      sessionStates[sessionId] = 'end';
      return {
        respuesta: '¡Perfecto! Te he programado una sesión para hoy. Te contactaré pronto. ¡Cuídate mucho! 🦋',
        nextState: 'end'
      };
    }
    
    if (texto.includes('mañana')) {
      sessionStates[sessionId] = 'end';
      return {
        respuesta: '¡Genial! Te he programado una sesión para mañana. Te contactaré para confirmar. ¡Que tengas un buen día! 🦋',
        nextState: 'end'
      };
    }
    
    if (texto.includes('semana')) {
      sessionStates[sessionId] = 'end';
      return {
        respuesta: '¡Perfecto! Te he programado una sesión para esta semana. Te contactaré con los detalles. ¡Gracias por confiar en mí! 🦋',
        nextState: 'end'
      };
    }
    
    return {
      respuesta: '¿Qué día te viene mejor? Puedes decirme "hoy", "mañana" o "esta semana".',
      options: ['Hoy', 'Mañana', 'Esta semana'],
      nextState: 'schedule'
    };
  }
  
  // Fallback
  return {
    respuesta: 'Estoy aquí para escucharte 🦋 Cuéntame lo que quieras.',
    options: ['¿Cómo te sientes?', 'Necesito ayuda', 'Programar sesión'],
    nextState: 'start'
  };
}

// Endpoint de chat
app.post('/api/chat', (req, res) => {
  try {
    const { message, sessionId } = req.body;
    
    if (typeof message !== 'string' || !message.trim()) {
      return res.status(400).json({ error: 'El mensaje es requerido y debe ser un string no vacío.' });
    }
    
    // Manejo especial para __init__
    if (message === '__init__') {
      const saludo = {
        respuesta: '¡Hola! 😄 Soy Anie, ¿cómo te sientes hoy?',
        options: ['Bien 😊', 'Regular 😐', 'Triste 😔', 'Ansioso 😰'],
        nextState: 'start'
      };
      const currentSessionId = sessionId || uuidv4();
      sessionStates[currentSessionId] = 'start';
      return res.json({
        reply: anieConMariposa(saludo.respuesta),
        options: saludo.options,
        nextState: saludo.nextState,
        sessionId: currentSessionId
      });
    }
    
    // Generar sessionId si no existe
    const currentSessionId = sessionId || uuidv4();
    
    // Generar respuesta
    const respuesta = generarRespuesta(message, currentSessionId);
    
    // Agregar emoji a la respuesta del bot
    const respuestaBot = anieConMariposa(respuesta.respuesta);
    
    // Guardar en historial
    const registro = {
      id: uuidv4(),
      user: message,
      bot: respuestaBot,
      timestamp: new Date().toISOString(),
      state: respuesta.nextState,
      sessionId: currentSessionId
    };
    // No guardar __init__ en historial (ya controlado arriba)
    historial.push(registro);
    
    console.log(`[${registro.timestamp}] Sesión: ${currentSessionId} | Usuario: ${message}`);
    console.log(`[${registro.timestamp}] Anie: ${respuestaBot} | Estado: ${respuesta.nextState}`);
    
    return res.json({
      reply: respuestaBot,
      options: respuesta.options || [],
      nextState: respuesta.nextState,
      sessionId: currentSessionId
    });
    
  } catch (err) {
    console.error('Error procesando el mensaje:', err);
    return res.status(500).json({ error: 'Error procesando el mensaje' });
  }
});

// Endpoint para obtener historial
app.get('/api/history', (req, res) => {
  try {
    const { sessionId } = req.query;
    
    if (!sessionId) {
      return res.status(400).json({ error: 'sessionId es requerido' });
    }
    
    const sessionHistory = historial.filter(entry => entry.sessionId === sessionId);
    
    return res.json({
      history: sessionHistory,
      currentState: sessionStates[sessionId] || 'start'
    });
    
  } catch (err) {
    console.error('Error obteniendo historial:', err);
    return res.status(500).json({ error: 'Error obteniendo historial' });
  }
});

// Exporta app para Render
export default app;

// Solo escucha el puerto si el archivo es ejecutado directamente (no importado)
if (process.env.NODE_ENV !== 'test') {
  app.listen(port, () => {
    console.log(`Anie backend escuchando en puerto ${port}`);
  });
} 