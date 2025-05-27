require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cron = require('node-cron');
const axios = require('axios');
const nodemailer = require('nodemailer');
const cors = require('cors');

const User = require('./user');
const app = express();

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB conectado'))
  .catch(err => console.error('Erro ao conectar MongoDB:', err));

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Cadastro
app.post('/api/register', async (req, res) => {
  const { name, email, city } = req.body;
  try {
    const user = new User({ name, email, city });
    await user.save();
    res.status(201).send('Usuário registrado com sucesso');
  } catch (error) {
    res.status(500).send('Erro ao registrar usuário');
  }
});

// Verificação de alertas a cada 3 horas
cron.schedule('0 */3 * * *', async () => {
  const users = await User.find();
  for (const user of users) {
    try {
      const response = await axios.get(`https://api.openweathermap.org/data/2.5/weather?q=${user.city}&appid=${process.env.WEATHER_API_KEY}&lang=pt_br`);
      const weather = response.data.weather[0].description;

      if (weather.includes("chuva") || weather.includes("tempestade")) {
        await transporter.sendMail({
          from: '"AlertaClima" <' + process.env.EMAIL_USER + '>',
          to: user.email,
          subject: "⚠️ Alerta Meteorológico!",
          text: `Olá, ${user.name}! Atenção para condições climáticas em ${user.city}: ${weather}`
        });
      }
    } catch (error) {
      console.error('Erro ao buscar clima ou enviar email:', error);
    }
  }
});

app.listen(3000, () => console.log('Servidor rodando na porta 3000'));