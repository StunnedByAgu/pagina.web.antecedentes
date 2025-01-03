const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const port = 3000;

// Conectar a la base de datos SQLite
const db = new sqlite3.Database('./database.sqlite', (err) => {
  if (err) {
    console.error('Error connecting to the database:', err.message);
  } else {
    console.log('Connected to the SQLite database.');
    // Crear las tablas si no existen
    db.run(`CREATE TABLE IF NOT EXISTS antecedentes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      rut TEXT,
      nombreCompleto TEXT,
      tipo TEXT,
      descripcion TEXT,
      fecha DATE
    )`);
    db.run(`CREATE TABLE IF NOT EXISTS multas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      rut TEXT,
      nombreCompleto TEXT,
      tipo TEXT,
      descripcion TEXT,
      monto REAL,
      fecha DATE
    )`);
  }
});

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Ruta para servir el archivo HTML
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Ruta para consultar antecedentes y multas
app.post('/consulta', (req, res) => {
  const { rut, nombreCompleto } = req.body;
  const antecedentes = [];
  const multas = [];

  db.all('SELECT tipo, descripcion, fecha FROM antecedentes WHERE rut = ? AND nombreCompleto = ?', [rut, nombreCompleto], (err, rows) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Error al consultar antecedentes' });
    }
    antecedentes.push(...rows);

    db.all('SELECT tipo, descripcion, monto, fecha FROM multas WHERE rut = ? AND nombreCompleto = ?', [rut, nombreCompleto], (err, rows) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: 'Error al consultar multas' });
      }
      multas.push(...rows);

      res.json({ antecedentes, multas });
    });
  });
});

// Ruta para registrar antecedentes
app.post('/registrar-antecedente', (req, res) => {
  const { rut, nombreCompleto, tipoAntecedente, descripcion, fecha } = req.body;
  db.run('INSERT INTO antecedentes (rut, nombreCompleto, tipo, descripcion, fecha) VALUES (?, ?, ?, ?, ?)', 
    [rut, nombreCompleto, tipoAntecedente, descripcion, fecha], 
    function(err) {
      if (err) {
        console.error(err);
        return res.status(500).json({ success: false, message: 'Error al registrar el antecedente' });
      }
      res.json({ success: true, message: 'Antecedente registrado exitosamente' });
    }
  );
});

// Ruta para registrar multas
app.post('/registrar-multa', (req, res) => {
  const { rut, nombreCompleto, tipoMulta, descripcion, monto, fecha } = req.body;
  db.run('INSERT INTO multas (rut, nombreCompleto, tipo, descripcion, monto, fecha) VALUES (?, ?, ?, ?, ?, ?)', 
    [rut, nombreCompleto, tipoMulta, descripcion, monto, fecha], 
    function(err) {
      if (err) {
        console.error(err);
        return res.status(500).json({ success: false, message: 'Error al registrar la multa' });
      }
      res.json({ success: true, message: 'Multa registrada exitosamente' });
    }
  );
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

