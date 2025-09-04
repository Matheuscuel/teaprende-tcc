const request = require('supertest');
const app = require('../src/app');

async function loginAsAdmin() {
  const res = await request(app)
    .post('/api/auth/login')
    .send({ email: 'admin@teste.com', password: 'Admin@123' });
  return res.body.token;
}

describe('GET /api/users', () => {
  it('deve exigir token', async () => {
    const res = await request(app).get('/api/users');
    expect(res.status).toBe(401);
  });

  it('deve listar com token', async () => {
    const token = await loginAsAdmin();
    const res = await request(app)
      .get('/api/users')
      .set('Authorization', `Bearer ${token}`);
    expect([200,204]).toContain(res.status);
  });
});
