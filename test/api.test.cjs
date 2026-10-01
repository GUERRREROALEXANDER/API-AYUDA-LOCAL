const { test } = require('node:test');
const assert = require('node:assert/strict');
const { NestFactory } = require('@nestjs/core');
const { ValidationPipe } = require('@nestjs/common');
const { AppModule } = require('../dist/app.module');

const cases = [
  { path: 'users', count: 12, body: { name: 'Alexander Guerrero', email: 'alexander@email.com', telefono: '3001234567', barrio: 'Centro' } },
  { path: 'organizaciones', count: 8, body: { nombre: 'Fundacion Ayuda Social', nit: '900123456', email: 'contacto@fundacion.com', telefono: '3009876543', zona: 'Centro' } },
  { path: 'categorias', count: 8, body: { nombre: 'Salud', descripcion: 'Casos relacionados con apoyo en salud' } },
];

const reporteBase = {
  titulo: 'Reporte de prueba',
  descripcion: 'Descripcion de prueba',
  categoriaId: '1',
  usuarioId: '1',
  barrio: 'Centro',
  direccion: 'Calle 1 #1-1',
  prioridad: 'MEDIA',
};

test('CRUD HTTP base, validacion y errores', async () => {
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
  } finally {
    await app.close();
  }
});

test('Reportes: CRUD, filtros, asignar y rutas anidadas', async () => {
  const app = await NestFactory.create(AppModule, { logger: false });
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));
  await app.listen(0, '127.0.0.1');
  const base = await app.getUrl();
  const request = (method, path, body) => fetch(base + path, {
    method, headers: { 'Content-Type': 'application/json' },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
  try {
    let res = await request('GET', '/reportes');
    assert.equal(res.status, 200);
    assert.equal((await res.json()).length, 4);

    res = await request('GET', '/reportes/1');
    assert.equal(res.status, 200);
    assert.equal((await res.json()).id, '1');
    assert.equal((await request('GET', '/reportes/99999')).status, 404);

    // Filtros por rutas fijas (van antes de ':id')
    res = await request('GET', '/reportes/estado/PENDIENTE');
    assert.equal(res.status, 200);
    assert.ok((await res.json()).every((r) => r.estado === 'PENDIENTE'));
    res = await request('GET', '/reportes/categoria/1');
    assert.ok((await res.json()).every((r) => r.categoriaId === '1'));
    res = await request('GET', '/reportes/barrio/Centro');
    assert.ok((await res.json()).every((r) => r.barrio === 'Centro'));
    res = await request('GET', '/reportes/prioridad/ALTA');
    assert.ok((await res.json()).every((r) => r.prioridad === 'ALTA'));

    // Validacion 400
    assert.equal((await request('POST', '/reportes', {})).status, 400);
    assert.equal((await request('POST', '/reportes', { ...reporteBase, id: 'x' })).status, 400);
    assert.equal((await request('POST', '/reportes', { ...reporteBase, prioridad: 'NOPE' })).status, 400);
    assert.equal((await request('POST', '/reportes', {
      titulo: 'Sin prioridad', descripcion: 'Falta prioridad',
      categoriaId: '2', usuarioId: '1', barrio: 'Centro', direccion: 'Calle 2',
    })).status, 400);

    // CRUD completo
    res = await request('POST', '/reportes', reporteBase);
    assert.equal(res.status, 201);
    const created = await res.json();
    assert.equal(created.estado, 'PENDIENTE');
    assert.ok(created.fechaCreacion);

    const putBody = { titulo: 'Cambio', descripcion: 'Cambio desc', categoriaId: '3', barrio: 'Norte', direccion: 'Calle 9', prioridad: 'URGENTE' };
    res = await request('PUT', '/reportes/' + created.id, putBody);
    assert.equal(res.status, 200);
    assert.equal((await res.json()).prioridad, 'URGENTE');
    assert.equal((await request('PUT', '/reportes/' + created.id, {})).status, 400);
    assert.equal((await request('PUT', '/reportes/' + created.id, { ...putBody, prioridad: 'NOPE' })).status, 400);
    assert.equal((await request('PUT', '/reportes/99999', putBody)).status, 404);

    // PUT /asignar -> PENDIENTE pasa a ASIGNADO
    res = await request('PUT', '/reportes/' + created.id + '/asignar', { orgId: '1' });
    assert.equal(res.status, 200);
    const asignado = await res.json();
    assert.equal(asignado.organizacionId, '1');
    assert.equal(asignado.estado, 'ASIGNADO');
    assert.equal((await request('PUT', '/reportes/' + created.id + '/asignar', {})).status, 400);
    assert.equal((await request('PUT', '/reportes/99999/asignar', { orgId: '1' })).status, 404);

    // Rutas anidadas
    res = await request('GET', '/users/1/reportes');
    assert.equal(res.status, 200);
    assert.ok((await res.json()).every((r) => r.usuarioId === '1'));
    assert.equal((await request('GET', '/users/99999/reportes')).status, 404);
    res = await request('GET', '/organizaciones/1/reportes');
    assert.equal(res.status, 200);
    assert.ok((await res.json()).every((r) => r.organizacionId === '1'));
    assert.equal((await request('GET', '/organizaciones/99999/reportes')).status, 404);

    assert.equal((await request('DELETE', '/reportes/' + created.id)).status, 200);
    assert.equal((await request('GET', '/reportes/' + created.id)).status, 404);
  } finally {
    await app.close();
  }
});

