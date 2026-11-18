# AyudaLocal

Integrantes: Nicolas Casanova y Alexander Guerrero.

API para apoyar la atención de necesidades de la comunidad. Ciudadanos reportan necesidades; organizaciones sociales las atienden y registran el seguimiento.

## Base de datos

Los cinco recursos (`Users`, `Organizaciones`, `Categorias`, `Reportes` y `Seguimientos`) persisten en PostgreSQL con TypeORM (entidades en `entities/`).

```powershell
cp .env.example .env   # completar con los valores de docker-compose.yml
docker compose up -d   # Postgres 17 en el puerto 5432 + pgAdmin en 5050
```

`TypeOrmModule` usa `autoLoadEntities` y `synchronize: true`, así que las tablas se crean solas al arrancar la API. Cada Service siembra sus datos de demostración una sola vez, la primera vez que su tabla está vacía (no se repiten en cada reinicio). Reportes y Seguimientos siembran en `onApplicationBootstrap` porque Nest ejecuta los `onModuleInit` en paralelo y dependen de filas ya creadas por otros módulos.

## Ejecutar

```powershell
npm install
npm run build
npm run start:dev
```

Base URL: http://localhost:3000. Para ejecutar lo compilado: `npm run start:prod`.
`Users`, `Organizaciones`, `Categorias` y `Reportes` quedan guardados en Postgres: sus IDs son numéricos y los datos sobreviven a reinicios de la API (se siembran una sola vez). Un Reporte devuelve su `categoria`, `usuario` y `organizacion` como objetos completos (relaciones TypeORM), no solo el ID.
`Seguimientos` también queda en Postgres; cada uno devuelve su `autor` (la organización) como objeto completo.
Hay 12 ciudadanos, 8 organizaciones, 8 categorías y 4 reportes iniciales (IDs autogenerados por Postgres, empiezan en 1), además de 2 seguimientos de ejemplo. Los registros son datos de demostración ficticios.

## Estructura

```
src/
  main.ts
  app.module.ts
  users/
    users.module.ts
    users.controller.ts
    users.service.ts
    users.dto.ts
    entities/user.entity.ts
  organizaciones/
    organizaciones.module.ts
    organizaciones.controller.ts
    organizaciones.service.ts
    organizaciones.dto.ts
    entities/organizacion.entity.ts
  categorias/
    categorias.module.ts
    categorias.controller.ts
    categorias.service.ts
    categorias.dto.ts
    entities/categoria.entity.ts
  reportes/
    reportes.module.ts
    reportes.controller.ts
    reportes.service.ts
    reportes.dto.ts
    entities/reporte.entity.ts
  seguimientos/
    seguimientos.module.ts
    seguimientos.controller.ts
    seguimientos.service.ts
    seguimientos.dto.ts
    entities/seguimiento.entity.ts
  common/
    db-exception.filter.ts
postman/AyudaLocal.postman_collection.json
test/api.test.cjs
```

## Module → Controller → Service

AppModule importa UsersModule, OrganizacionesModule, CategoriasModule, ReportesModule y SeguimientosModule.
Cada módulo registra su Controller en `controllers` y su Service en `providers`.
UsersModule, OrganizacionesModule, CategoriasModule y ReportesModule exportan su Service para que otros módulos lo inyecten por constructor.
Nest inyecta el Service por el constructor del Controller.
El Controller usa `@Controller`, `@Get`, `@Post`, `@Put`, `@Delete`, `@Body` y `@Param`, y delega la operación.
Cada Service usa `@Injectable()` y tiene `findAll()`, `findById(id)`, `create(data)`, `update(id, data)` y `delete(id)`.
ReportesService suma `findByEstado`, `findByCategoria`, `findByBarrio`, `findByPrioridad`, `findByUsuario`, `findByOrganizacion`, `asignar(id, orgId)` y `cambiarEstado(id, estado)`.
SeguimientosService tiene `findByReporte(reporteId)` y `create(reporteId, dto)`; cada seguimiento guarda el estado anterior y cambia el reporte al estado nuevo.
La lógica está en los Services. En los cinco recursos la entidad TypeORM describe los datos, y el Service usa su `Repository` (`find`, `findOneBy`/`findOne`, `save`, `remove`) en vez de un arreglo. Los DTO validan las entradas en ambos casos.
ReportesService además valida que `categoriaId`, `usuarioId` y `orgId` existan (`NotFoundException` si no) antes de guardar la relación, inyectando los repositorios de `CategoriaEntity`, `UserEntity` y `OrganizacionEntity` directamente (no los módulos completos, para no crear un ciclo con `UsersModule`/`OrganizacionesModule`, que ya importan `ReportesModule`).

## Endpoints

| Recurso | Listar | Consultar | Crear | Actualizar | Eliminar |
| --- | --- | --- | --- | --- | --- |
| Users | GET /users | GET /users/:id | POST /users | PUT / PATCH /users/:id | DELETE /users/:id |
| Organizaciones | GET /organizaciones | GET /organizaciones/:id | POST /organizaciones | PUT / PATCH /organizaciones/:id | DELETE /organizaciones/:id |
| Categorias | GET /categorias | GET /categorias/:id | POST /categorias | PUT / PATCH /categorias/:id | DELETE /categorias/:id |
| Reportes | GET /reportes | GET /reportes/:id | POST /reportes | PUT /reportes/:id | DELETE /reportes/:id |
| Seguimientos | GET /reportes/:id/seguimientos | — | POST /reportes/:id/seguimientos | — | — |

