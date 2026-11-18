# Guion de presentación — AyudaLocal

Integrantes: Nicolas Casanova y Alexander Guerrero.
Duración estimada: 7 a 8 minutos.

## Antes de empezar (checklist)

- [ ] `docker compose up -d` y `docker compose ps` muestran `ayudalocal-postgres` arriba.
- [ ] Existe `.env` (copiado de `.env.example`).
- [ ] `npm run start:dev` corriendo en una terminal.
- [ ] Postman abierto con la colección `postman/AyudaLocal.postman_collection.json` importada.
- [ ] Editor abierto en `src/` y una terminal libre para `npm test` y `psql`.

---

## 1. Introducción (Nicolas, ~1 min)

> "Buenos días. Somos Nicolas Casanova y Alexander Guerrero y vamos a presentar **AyudaLocal**, una API hecha en NestJS para atender necesidades de la comunidad.
> 
> La idea es simple: un **ciudadano** reporta una necesidad, por ejemplo una persona mayor que necesita acompañamiento o un hueco en la vía. Una **organización social** toma ese reporte, lo atiende y va dejando un **seguimiento** de cada cambio de estado.
> Así cualquiera puede ver en qué va cada caso."

Mostrar en pantalla: el `README.md`, sección de endpoints.

## 2. Arquitectura (Nicolas, ~1.5 min)

Mostrar `src/app.module.ts` y la carpeta `src/`.

> "El proyecto está dividido en **cinco módulos**: users, organizaciones, categorías,
> reportes y seguimientos. Cada uno sigue el mismo patrón que vimos en clase:
> **Module → Controller → Service**.
> 
> - El **Controller** recibe la petición HTTP con decoradores como `@Get`, `@Post`,
>   `@Put`, `@Patch` y `@Delete`, y no tiene lógica: solo delega. `PUT` reemplaza todos
>   los campos editables; `PATCH` cambia solo los que se envían.
> - El **Service** tiene la lógica y Nest lo inyecta por el constructor.
> - Los **DTO** validan el body con `class-validator`, y el `ValidationPipe` global rechaza campos que falten o que sobren.
> - Un **filtro de excepciones global** (`DbExceptionFilter`) traduce los errores de
>   Postgres a respuestas claras: un valor único repetido o borrar algo con datos
>   relacionados da **409**, y un ID que no es número da **400**, en vez de un 500.
> 
> Los módulos se comunican exportando su Service. Por ejemplo, Users y Organizaciones importan ReportesModule para responder `GET /users/:id/reportes`."

Mostrar `src/reportes/reportes.controller.ts` como ejemplo.

## 3. Modelo de datos y base de datos (Alexander, ~1.5 min)

Mostrar `docker-compose.yml` y `src/reportes/entities/reporte.entity.ts`.

> "Para la persistencia levantamos **PostgreSQL en un contenedor Docker** con
> `docker compose`, y conectamos Nest con **TypeORM**, leyendo las credenciales del `.env` con `ConfigModule`.
> 
> Cada recurso tiene su **entidad**, y con `synchronize` TypeORM crea las tablas solo:
> `usuario`, `organizacion`, `categoria`, `reporte` y `seguimiento`.
> 
> El centro del modelo es **reporte**: tiene una categoría, un usuario que lo creó y,
> cuando se asigna, una organización. La prioridad y el estado son **enums**, así la base de datos no acepta valores inválidos. Cada **seguimiento** pertenece a un reporte y su autor es la organización que lo atiende.
> 
> Los cinco Services usan el **`Repository`** de TypeORM (`find`, `findOne`, `save`,
> `remove`) inyectado con `@InjectRepository`, así que los datos **sobreviven a un
> reinicio**. La primera vez que una tabla está vacía, su Service siembra datos de
> demostración."

Mostrar las tablas en vivo:

```bash
docker exec ayudalocal-postgres psql -U ayudalocal_user -d ayudalocal_db -c '\dt' -c '\d reporte'
```

> "Aquí se ven las cinco tablas y las llaves foráneas de reporte."

## 4. Demo en Postman (Alexander, ~2.5 min)

Ciclo de vida de un reporte: `PENDIENTE → ASIGNADO → EN_PROCESO → RESUELTO → CERRADO`.
La API lo hace cumplir: un salto no permitido devuelve **409** y no deja seguimiento.

