# Guion — AyudaLocal

Integrantes: Nicolas Casanova y Alexander Guerrero.

## ¿Cuál es el proyecto?

> "**AyudaLocal** es una API REST hecha en **NestJS** que conecta a los ciudadanos de un barrio con las organizaciones sociales que pueden ayudarlos. Los ciudadanos reportan necesidades de su comunidad y las organizaciones las atienden y registran el avance de cada caso."

## ¿Qué problema resuelve?

> "Hoy, cuando alguien en el barrio tiene una necesidad, como una persona mayor sola, un comedor comunitario sin alimentos o un daño en la vía, el aviso llega por voz a voz, por WhatsApp o no llega. Eso trae tres problemas:
> 
> 1. **No hay un lugar único** donde quede registrada la necesidad.
> 2. **No se sabe quién la está atendiendo**, entonces hay casos que nadie toma y otros que atienden dos organizaciones a la vez.
> 3. **No hay seguimiento**: el ciudadano no sabe si su caso avanzó o quedó olvidado.
> 
> AyudaLocal centraliza los reportes, deja claro qué organización tiene cada caso y guarda el historial de lo que se ha hecho."

## Principales funcionalidades de esta versión

> "En esta versión la API tiene:"

1. **Cinco módulos** con el patrón Module → Controller → Service: usuarios (ciudadanos),
   organizaciones, categorías y reportes con CRUD completo (`PATCH` para cambios parciales),
   y seguimientos como historial de cada reporte.
2. **Reporte de necesidades**: un ciudadano crea un reporte con título, descripción,
   categoría, barrio, dirección y prioridad (`BAJA`, `MEDIA`, `ALTA`, `URGENTE`). Todo
   reporte nace en estado `PENDIENTE`.
3. **Asignación a una organización**: `PUT /reportes/:id/asignar` le entrega el caso a
   una organización y lo pasa a `ASIGNADO`.
4. **Seguimiento con historial**: cada seguimiento guarda una nota, el estado anterior y el estado nuevo, y actualiza el reporte. Así se ve el ciclo
   `PENDIENTE → ASIGNADO → EN_PROCESO → RESUELTO → CERRADO` (o `RECHAZADO`), y la API no
   deja saltarse pasos ni reabrir un caso cerrado.
5. **Consultas y filtros**: reportes por estado, categoría, barrio y prioridad; los
   reportes de un ciudadano (`/users/:id/reportes`) y los de una organización
   (`/organizaciones/:id/reportes`).
6. **Validación y errores**: los DTO validan cada body; datos inválidos o campos de más
   devuelven **400**, un ID que no existe devuelve **404**, y un dato repetido o un borrado
   que rompería relaciones devuelve **409**.
7. **Base de datos PostgreSQL en Docker**: con TypeORM definimos las entidades, se crean
   las cinco tablas con sus relaciones y todos los Services leen y escriben ahí.
8. **Pruebas y colección de Postman**: `npm test` prueba por HTTP todos los módulos, y la colección de Postman permite probar cada endpoint en orden.
