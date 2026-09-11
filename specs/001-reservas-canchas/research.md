# Research: Reservas de Canchas de Padel

## Decision 1: Sesiones HTTP persistidas en SQLite

- **Decision**: Usar sesiones opacas almacenadas en SQLite y una cookie `HttpOnly`,
  `SameSite=Lax` y `Secure` en despliegues HTTPS.
- **Rationale**: El producto es una aplicacion web local sin integraciones externas. La
  sesion evita exponer credenciales en el cliente y permite revocar el acceso al cerrar
  sesion. Persistirla junto al resto de datos mantiene la instalacion simple.
- **Alternatives considered**: JWT en el navegador (mayor complejidad de revocacion y
  riesgo de almacenamiento inseguro), OAuth externo (fuera de alcance y requiere un
  servicio externo).

## Decision 2: Hash de contraseñas con una funcion adaptativa

- **Decision**: Almacenar solo hashes de contraseñas usando Argon2id o bcrypt con un
  coste documentado; nunca guardar contraseñas en texto plano.
- **Rationale**: El requisito solo fija correo y contraseña, pero la autenticacion debe
  proteger credenciales aun en una copia de la base. La implementacion puede elegir la
  libreria mantenida compatible con Node.js 22, conservando la misma interfaz de hash y
  verificacion.
- **Alternatives considered**: SHA-256 directo (no adecuado para contraseñas), servicio
  de identidad externo (fuera de alcance).

## Decision 3: Reserva atomica con transaccion SQLite e indice unico

- **Decision**: Normalizar cada bloque como `startAt` y `endAt` en hora local de
  `America/Bogota`, validar formato y pasado, iniciar una transaccion inmediata,
  comprobar colision y reserva activa del usuario, insertar y confirmar. Un indice unico
  sobre cancha, fecha y hora de inicio para reservas activas sera una segunda barrera.
- **Rationale**: La transaccion serializa las confirmaciones concurrentes y garantiza que
  solo una solicitud gane el bloque. La comprobacion debe ocurrir dentro del mismo
  alcance transaccional que la escritura, no solo al cargar la grilla.
- **Alternatives considered**: Comprobacion previa desde la UI (vulnerable a carreras),
  bloqueo en memoria del proceso (no protege escrituras directas ni otro proceso),
  base de datos remota (contradice SQLite local).

## Decision 4: Estado derivado de reserva, no de disponibilidad almacenada

- **Decision**: Mantener las cinco canchas como catalogo de codigo fijo y derivar el
  estado `Disponible` o `Reservado` consultando reservas activas para la fecha y cancha.
- **Rationale**: Evita duplicar 24 bloques por cancha en la base y elimina estados
  desactualizados cuando una reserva se cancela. Los bloques pasados se marcan como no
  reservables según `America/Bogota`.
- **Alternatives considered**: Persistir una fila por cada bloque futuro (más datos y
  sincronizacion innecesaria), panel para administrar canchas (non-goal).

## Decision 5: Contratos HTTP JSON y errores semanticos

- **Decision**: Exponer endpoints JSON versionados bajo `/api`, con `400` para entrada
  invalida, `401` sin sesion, `404` para recursos propios inexistentes y `409` para
  colision o limite de reserva activa. La UI traduce `code` a mensajes amigables.
- **Rationale**: Hace comprobables los requisitos y separa mensajes de usuario de
  detalles internos. Los contratos quedan documentados en `contracts/http-api.md`.
- **Alternatives considered**: GraphQL (innecesario para este alcance), respuestas de
  error sin estructura (dificultan pruebas y traduccion consistente).

## Decision 6: Estrategia de pruebas por capas

- **Decision**: Probar reglas puras con Vitest, endpoints con Supertest y flujos
  autenticados con Playwright. La prueba critica ejecutara dos confirmaciones
  concurrentes para el mismo bloque y verificara una sola reserva.
- **Rationale**: Cada capa valida una responsabilidad distinta y mantiene la ruta
  critica reproducible sin depender de servicios externos.
- **Alternatives considered**: Solo pruebas manuales (no verifican carreras de forma
  confiable), solo E2E (feedback lento y diagnostico pobre).
