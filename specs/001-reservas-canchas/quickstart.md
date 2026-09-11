# Quickstart de Validacion

Esta guia valida los escenarios de la feature sin servicios externos. Las rutas y
entidades completas están en [http-api.md](contracts/http-api.md) y
[data-model.md](data-model.md).

## Prerrequisitos

- Node.js 22 LTS y npm instalados.
- Navegador moderno para las pruebas E2E.
- Puerto local disponible para frontend y backend.

## Preparacion

Desde la raiz del repositorio:

```bash
npm install
npm run db:migrate
npm run dev
```

La aplicacion debe iniciar el frontend y backend según los scripts del proyecto. Las
pruebas automatizadas usan una base temporal y no deben modificar la base local de
validacion.

## Validacion funcional

1. Abrir la aplicacion como visitante e intentar ver disponibilidad completa; se debe
   solicitar autenticacion.
2. Registrar dos usuarios con correos distintos e iniciar sesion con ambos en contextos
   separados.
3. Confirmar que el catalogo contiene exactamente las cinco canchas documentadas.
4. Para Cancha Laureles, seleccionar una fecha futura en `America/Bogota` y verificar 24
   bloques de una hora con estados claros.
5. Con el primer usuario, reservar el bloque futuro 14:00-15:00 y comprobar que aparece
   en Mis Reservas.
6. Con el segundo usuario, consultar la misma fecha y verificar que el bloque aparece
   como Reservado; intentar confirmarlo debe devolver un mensaje de conflicto y no crear
   una segunda reserva.
7. Intentar reservar una fecha pasada, un bloque ya iniciado y un bloque no entero; cada
   solicitud debe rechazarse sin cambiar datos.
8. Intentar crear otra reserva con el primer usuario; debe rechazarse por el límite de
   una reserva activa.
9. Cancelar la reserva futura del primer usuario después de una confirmación explícita;
   consultar de nuevo la grilla y verificar que el bloque aparece Disponible.
10. Consultar Mis Reservas y verificar que cada reserva visible pertenece al usuario
    actual y muestra cancha, fecha y hora, separando futuras de históricas.

## Validacion automatizada

```bash
npm test
npm run test:contract
npm run test:e2e
```

La suite debe cubrir como mínimo:

- Registro, login, logout y rechazo de credenciales invalidas.
- Rechazo de rutas protegidas sin sesión (`401`).
- Validacion de catálogo, fecha, hora y bloques pasados (`400`).
- Aislamiento de reservas por usuario.
- Cancelacion solo de reservas futuras propias.
- Dos confirmaciones concurrentes para el mismo bloque con una sola reserva creada y
  una respuesta `409`.
- Ausencia de stack traces en todos los errores mostrados al cliente.

## Criterios de salida

- Todos los pasos funcionales pasan en `America/Bogota`.
- La prueba concurrente confirma como máximo una reserva activa para el bloque.
- No quedan datos de prueba inesperados en `db/padel.db` después de la validación local.
