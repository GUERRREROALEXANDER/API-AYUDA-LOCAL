const { test } = require('node:test');
const assert = require('node:assert/strict');
const { NestFactory } = require('@nestjs/core');
const { ValidationPipe } = require('@nestjs/common');
const { AppModule } = require('../dist/app.module');

const cases = [
  { path: 'users', count: 12, body: { name: 'Alexander Guerrero', email: 'alexander@email.com', telefono: '3001234567', barrio: 'Centro' } },
  { path: 'organizaciones', count: 8, body: { nombre: 'Fundacion Ayuda Social', nit: '900123456', email: 'contacto@fundacion.com', telefono: '3009876543', zona: 'Centro' } },
  { path: 'categorias', count: 8, body: { nombre: 'Movilidad', descripcion: 'Casos relacionados con transporte y movilidad' } },
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

test('CRUD HTTP base, validacion y errores (Postgres: users, organizaciones, categorias)', async () => {
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
      // Los datos viven en Postgres y se siembran una sola vez: el conteo y el
      // primer registro se leen en vivo en lugar de asumir un ID fijo '1'.
      let res = await request('GET', '/' + c.path);
      assert.equal(res.status, 200);
      const initial = await res.json();
      assert.equal(initial.length, c.count);
      const firstId = initial[0].id;

      res = await request('GET', '/' + c.path + '/' + firstId);
      assert.equal(res.status, 200);
      assert.equal((await res.json()).id, firstId);

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
      assert.notEqual(created.id, firstId);
      assert.ok(created.createdAt);

      const changes = { ...c.body, [Object.keys(c.body)[0]]: 'Cambio probado' };
      res = await request('PUT', '/' + c.path + '/' + created.id, changes);
      assert.equal(res.status, 200);
      const updated = await res.json();
      assert.equal(updated.id, created.id);
      for (const key of Object.keys(changes)) {
        assert.equal(updated[key], changes[key]);
      }
      assert.equal((await request('PUT', '/' + c.path + '/' + created.id, {})).status, 400);
      assert.equal((await request('DELETE', '/' + c.path + '/' + created.id)).status, 200);
      assert.equal((await request('GET', '/' + c.path + '/' + created.id)).status, 404);

      // Segundo registro de prueba: confirma que el ID no se reutiliza y
      // limpia su propio rastro para que el conteo quede igual que al inicio.
      res = await request('POST', '/' + c.path, c.body);
      const created2 = await res.json();
      assert.notEqual(created2.id, created.id);
      assert.equal((await request('DELETE', '/' + c.path + '/' + created2.id)).status, 200);

      res = await request('GET', '/' + c.path);
      assert.equal((await res.json()).length, c.count);
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
    // Reportes vive en Postgres y se siembra una sola vez: se lee el conteo y
    // el primer registro en vivo en lugar de asumir un ID fijo '1'.
    let res = await request('GET', '/reportes');
    assert.equal(res.status, 200);
    const initial = await res.json();
    const initialCount = initial.length;
    const first = initial[0];
    assert.ok(first.categoria?.id);
    assert.ok(first.usuario?.id);

    res = await request('GET', '/reportes/' + first.id);
    assert.equal(res.status, 200);
    assert.equal((await res.json()).id, first.id);
    assert.equal((await request('GET', '/reportes/99999')).status, 404);

    // Filtros por rutas fijas (van antes de ':id'). Cada reporte trae la
    // categoria/usuario/organizacion completas, no solo su ID.
    res = await request('GET', '/reportes/estado/' + first.estado);
    assert.equal(res.status, 200);
    assert.ok((await res.json()).every((r) => r.estado === first.estado));
    res = await request('GET', '/reportes/categoria/' + first.categoria.id);
    assert.ok((await res.json()).every((r) => r.categoria.id === first.categoria.id));
    res = await request('GET', '/reportes/barrio/' + first.barrio);
    assert.ok((await res.json()).every((r) => r.barrio === first.barrio));
    res = await request('GET', '/reportes/prioridad/' + first.prioridad);
    assert.ok((await res.json()).every((r) => r.prioridad === first.prioridad));

    // Validacion 400
    assert.equal((await request('POST', '/reportes', {})).status, 400);
    assert.equal((await request('POST', '/reportes', { ...reporteBase, id: 'x' })).status, 400);
    assert.equal((await request('POST', '/reportes', { ...reporteBase, prioridad: 'NOPE' })).status, 400);
    assert.equal((await request('POST', '/reportes', { ...reporteBase, categoriaId: '99999' })).status, 404);
    assert.equal((await request('POST', '/reportes', { ...reporteBase, usuarioId: '99999' })).status, 404);
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
    assert.equal(created.usuario.id, Number(reporteBase.usuarioId));

    const putBody = { titulo: 'Cambio', descripcion: 'Cambio desc', categoriaId: '3', barrio: 'Norte', direccion: 'Calle 9', prioridad: 'URGENTE' };
    res = await request('PUT', '/reportes/' + created.id, putBody);
    assert.equal(res.status, 200);
    assert.equal((await res.json()).prioridad, 'URGENTE');
    assert.equal((await request('PUT', '/reportes/' + created.id, {})).status, 400);
    assert.equal((await request('PUT', '/reportes/' + created.id, { ...putBody, prioridad: 'NOPE' })).status, 400);
    assert.equal((await request('PUT', '/reportes/' + created.id, { ...putBody, categoriaId: '99999' })).status, 404);
    assert.equal((await request('PUT', '/reportes/99999', putBody)).status, 404);

    // PUT /asignar -> PENDIENTE pasa a ASIGNADO
    res = await request('PUT', '/reportes/' + created.id + '/asignar', { orgId: '1' });
    assert.equal(res.status, 200);
    const asignado = await res.json();
    assert.equal(asignado.organizacion.id, 1);
    assert.equal(asignado.estado, 'ASIGNADO');
    assert.equal((await request('PUT', '/reportes/' + created.id + '/asignar', {})).status, 400);
    assert.equal((await request('PUT', '/reportes/' + created.id + '/asignar', { orgId: '99999' })).status, 404);
    assert.equal((await request('PUT', '/reportes/99999/asignar', { orgId: '1' })).status, 404);

    // Rutas anidadas (usuario y organizacion 1 son los sembrados por categorias/users/organizaciones)
    res = await request('GET', '/users/1/reportes');
    assert.equal(res.status, 200);
    assert.ok((await res.json()).every((r) => r.usuario.id === 1));
    assert.equal((await request('GET', '/users/99999/reportes')).status, 404);
    res = await request('GET', '/organizaciones/1/reportes');
    assert.equal(res.status, 200);
    assert.ok((await res.json()).every((r) => r.organizacion.id === 1));
    assert.equal((await request('GET', '/organizaciones/99999/reportes')).status, 404);

    assert.equal((await request('DELETE', '/reportes/' + created.id)).status, 200);
    assert.equal((await request('GET', '/reportes/' + created.id)).status, 404);

    res = await request('GET', '/reportes');
    assert.equal((await res.json()).length, initialCount);
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
    // Autor inexistente: 404 y el estado del reporte no cambia
    assert.equal((await request('POST', `/reportes/${rep.id}/seguimientos`, { autorId: '99999', nota: 'x', estadoNuevo: 'CERRADO' })).status, 404);
    assert.equal((await (await request('GET', `/reportes/${rep.id}`)).json()).estado, 'EN_PROCESO');

    res = await request('GET', `/reportes/${rep.id}/seguimientos`);
    const historial = await res.json();
    assert.equal(historial.length, 2);
    assert.equal(historial[0].autor.id, 1);

    // Reportes ya persiste en Postgres: se borra el reporte de prueba para no
    // dejar un registro de mas en cada corrida.
    assert.equal((await request('DELETE', `/reportes/${rep.id}`)).status, 200);
  } finally {
    await app.close();
  }
});