| #   | Petición                                           | Qué decir                                                             |
| --- | -------------------------------------------------- | --------------------------------------------------------------------- |
| 1   | `GET /reportes`                                    | "Estos son los reportes iniciales."                                   |
| 2   | `GET /reportes/estado/PENDIENTE`                   | "Podemos filtrar por estado, categoría, barrio o prioridad."          |
| 3   | `POST /reportes` (body abajo)                      | "Un ciudadano crea un reporte. Devuelve 201 y entra como PENDIENTE."  |
| 4   | `PUT /reportes/:id/asignar` con `{ "orgId": "1" }` | "La organización 1 toma el caso y pasa a ASIGNADO."                   |
| 5   | `POST /reportes/:id/seguimientos` (body abajo)     | "La organización deja un seguimiento y el reporte pasa a EN_PROCESO." |
| 6   | `GET /reportes/:id/seguimientos`                   | "Queda el historial: estado anterior, estado nuevo y la nota."        |
| 6b  | Mismo POST con `"estadoNuevo": "PENDIENTE"`        | "No se puede devolver un caso: 409 y dice qué transiciones valen."    |
| 7   | `GET /users/1/reportes`                            | "Rutas anidadas: los reportes de un ciudadano."                       |

Body del paso 3:

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

Body del paso 5:

```json
{
  "autorId": "1",
  "nota": "Cuadrilla en camino",
  "estadoNuevo": "EN_PROCESO"
}
```

**Errores (mostrar tres):**

- `POST /reportes` con `"prioridad": "MUY_ALTA"` → **400**: "El Service valida que la prioridad sea una de las cuatro permitidas y lanza BadRequestException."
- `GET /reportes/999` → **404**: "Un ID que no existe devuelve NotFoundException."
- `DELETE /organizaciones/1` → **409**: "La organización tiene seguimientos; Postgres protege la llave foránea y el filtro global lo convierte en un 409 en vez de un 500."

## 5. Pruebas (Nicolas, ~30 s)

```bash
npm test
```

> "Tenemos pruebas que levantan la API en un puerto temporal contra el Postgres de Docker y prueban por HTTP el CRUD de los cinco módulos, PATCH, los filtros, la asignación, los seguimientos con su ciclo de vida y los errores 400, 404 y 409. Pasan las cuatro."

## 6. Cierre (Nicolas, ~30 s)

> "En resumen: AyudaLocal tiene cinco módulos con el patrón Module–Controller–Service, validación con DTO, manejo de errores, y los cinco recursos guardan sus datos en PostgreSQL con TypeORM.
> 
> Gracias, ¿tienen preguntas?"

---

## Posibles preguntas

- **¿Los datos se pierden al reiniciar?** No: viven en Postgres. Los datos de ejemplo se
  siembran una sola vez, cuando la tabla está vacía.
- **¿Por qué Reportes y Seguimientos siembran en `onApplicationBootstrap`?** Nest corre los
  `onModuleInit` en paralelo, y un reporte necesita que su categoría y su usuario ya existan.
  `onApplicationBootstrap` corre cuando todos los `onModuleInit` terminaron.
- **¿Se puede reabrir un caso cerrado?** No. `CERRADO` y `RECHAZADO` son finales (409).
  Un caso `RESUELTO` sí puede volver a `EN_PROCESO` si la solución falló. Las reglas están
  en `TRANSICIONES`, en `reportes.constants.ts`.
- **¿Por qué los IDs se pueden mandar como `"3"` o como `3`?** Las respuestas devuelven
  números; los DTO convierten el número a texto antes de validar, así el cliente puede
  reenviar el ID tal cual.
- **¿Qué hace `synchronize: true`?** Crea y ajusta las tablas a partir de las entidades.
  Sirve en desarrollo; en producción se usan migraciones.
- **¿Por qué el autor del seguimiento es una organización?** Porque quien atiende y
  actualiza el caso es la organización asignada, no el ciudadano.
- **¿Qué pasa si se borra un reporte?** Sus seguimientos se borran en cascada. Si se borra
  una organización que solo tiene reportes asignados, quedan sin asignar (`SET NULL`); si ya
  escribió seguimientos, la API devuelve 409 para no perder el historial. Lo mismo pasa
  al borrar un usuario o una categoría con reportes.