test('Seguimientos: historial y cambio de estado', async () => {
  const app = await NestFactory.create(AppModule, { logger: false });
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));
  await app.listen(0, '127.0.0.1');
  const base = await app.getUrl();
  const request = (method, path, body) => fetch(base + path, {
    method, headers: { 'Content-Type': 'application/json' },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
  try {
    let res = await request('GET', '/reportes/2/seguimientos');
    assert.equal(res.status, 200);
    assert.ok(Array.isArray(await res.json()));
    assert.equal((await request('GET', '/reportes/99999/seguimientos')).status, 404);

    // Crear reporte fresco para probar transiciones
    res = await request('POST', '/reportes', reporteBase);
    const rep = await res.json();

    // Cada seguimiento registra estadoAnterior y cambia al estadoNuevo
    res = await request('POST', `/reportes/${rep.id}/seguimientos`, { autorId: '1', nota: 'Visita inicial', estadoNuevo: 'ASIGNADO' });
    assert.equal(res.status, 201);
    const seg1 = await res.json();
    assert.equal(seg1.estadoAnterior, 'PENDIENTE');
    assert.equal(seg1.estadoNuevo, 'ASIGNADO');
    assert.equal((await (await request('GET', `/reportes/${rep.id}`)).json()).estado, 'ASIGNADO');

    res = await request('POST', `/reportes/${rep.id}/seguimientos`, { autorId: '1', nota: 'En proceso', estadoNuevo: 'EN_PROCESO' });
    assert.equal(res.status, 201);
    assert.equal((await res.json()).estadoNuevo, 'EN_PROCESO');
    assert.equal((await (await request('GET', `/reportes/${rep.id}`)).json()).estado, 'EN_PROCESO');

    assert.equal((await request('POST', `/reportes/${rep.id}/seguimientos`, {})).status, 400);
    assert.equal((await request('POST', `/reportes/${rep.id}/seguimientos`, { autorId: '1', nota: 'x' })).status, 400);
    assert.equal((await request('POST', `/reportes/${rep.id}/seguimientos`, { autorId: '1', nota: 'x', estadoNuevo: 'NOPE' })).status, 400);
    assert.equal((await request('POST', '/reportes/99999/seguimientos', { autorId: '1', nota: 'x', estadoNuevo: 'ASIGNADO' })).status, 404);

    res = await request('GET', `/reportes/${rep.id}/seguimientos`);
    assert.equal((await res.json()).length, 2);
  } finally {
    await app.close();
  }
});
