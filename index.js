import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import path from 'path';

// Cargar variables de entorno
dotenv.config();

const app = express();
const port = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// Cargar respuestas empáticas desde archivo JSON
let respuestasAnie = [];
const respuestasPath = path.resolve(process.cwd(), 'respuestasAnie.json');
function cargarRespuestas() {
  try {
    const data = fs.readFileSync(respuestasPath, 'utf-8');
    respuestasAnie = JSON.parse(data);
  } catch (err) {
    console.error('Error cargando respuestasAnie.json:', err);
    respuestasAnie = [];
  }
}
cargarRespuestas();

// Historial en memoria
const historial = [];

// Buscar respuesta empática
function buscarRespuesta(mensaje) {
  const texto = mensaje.toLowerCase();
  for (const item of respuestasAnie) {
    for (const kw of item.keywords) {
      if (kw && texto.includes(kw)) return item.response;
    }
  }
  // Respuesta por defecto
  const def = respuestasAnie.find(r => Array.isArray(r.keywords) && r.keywords.length === 0);
  return def ? def.response : 'Estoy aquí para escucharte 🦋 Cuéntame lo que quieras.';
}

// Endpoint de chat
app.post('/api/chat', (req, res) => {
  try {
    const { message } = req.body;
    if (typeof message !== 'string' || !message.trim()) {
      console.log('Mensaje inválido recibido:', message);
      return res.status(400).json({ error: 'El mensaje es requerido y debe ser un string no vacío.' });
    }
    const respuesta = buscarRespuesta(message);
    const registro = {
      id: uuidv4(),
      user: message,
      bot: respuesta,
      timestamp: new Date().toISOString()
    };
    historial.push(registro);
    console.log(`[${registro.timestamp}] Usuario: ${message}`);
    console.log(`[${registro.timestamp}] Anie: ${respuesta}`);
    return res.json({ reply: respuesta });
  } catch (err) {
    console.error('Error procesando el mensaje:', err);
    return res.status(500).json({ error: 'Error procesando el mensaje' });
  }
});

// Exportar app para Render
export default app;

// Solo escuchar si no está en modo importado
if (process.env.RENDER !== 'true') {
  app.listen(port, () => {
    console.log(`Anie backend escuchando en puerto ${port}`);
  });
} 