# Feature Specification: Reservas de Canchas de Padel

**Feature Branch**: `001-reservas-canchas`

**Created**: 2026-09-11

**Status**: Draft

**Input**: User description: "Sistema de reservas de padel con autenticacion, exploracion de disponibilidad, creacion y gestion de reservas"

## Clarifications

### Session 2026-09-11

- Q: ¿Qué zona horaria debe usar el sistema para determinar si una fecha u horario ya pasó? → A: `America/Bogota`, la zona horaria del club.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Crear cuenta e iniciar sesion (Priority: P1)

Como visitante, quiero registrarme e iniciar sesion con mi correo electronico y
contraseña para acceder a la disponibilidad completa y reservar una cancha.

**Why this priority**: La identidad del usuario es necesaria para proteger las reservas
personales y habilitar el flujo principal del sistema.

**Independent Test**: Se puede probar creando una cuenta, cerrando sesion e iniciandola
nuevamente; el usuario autenticado debe acceder a las funciones protegidas.

**Acceptance Scenarios**:

1. **Given** un visitante con un correo valido no registrado, **When** completa el
   registro con correo y contraseña, **Then** se crea su cuenta y puede iniciar sesion.
2. **Given** un usuario registrado, **When** proporciona credenciales validas, **Then**
   inicia una sesion activa.
3. **Given** credenciales invalidas, **When** el visitante intenta iniciar sesion,
   **Then** recibe un mensaje amigable y no obtiene acceso.
4. **Given** un visitante sin sesion activa, **When** intenta consultar disponibilidad
   completa o reservar, **Then** el sistema solicita iniciar sesion.

---

### User Story 2 - Consultar disponibilidad de una cancha (Priority: P1)

Como usuario autenticado, quiero elegir una cancha y una fecha para consultar sus
horarios de 24 horas y distinguir los bloques disponibles de los reservados.

**Why this priority**: La disponibilidad es la base para elegir un horario valido y
realizar una reserva sin ambiguedad.

**Independent Test**: Con una sesion activa, se selecciona cada cancha y una fecha; la
pantalla debe mostrar exactamente los cinco nombres y los bloques horarios de una hora
con su estado correspondiente.

**Acceptance Scenarios**:

1. **Given** un usuario autenticado en la pantalla de canchas, **When** consulta el
   catalogo, **Then** ve Cancha Laureles, Cancha El Poblado, Cancha Belen, Cancha
   Robledo y Cancha Envigado, sin canchas adicionales.
2. **Given** una cancha seleccionada, **When** el usuario elige una fecha, **Then** ve
   los bloques consecutivos de una hora en formato de 24 horas para esa fecha.
3. **Given** que existen reservas para la cancha y fecha seleccionadas, **When** se
   muestra la grilla, **Then** cada bloque indica claramente si esta Disponible o
   Reservado.
4. **Given** un visitante sin sesion activa, **When** intenta ver la disponibilidad
   completa, **Then** el sistema limita el acceso y solicita autenticacion.

---

### User Story 3 - Crear una reserva (Priority: P1)

Como usuario autenticado, quiero seleccionar un bloque disponible y confirmar una
reserva de una hora para asegurar mi turno.

**Why this priority**: La creacion de reservas entrega el valor central del sistema y
debe proteger la disponibilidad compartida.

**Independent Test**: Un usuario autenticado selecciona un bloque futuro disponible y lo
confirma; la reserva aparece como propia y el bloque deja de estar disponible.

**Acceptance Scenarios**:

1. **Given** un bloque futuro marcado como Disponible, **When** el usuario lo confirma,
   **Then** se crea una reserva de exactamente una hora para la cancha, fecha y bloque
   elegidos.
2. **Given** que otro usuario reserva el bloque antes de la confirmacion final, **When**
   el primer usuario confirma, **Then** la reserva se rechaza, el sistema informa que
   el horario ya no esta disponible y no crea una reserva duplicada.
3. **Given** que el usuario ya tiene una reserva activa, **When** intenta confirmar otra
   reserva, **Then** el sistema rechaza la operacion e informa que solo puede tener una
   reserva activa a la vez.
4. **Given** un bloque ubicado en el pasado o una fecha pasada, **When** el usuario
   intenta reservarlo, **Then** el sistema rechaza la operacion y conserva la
   disponibilidad sin cambios.

---

### User Story 4 - Consultar y cancelar mis reservas (Priority: P2)

Como usuario autenticado, quiero consultar mis reservas futuras y mi historial, y
cancelar una reserva futura cuando ya no pueda asistir.

**Why this priority**: La gestion posterior permite al usuario controlar sus propios
turnos y libera horarios que ya no necesita.

**Independent Test**: Un usuario con reservas ve sus reservas futuras e historicas,
identifica cancha, fecha y hora, y cancela una reserva futura confirmando la accion.

**Acceptance Scenarios**:

1. **Given** un usuario autenticado con reservas, **When** abre Mis Reservas, **Then**
   ve por separado sus reservas futuras y su historial pasado.
2. **Given** una reserva propia listada, **When** el usuario la consulta, **Then** ve el
   nombre de la cancha, la fecha y la hora.
3. **Given** una reserva futura propia, **When** el usuario solicita cancelarla y
   confirma, **Then** la reserva se cancela y el bloque vuelve a estar disponible.
4. **Given** una reserva de otro usuario o una reserva pasada, **When** el usuario intenta
   gestionarla, **Then** el sistema no permite modificarla.

### Edge Cases

