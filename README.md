# AyudaLocal

Integrantes: Nicolas Casanova y Alexander Guerrero.

API para apoyar la atención de necesidades de la comunidad. Esta entrega implementa exclusivamente ciudadanos, organizaciones sociales y categorías.

## Ejecutar

```powershell
cd "D:\Escritorio\Api Servicio Local"
npm install
npm run build
npm run start:dev
```

Base URL: http://localhost:3000. Para ejecutar lo compilado: `npm run start:prod`.
Los datos están en arreglos privados de cada Service y vuelven a sus valores iniciales al reiniciar.
Hay 12 ciudadanos (IDs 1-12), 8 organizaciones (IDs 1-8) y 8 categorías iniciales (IDs 1-8). Los registros son datos de demostración ficticios. Los IDs son cadenas numéricas; todos los recursos tienen un ejemplo con ID `1`.

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
    users.model.ts
  organizaciones/
    organizaciones.module.ts
    organizaciones.controller.ts
    organizaciones.service.ts
    organizaciones.dto.ts
    organizaciones.model.ts
  categorias/
    categorias.module.ts
    categorias.controller.ts
    categorias.service.ts
    categorias.dto.ts
    categorias.model.ts
postman/AyudaLocal.postman_collection.json
test/api.test.cjs
```

## Module → Controller → Service

AppModule importa únicamente UsersModule, OrganizacionesModule y CategoriasModule.
Cada módulo registra su Controller en `controllers` y su Service en `providers`.
Nest inyecta el Service por el constructor del Controller.
El Controller usa `@Controller`, `@Get`, `@Post`, `@Put`, `@Delete`, `@Body` y `@Param`, y delega la operación.
Cada Service usa `@Injectable()` y tiene `findAll()`, `findById(id)`, `create(data)`, `update(id, data)` y `delete(id)`.
La lógica y los arreglos privados están en los Services; los modelos describen los datos y los DTO validan las entradas.

## Endpoints

| Recurso | Listar | Consultar | Crear | Actualizar | Eliminar |
| --- | --- | --- | --- | --- | --- |
| Users | GET /users | GET /users/:id | POST /users | PUT /users/:id | DELETE /users/:id |
| Organizaciones | GET /organizaciones | GET /organizaciones/:id | POST /organizaciones | PUT /organizaciones/:id | DELETE /organizaciones/:id |
| Categorias | GET /categorias | GET /categorias/:id | POST /categorias | PUT /categorias/:id | DELETE /categorias/:id |

GET y PUT devuelven objetos o arreglos JSON; POST devuelve 201 y el objeto creado.
DELETE devuelve 200 y un mensaje. Un ID inexistente devuelve 404 mediante NotFoundException.
Bodies incorrectos devuelven 400 mediante ValidationPipe. PUT requiere todos los campos editables.
El ID lo asigna el Service: no debe enviarse en el body. No se aceptan propiedades desconocidas.

## Postman

1. Iniciar la API.
2. En Postman elegir Import y seleccionar `postman/AyudaLocal.postman_collection.json`.
3. La variable `baseUrl` ya contiene `http://localhost:3000`.
4. Ejecutar cada carpeta en orden: listar, consultar, crear, actualizar, eliminar.
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
  "nombre": "Salud",
  "descripcion": "Casos relacionados con apoyo en salud"
}
```

Ejemplos de lectura: `GET http://localhost:3000/users`, `GET http://localhost:3000/users/1`, `GET http://localhost:3000/organizaciones` y `GET http://localhost:3000/categorias`.

## Verificación

`npm run build` compila NestJS.
`npm test` compila y prueba por HTTP el CRUD de los tres módulos, datos iniciales, errores 404, validación 400 e inexistencia de rutas fuera del alcance. Utiliza un puerto temporal y no modifica la API del puerto 3000.

## Referencia estudiada

https://github.com/IvonneBarco/book-nestjs-5a

Se estudiaron los decoradores, la inyección por constructor, la delegación del Controller al Service, el CRUD en memoria, los DTO y las excepciones.
La referencia registra UsersController y UsersService directamente en AppModule; AyudaLocal los registra en sus módulos independientes según el alcance solicitado.
El código de esta entrega usa únicamente los modelos y datos de AyudaLocal.
