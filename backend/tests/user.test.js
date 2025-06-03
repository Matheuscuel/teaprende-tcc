// backend/tests/user.test.js

const request = require('supertest');
const express = require('express');
const userRoutes = require('../routes/userRoutes');

const app = express();
app.use(express.json());
app.use('/api', userRoutes);

describe('Testes da API de Usuários', () => {
  it('deve retornar status 200 na listagem de usuários', async () => {
    const res = await request(app).get('/api/users');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('deve cadastrar um novo usuário', async () => {
    const res = await request(app)
      .post('/api/users')
      .send({
        name: 'Teste Automatizado',
        email: 'teste@automacao.com',
        password: '123456'
      });
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body.name).toBe('Teste Automatizado');
  });
});