Extras: `GET /reportes/estado/:estado`, `GET /reportes/categoria/:categoriaId`, `GET /reportes/barrio/:barrio`, `GET /reportes/prioridad/:prioridad`, `PUT /reportes/:id/asignar`, `GET /users/:id/reportes`, `GET /organizaciones/:id/reportes`.

Estados: `PENDIENTE · ASIGNADO · EN_PROCESO · RESUELTO · CERRADO · RECHAZADO`. Prioridades: `BAJA · MEDIA · ALTA · URGENTE`.
Ciclo de vida: `PENDIENTE --PUT /asignar--> ASIGNADO --POST /seguimientos--> EN_PROCESO --> RESUELTO --> CERRADO`, con `RECHAZADO` para duplicado/no aplica. Cada seguimiento deja historial del cambio de estado.

GET y PUT devuelven objetos o arreglos JSON; POST devuelve 201 y el objeto creado.
DELETE devuelve 200 y un mensaje. Un ID inexistente devuelve 404 mediante NotFoundException.
Bodies incorrectos devuelven 400 mediante ValidationPipe. PUT requiere todos los campos editables; PATCH (users, organizaciones, categorias) acepta cualquier subconjunto de ellos.
`DbExceptionFilter` traduce errores de Postgres: valor único repetido (email, nit, nombre de categoría) → 409; borrar un registro con datos relacionados (p. ej. una organización con seguimientos) → 409; ID no numérico (`/users/abc`) → 400.
El ID lo asigna el Service: no debe enviarse en el body. No se aceptan propiedades desconocidas.

## Postman

1. Iniciar la API.
2. En Postman elegir Import y seleccionar `postman/AyudaLocal.postman_collection.json`.
3. La variable `baseUrl` ya contiene `http://localhost:3000`.
4. Ejecutar cada carpeta en orden: listar, filtrar, consultar, crear, actualizar, asignar, eliminar.
5. La petición POST guarda automáticamente el ID creado para las siguientes peticiones PUT y DELETE.
6. Para probar manualmente usar Body → raw → JSON y Content-Type: application/json.

### POST /users

```json
{
  "name": "Alexander Guerrero",
  "email": "alexander@email.com",
  "telefono": "3001234567",
  "barrio": "Centro"
}
```

### POST /organizaciones

```json
{
  "nombre": "Fundacion Ayuda Social",
  "nit": "900123456",
  "email": "contacto@fundacion.com",
  "telefono": "3009876543",
  "zona": "Centro"
}
```

### POST /categorias

```json
{
  "nombre": "Movilidad",
  "descripcion": "Casos relacionados con transporte y movilidad"
}
```

`nombre` es único: no puede repetir una categoría ya sembrada (Alimentos, Persona vulnerable, Infraestructura, Ayuda general, Salud, Educacion, Vivienda, Ropa y abrigo).

### POST /reportes

```json
{
  "titulo": "Falta de agua en el barrio",
  "descripcion": "Tuberia rota frente al parque",
  "categoriaId": "3",
  "usuarioId": "1",
  "barrio": "Centro",
  "direccion": "Calle 10 #5-20",
  "prioridad": "ALTA"
}
```

Sin `prioridad` válida (`BAJA · MEDIA · ALTA · URGENTE`) la API devuelve 400. El `estado` inicial siempre es `PENDIENTE`.
`categoriaId` y `usuarioId` deben existir: si no, la API devuelve 404 antes de guardar el reporte. La respuesta trae `categoria`, `usuario` y (si ya se asignó) `organizacion` como objetos completos, no solo su ID.

### PUT /reportes/:id/asignar

```json
{
  "orgId": "1"
}
```

### POST /reportes/:id/seguimientos

```json
{
  "autorId": "1",
  "nota": "Cuadrilla en camino",
  "estadoNuevo": "EN_PROCESO"
}
```

Ejemplos de lectura: `GET http://localhost:3000/users`, `GET http://localhost:3000/users/1`, `GET http://localhost:3000/organizaciones`, `GET http://localhost:3000/categorias`, `GET http://localhost:3000/reportes`, `GET http://localhost:3000/reportes/estado/PENDIENTE`, `GET http://localhost:3000/users/1/reportes` y `GET http://localhost:3000/reportes/2/seguimientos`.

## Verificación

`npm run build` compila NestJS.
`npm test` compila y prueba por HTTP el CRUD de los cinco módulos, filtros de reportes, asignar, seguimientos con cambio de estado, rutas anidadas, datos iniciales, errores 404 y validación 400. Utiliza un puerto temporal y no modifica la API del puerto 3000.
Como Users, Organizaciones, Categorias y Reportes ahora usan Postgres, `npm test` necesita `docker compose up -d` y el archivo `.env` configurados antes de correr.

## Referencia estudiada

https://github.com/IvonneBarco/book-nestjs-5a

Se estudiaron los decoradores, la inyección por constructor, la delegación del Controller al Service, el CRUD en memoria, los DTO y las excepciones.
La referencia registra UsersController y UsersService directamente en AppModule; AyudaLocal los registra en sus módulos independientes según el alcance solicitado.
El código de esta entrega usa únicamente los modelos y datos de AyudaLocal.