- Un correo ya registrado no puede crear una segunda cuenta con el mismo correo.
- Un correo o contraseña vacios, mal formados o invalidos deben rechazarse con un
  mensaje comprensible.
- Si la fecha seleccionada no tiene reservas, todos sus bloques futuros deben mostrarse
  como disponibles y los bloques pasados deben permanecer no reservables.
- La frontera del horario actual debe evaluarse con la zona horaria del club: un bloque
  que ya inicio no puede reservarse.
- Si una reserva se cancela mientras otro usuario observa la grilla, la siguiente
  consulta debe reflejar el estado actualizado.
- Si una solicitud de reserva llega con una cancha fuera del catalogo, un bloque no
  entero o una fecha invalida, debe rechazarse sin cambiar datos.
- Una cuenta sin reservas debe ver estados vacios claros en reservas futuras e historial.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST permitir registrar una cuenta usando un correo electronico y
  una contraseña.
- **FR-002**: System MUST permitir iniciar y cerrar una sesion con las credenciales de
  la cuenta.
- **FR-003**: System MUST proteger la disponibilidad completa, la creacion de reservas
  y la gestion de reservas para que solo usuarios autenticados puedan acceder.
- **FR-004**: System MUST impedir que un usuario consulte o modifique reservas de otro
  usuario.
- **FR-005**: System MUST mostrar exactamente las cinco canchas fijas: Cancha Laureles,
  Cancha El Poblado, Cancha Belen, Cancha Robledo y Cancha Envigado.
- **FR-006**: System MUST permitir seleccionar una fecha mediante un calendario y una
  cancha del catalogo.
- **FR-007**: System MUST mostrar para la fecha y cancha seleccionadas los bloques de
  una hora en formato de 24 horas y su estado Disponible o Reservado.
- **FR-008**: System MUST permitir confirmar una reserva solo para un bloque futuro,
  entero y disponible.
- **FR-009**: System MUST revalidar la disponibilidad inmediatamente antes de crear una
  reserva y MUST rechazar con un conflicto claro cualquier colision detectada.
- **FR-010**: System MUST impedir que un usuario tenga mas de una reserva activa a la
  vez.
- **FR-011**: System MUST rechazar reservas para fechas u horarios que ya hayan
  transcurrido.
- **FR-012**: System MUST mostrar al usuario autenticado sus reservas futuras y su
  historial de reservas pasadas.
- **FR-013**: System MUST mostrar en cada reserva propia el nombre de la cancha, la fecha
  y la hora.
- **FR-014**: System MUST permitir cancelar una reserva futura propia despues de una
  confirmacion explicita.
- **FR-015**: System MUST devolver mensajes amigables para errores de autenticacion,
  validacion, disponibilidad y cancelacion, sin exponer detalles tecnicos internos.
- **FR-016**: System MUST excluir de esta iteracion pagos integrados, administracion web
  de canchas, notificaciones externas, reservas de mas de una hora en un solo clic y
  matchmaking.

### Key Entities *(include if feature involves data)*

- **Usuario**: Persona identificada por correo electronico y contraseña, con una sesion
  activa y acceso exclusivo a sus propias reservas.
- **Cancha**: Uno de los cinco espacios fijos disponibles para reservar.
- **Reserva**: Asociacion entre un usuario, una cancha, una fecha y un bloque entero de
  una hora, con estado activo, cancelado o pasado.
- **Bloque horario**: Intervalo de una hora dentro de una fecha, expresado en formato de
  24 horas y con estado Disponible o Reservado para una cancha.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Al menos el 95% de los usuarios de prueba puede registrarse e iniciar
  sesion correctamente en un primer intento usando datos validos.
- **SC-002**: Al menos el 95% de los usuarios autenticados puede encontrar la
  disponibilidad de una cancha y fecha en menos de 60 segundos.
- **SC-003**: El 100% de las pruebas de concurrencia para el mismo bloque termina con
  como maximo una reserva confirmada.
- **SC-004**: El 100% de los intentos de reservar fechas o bloques pasados es rechazado
  sin modificar reservas existentes.
- **SC-005**: Al menos el 95% de los usuarios puede crear una reserva futura valida en
  menos de 90 segundos desde la seleccion de la cancha.
- **SC-006**: El 100% de las reservas mostradas en Mis Reservas pertenece al usuario
  autenticado y contiene cancha, fecha y hora.
- **SC-007**: Al menos el 90% de los usuarios puede cancelar una reserva futura propia en
  menos de 60 segundos y observa el bloque liberado al consultar nuevamente.
- **SC-008**: En una prueba de aceptacion, el 100% de los mensajes de error mostrados al
  usuario es comprensible y no contiene stack traces ni detalles tecnicos internos.

## Assumptions

- `America/Bogota` es la zona horaria del club y la referencia para determinar fechas y horarios pasados.
- Una reserva activa es una reserva futura que no ha sido cancelada; al pasar su hora,
  forma parte del historial y deja de contar para el limite de una reserva activa.
- El correo electronico funciona como identificador unico de cuenta.
- El calendario permite consultar fechas pasadas para historial y disponibilidad, pero
  nunca permite confirmar reservas en ellas.
- Las reservas se gestionan en bloques de una hora; una solicitud de dos horas requiere
  dos reservas independientes y queda fuera del flujo de un solo clic.
- La lista de canchas y sus nombres es fija durante esta iteracion.
- El pago presencial y cualquier comunicacion externa al sistema quedan fuera del
  alcance de esta feature.
