const { test } = require('node:test');
const assert = require('node:assert/strict');
const { NestFactory } = require('@nestjs/core');
const { ValidationPipe } = require('@nestjs/common');
const { AppModule } = require('../dist/app.module');
const cases = [{"path":"users","count":12,"body":{"name":"Alexander Guerrero","email":"alexander@email.com","telefono":"3001234567","barrio":"Centro"}},{"path":"organizaciones","count":8,"body":{"nombre":"Fundacion Ayuda Social","nit":"900123456","email":"contacto@fundacion.com","telefono":"3009876543","zona":"Centro"}},{"path":"categorias","count":8,"body":{"nombre":"Salud","descripcion":"Casos relacionados con apoyo en salud"}}];

test('CRUD HTTP de los tres modulos, validacion y errores', async () => {
  const app = await NestFactory.create(AppModule, { logger: false });
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));
  await app.listen(0, '127.0.0.1');
  const base = await app.getUrl();
  const request = (method, path, body) => fetch(base + path, {
    method, headers: { 'Content-Type': 'application/json' },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
  try {
    for (const c of cases) {
      let res = await request('GET', '/' + c.path);
      assert.equal(res.status, 200);
      assert.equal((await res.json()).length, c.count);
      res = await request('GET', '/' + c.path + '/1');
      assert.equal(res.status, 200);
      assert.equal((await res.json()).id, '1');
      for (const method of ['GET', 'PUT', 'DELETE']) {
        res = await request(method, '/' + c.path + '/99999', method === 'PUT' ? c.body : undefined);
        assert.equal(res.status, 404);
      }
      for (const bad of [{}, { ...c.body, id: 'injected' }, { ...c.body, [Object.keys(c.body)[0]]: '   ' }]) {
        assert.equal((await request('POST', '/' + c.path, bad)).status, 400);
      }
      if (c.body.email) {
        assert.equal((await request('POST', '/' + c.path, { ...c.body, email: 'incorrecto' })).status, 400);
      }
      res = await request('POST', '/' + c.path, c.body);
      assert.equal(res.status, 201);
      const created = await res.json();
      assert.ok(created.id);
      assert.notEqual(created.id, '1');
      const changes = { ...c.body, [Object.keys(c.body)[0]]: 'Cambio probado' };
      res = await request('PUT', '/' + c.path + '/' + created.id, changes);
      assert.equal(res.status, 200);
      assert.deepEqual(await res.json(), { ...changes, id: created.id });
      assert.equal((await request('PUT', '/' + c.path + '/' + created.id, {})).status, 400);
      assert.equal((await request('DELETE', '/' + c.path + '/' + created.id)).status, 200);
      assert.equal((await request('GET', '/' + c.path + '/' + created.id)).status, 404);
      res = await request('POST', '/' + c.path, c.body);
      assert.notEqual((await res.json()).id, created.id);
    }
    for (const path of ['/reportes', '/seguimientos', '/users/1/reportes']) {
      assert.equal((await request('GET', path)).status, 404);
    }
  } finally {
    await app.close();
  }
});