test('Errores de base de datos y PATCH', async () => {
  const app = await NestFactory.create(AppModule, { logger: false });
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));
  await app.listen(0, '127.0.0.1');
  const base = await app.getUrl();
  const request = (method, path, body) => fetch(base + path, {
    method, headers: { 'Content-Type': 'application/json' },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
  try {
    // ID no numerico: 400 en vez de 500
    assert.equal((await request('GET', '/users/abc')).status, 400);
    // Valor unico repetido: 409
    const users = await (await request('GET', '/users')).json();
    assert.equal((await request('POST', '/users', { ...cases[0].body, email: users[0].email })).status, 409);
    // Borrar una organizacion con seguimientos/reportes: 409
    assert.equal((await request('DELETE', '/organizaciones/1')).status, 409);

    // PATCH parcial: solo cambia lo enviado
    let res = await request('POST', '/users', { ...cases[0].body, email: 'patch.prueba@example.com' });
    const created = await res.json();
    res = await request('PATCH', '/users/' + created.id, { telefono: '3109998877' });
    assert.equal(res.status, 200);
    const patched = await res.json();
    assert.equal(patched.telefono, '3109998877');
    assert.equal(patched.name, created.name);
    assert.equal((await request('PATCH', '/users/' + created.id, { email: 'no-es-email' })).status, 400);
    assert.equal((await request('PATCH', '/users/99999', { telefono: '1' })).status, 404);
    assert.equal((await request('DELETE', '/users/' + created.id)).status, 200);
  } finally {
    await app.close();
  }
});
