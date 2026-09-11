# Data Model: Reservas de Canchas de Padel

## Usuario

Representa una cuenta autenticable.

| Campo | Tipo lógico | Reglas |
|---|---|---|
| `id` | Identificador | Único, generado por el sistema |
| `email` | Texto | Requerido, normalizado a minúsculas, único |
| `passwordHash` | Texto | Requerido; nunca se expone ni almacena la contraseña original |
| `createdAt` | Fecha-hora | Requerido |

Relaciones: un usuario puede tener cero o una reserva activa y múltiples reservas
históricas o canceladas.

## Sesion

Representa el acceso activo de un usuario.

| Campo | Tipo lógico | Reglas |
|---|---|---|
| `id` | Token opaco | Único, almacenado solo en servidor |
| `userId` | Identificador | Debe referenciar un Usuario |
| `expiresAt` | Fecha-hora | Requerido; la sesión expirada no autentica |
| `createdAt` | Fecha-hora | Requerido |

Una sesión se invalida al cerrar sesión. Las respuestas nunca devuelven el token como
campo de datos.

## Cancha

Catálogo cerrado, representado por constantes y no por una entidad editable.

| Identificador | Nombre |
|---|---|
| `laureles` | Cancha Laureles |
| `el-poblado` | Cancha El Poblado |
| `belen` | Cancha Belen |
| `robledo` | Cancha Robledo |
| `envigado` | Cancha Envigado |

No existe operación de alta, edición o eliminación de canchas.

## Reserva

Representa un bloque de una hora solicitado por un usuario.

| Campo | Tipo lógico | Reglas |
|---|---|---|
| `id` | Identificador | Único, generado por el sistema |
| `userId` | Identificador | Debe referenciar al Usuario propietario |
| `courtId` | Identificador cerrado | Debe pertenecer al catálogo de cinco canchas |
| `date` | Fecha local | Interpretada en `America/Bogota` |
| `startHour` | Hora | Entera de 00:00 a 23:00 |
| `endHour` | Hora | Exactamente `startHour + 1` |
| `status` | Estado | `active`, `cancelled` o `past` |
| `createdAt` | Fecha-hora | Requerido |
| `cancelledAt` | Fecha-hora nullable | Requerido cuando el estado es `cancelled` |

Una reserva activa se vuelve histórica cuando su bloque termina. Una reserva cancelada
no ocupa disponibilidad. La identidad de disponibilidad es `(courtId, date,
startHour)` entre reservas activas.

## Bloque horario

Vista derivada de una cancha y una fecha. Para cada hora de 00:00 a 23:00, el sistema
calcula:

- `status = Reservado` si existe una reserva activa para la cancha, fecha y hora.
- `status = Disponible` si no existe reserva activa y el bloque no ha pasado.
- `status = No disponible` si el bloque ya comenzó según `America/Bogota`.

Los bloques no se escriben por separado en la base.

## Transiciones

```text
Reserva activa --cancelacion confirmada--> Reserva cancelada
Reserva activa --fin del bloque en America/Bogota--> Reserva pasada
Reserva cancelada --(sin transiciones)--> Reserva cancelada
Reserva pasada --(sin transiciones)--> Reserva pasada
```

## Invariantes transaccionales

1. Una reserva solo se inserta para una cancha del catálogo, un bloque entero futuro y
   un usuario autenticado.
2. No pueden existir dos reservas activas para la misma cancha, fecha y hora.
3. Un usuario no puede tener más de una reserva activa.
4. La cancelación solo puede afectar una reserva futura perteneciente al usuario de la
   sesión actual.
5. Un conflicto de inserción deja intactas las reservas existentes.
