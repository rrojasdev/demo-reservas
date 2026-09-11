# Tasks: Reservas de Canchas de Padel

**Input**: Design documents from `/specs/001-reservas-canchas/`

**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`,
`contracts/http-api.md`, `quickstart.md`

**Tests**: Incluidas para cubrir los escenarios de aceptación, los contratos HTTP y la
invariante crítica de no double-booking.

**Organization**: Las tareas se agrupan por historia para permitir entrega y validación
incrementales.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Inicializar el workspace TypeScript y la estructura plana aprobada.

- [ ] T001 Crear `package.json`, `tsconfig.json` y scripts raíz para workspace TypeScript con Node.js 22 LTS.
- [ ] T002 [P] Crear la estructura base `backend/src`, `backend/tests`, `frontend/src`, `frontend/tests` y `db/migrations`.
- [ ] T003 [P] Configurar dependencias de React 19, Tailwind CSS 4, Express 5, `better-sqlite3`, Vitest, Supertest y Playwright en `package.json`.
- [ ] T004 [P] Configurar TypeScript, Vitest, ESLint y formato en `tsconfig.json`, `vitest.config.ts` y `eslint.config.js`.
- [ ] T005 [P] Configurar Tailwind CSS y el punto de entrada de React en `frontend/src/styles.css` y `frontend/src/main.tsx`.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Implementar persistencia, configuración HTTP, seguridad y errores compartidos
antes de comenzar cualquier historia.

**Critical**: Ninguna historia puede iniciar hasta completar esta fase.

- [ ] T006 Crear el esquema SQLite para `users`, `sessions` y `reservations` en `db/migrations/001-initial.sql`, incluyendo claves foráneas, estados y restricciones de unicidad activa.
- [ ] T007 Implementar la apertura de `db/padel.db`, ejecución de migraciones y transacciones en `backend/src/db/database.ts`.
- [ ] T008 [P] Implementar configuración de entorno y zona horaria `America/Bogota` en `backend/src/config/environment.ts`.
- [ ] T009 [P] Implementar las constantes del catálogo cerrado de cinco canchas en `backend/src/courts/court-catalog.ts`.
- [ ] T010 [P] Implementar middleware de sesión, cookie `HttpOnly`/`SameSite=Lax` y guard de autenticación en `backend/src/http/auth-middleware.ts`.
- [ ] T011 [P] Implementar el formato común de errores seguros y el manejador Express para respuestas 400, 401, 404 y 409 en `backend/src/http/error-handler.ts`.
- [ ] T012 Crear la aplicación Express, registro de rutas `/api` y arranque del servidor en `backend/src/http/app.ts` y `backend/src/server.ts`.
- [ ] T013 Crear tipos compartidos de Usuario, Sesión, Cancha, Reserva y Bloque horario en `backend/src/types/domain.ts` y `frontend/src/types/api.ts`.
- [ ] T014 [P] Crear helpers de validación de correo, contraseñas, fechas y horas enteras en `backend/src/validation/input-validation.ts`.
- [ ] T015 [P] Crear la configuración de base temporal y utilidades de pruebas en `backend/tests/test-database.ts` y `backend/tests/test-server.ts`.
- [ ] T016 [P] Crear el shell de navegación, cliente JSON y traductor de errores amigables en `frontend/src/app/App.tsx`, `frontend/src/services/api-client.ts` y `frontend/src/services/error-messages.ts`.

**Checkpoint**: Base de datos, aplicación HTTP, sesión, catálogo, validación y UI base
están disponibles para implementar historias en paralelo.

---

## Phase 3: User Story 1 - Crear cuenta e iniciar sesión (Priority: P1) MVP

**Goal**: Permitir registro, login, logout y protección de rutas para usuarios autenticados.

**Independent Test**: Registrar una cuenta, iniciar sesión, consultar `/me`, cerrar sesión
y comprobar que una ruta protegida vuelve a responder 401.

### Tests for User Story 1

- [ ] T017 [P] [US1] Crear pruebas de contrato para register, login, logout y `/me` en `backend/tests/contract/auth.contract.test.ts`.
- [ ] T018 [P] [US1] Crear pruebas de integración para credenciales inválidas, correo duplicado y rutas protegidas en `backend/tests/integration/auth.integration.test.ts`.

### Implementation for User Story 1

- [ ] T019 [P] [US1] Implementar hash y verificación de contraseñas con Argon2id o bcrypt en `backend/src/auth/password-hasher.ts`.
- [ ] T020 [P] [US1] Implementar acceso SQL de usuarios y sesiones en `backend/src/auth/auth-repository.ts`.
- [ ] T021 [US1] Implementar registro, login, logout y usuario actual con creación e invalidación de sesiones en `backend/src/auth/auth-service.ts`.
- [ ] T022 [US1] Implementar endpoints `POST /api/auth/register`, `POST /api/auth/login`, `POST /api/auth/logout` y `GET /api/auth/me` en `backend/src/auth/auth-routes.ts`.
- [ ] T023 [US1] Implementar pantallas y formularios de registro/login/logout con estados de validación en `frontend/src/auth/AuthPage.tsx` y `frontend/src/auth/auth-service.ts`.
- [ ] T024 [US1] Implementar prueba E2E del flujo de registro, login, acceso protegido y logout en `frontend/tests/auth.e2e.spec.ts`.

**Checkpoint**: La autenticación es demostrable de forma independiente y todas las rutas
protegidas rechazan visitantes sin sesión.

---

## Phase 4: User Story 2 - Consultar disponibilidad de una cancha (Priority: P1)

**Goal**: Mostrar el catálogo fijo y los 24 bloques horarios de una cancha y fecha para
un usuario autenticado.

**Independent Test**: Con una sesión activa, cargar las cinco canchas, elegir una fecha
y verificar 24 bloques con estado disponible, reservado o pasado.

### Tests for User Story 2

- [ ] T025 [P] [US2] Crear pruebas de contrato para catálogo y disponibilidad en `backend/tests/contract/availability.contract.test.ts`.
- [ ] T026 [P] [US2] Crear pruebas de integración para catálogo cerrado, fecha inválida, bloques pasados y aislamiento sin sesión en `backend/tests/integration/availability.integration.test.ts`.

### Implementation for User Story 2

- [ ] T027 [P] [US2] Implementar consulta de reservas activas por cancha y fecha en `backend/src/availability/availability-repository.ts`.
- [ ] T028 [US2] Implementar cálculo de 24 bloques y estado `available`, `reserved` o `past` usando `America/Bogota` en `backend/src/availability/availability-service.ts`.
- [ ] T029 [US2] Implementar `GET /api/courts` y `GET /api/courts/{courtId}/availability` con autenticación y validación en `backend/src/availability/availability-routes.ts`.
- [ ] T030 [US2] Implementar selector de cancha, calendario y grilla de 24 horas con estados claros en `frontend/src/reservations/AvailabilityPage.tsx`.
- [ ] T031 [US2] Conectar la grilla con los endpoints de catálogo/disponibilidad y estados loading, vacío y error en `frontend/src/reservations/availability-service.ts`.
- [ ] T032 [US2] Implementar prueba E2E de catálogo, selección de fecha y visualización de bloques en `frontend/tests/availability.e2e.spec.ts`.

**Checkpoint**: Un usuario autenticado puede consultar disponibilidad completa sin crear
ni modificar reservas.

---

## Phase 5: User Story 3 - Crear una reserva (Priority: P1)

**Goal**: Confirmar un bloque futuro de una hora con validación atómica de colisiones y
límite de una reserva activa por usuario.

**Independent Test**: Confirmar un bloque futuro, comprobar que aparece reservado,
probar una segunda confirmación concurrente y verificar una sola reserva creada.

### Tests for User Story 3

- [ ] T033 [P] [US3] Crear pruebas unitarias de validación de bloque futuro, hora entera, duración de una hora y zona `America/Bogota` en `backend/tests/unit/reservation-validation.test.ts`.
- [ ] T034 [P] [US3] Crear pruebas de contrato para `POST /api/reservations` y sus respuestas 400, 401 y 409 en `backend/tests/contract/reservation-create.contract.test.ts`.
- [ ] T035 [P] [US3] Crear prueba de integración concurrente para el mismo bloque con una sola reserva confirmada en `backend/tests/integration/reservation-concurrency.integration.test.ts`.

### Implementation for User Story 3

- [ ] T036 [P] [US3] Implementar acceso SQL de reservas activas, colisiones y límite por usuario en `backend/src/reservations/reservation-repository.ts`.
- [ ] T037 [US3] Implementar servicio transaccional de creación que derive `endHour = startHour + 1`, revalide disponibilidad y preserve escrituras atómicas en `backend/src/reservations/reservation-service.ts`.
- [ ] T038 [US3] Implementar `POST /api/reservations` con autenticación, validación y códigos `400`, `401` y `409` en `backend/src/reservations/reservation-routes.ts`.
- [ ] T039 [US3] Integrar selección y confirmación de un bloque disponible con mensajes de conflicto en `frontend/src/reservations/ReservationCreate.tsx`.
- [ ] T040 [US3] Actualizar la grilla para reflejar la reserva creada y bloquear bloques pasados o reservados en `frontend/src/reservations/AvailabilityPage.tsx`.
- [ ] T041 [US3] Implementar prueba E2E de creación válida, fecha pasada, límite de reserva activa y conflicto de disponibilidad en `frontend/tests/reservation-create.e2e.spec.ts`.

**Checkpoint**: La ruta crítica de reserva garantiza como máximo una reserva activa por
bloque y por usuario, incluso bajo confirmaciones concurrentes.

---

## Phase 6: User Story 4 - Consultar y cancelar mis reservas (Priority: P2)

**Goal**: Mostrar reservas propias futuras e históricas y permitir cancelar una reserva
futura propia con confirmación explícita.

**Independent Test**: Consultar Mis Reservas, verificar aislamiento por usuario,
cancelar una reserva futura y comprobar que el bloque vuelve a estar disponible.

### Tests for User Story 4

- [ ] T042 [P] [US4] Crear pruebas de contrato para `GET /api/reservations/me` y cancelación en `backend/tests/contract/reservation-management.contract.test.ts`.
- [ ] T043 [P] [US4] Crear pruebas de integración para aislamiento, cancelación propia, cancelación pasada y cancelación repetida en `backend/tests/integration/reservation-management.integration.test.ts`.

### Implementation for User Story 4

- [ ] T044 [US4] Implementar consulta agrupada de reservas futuras, canceladas e históricas del usuario autenticado en `backend/src/reservations/reservation-service.ts`.
- [ ] T045 [US4] Implementar cancelación transaccional solo para reservas futuras activas del usuario actual en `backend/src/reservations/reservation-service.ts`.
- [ ] T046 [US4] Implementar `GET /api/reservations/me` y `POST /api/reservations/{reservationId}/cancel` en `backend/src/reservations/reservation-routes.ts`.
- [ ] T047 [US4] Implementar panel Mis Reservas con secciones futuras e historial y campos cancha, fecha y hora en `frontend/src/reservations/MyReservationsPage.tsx`.
- [ ] T048 [US4] Implementar confirmación explícita de cancelación, estados vacíos y actualización de disponibilidad en `frontend/src/reservations/ReservationCancel.tsx`.
- [ ] T049 [US4] Implementar prueba E2E de listado, aislamiento, cancelación y liberación del bloque en `frontend/tests/reservation-management.e2e.spec.ts`.

**Checkpoint**: El usuario puede gestionar únicamente sus reservas y una cancelación
futura libera el bloque en la siguiente consulta.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Cerrar calidad, seguridad, rendimiento y validación completa sin ampliar el
alcance del producto.

- [ ] T050 [P] Añadir pruebas unitarias de traducción de errores y ausencia de stack traces en `frontend/tests/error-messages.test.ts`.
- [ ] T051 [P] Añadir accesibilidad básica para formularios, calendario, grilla y estados en `frontend/src/components/Accessibility.tsx` y componentes relacionados.
- [ ] T052 [P] Añadir logging seguro de errores de servidor sin credenciales ni contraseñas en `backend/src/http/logger.ts`.
- [ ] T053 Ejecutar la validación de rendimiento p95 menor de 500 ms para disponibilidad y reserva en `backend/tests/performance/reservation-performance.test.ts`.
- [ ] T054 Ejecutar todos los escenarios de `specs/001-reservas-canchas/quickstart.md` y documentar resultados en `specs/001-reservas-canchas/validation-results.md`.
- [ ] T055 Revisar trazabilidad FR-001 a FR-016, non-goals y cumplimiento constitucional en `specs/001-reservas-canchas/plan.md` y la revisión final.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Sin dependencias; T001-T005 pueden iniciar de inmediato.
- **Foundational (Phase 2)**: Depende de Setup; bloquea todas las historias.
- **US1 (Phase 3)**: Depende de Phase 2; entrega el MVP de autenticación.
- **US2 (Phase 4)**: Depende de Phase 2 y requiere el guard de sesión de T010; puede avanzar en paralelo con US1 tras la foundation.
- **US3 (Phase 5)**: Depende de Phase 2 y usa autenticación de US1 y disponibilidad de US2 para la experiencia completa; las reglas de backend pueden implementarse tras la foundation.
- **US4 (Phase 6)**: Depende del modelo y servicio de reservas de US3; reutiliza la sesión de US1.
- **Polish (Phase 7)**: Depende de las historias que se quieran entregar y de sus checkpoints.

### User Story Dependencies

- **US1 (P1)**: No depende de otra historia después de Foundation.
- **US2 (P1)**: Solo depende de Foundation para backend; la UI requiere sesión de US1 para la demo completa.
- **US3 (P1)**: Requiere sesión de US1 y disponibilidad de US2 para el flujo completo; su núcleo transaccional puede desarrollarse en paralelo.
- **US4 (P2)**: Depende de US3 porque gestiona las reservas creadas por esa historia.

### Parallel Opportunities

- En Setup: T002-T005 pueden ejecutarse en paralelo después de T001.
- En Foundation: T008-T011, T013-T016 pueden ejecutarse en paralelo después de T006/T007 cuando necesiten la base compartida.
- En US1: T017-T018 y T019-T020 son paralelizables; T021-T024 siguen sus dependencias.
- En US2: T025-T026 y T027 pueden ejecutarse en paralelo; T028-T032 requieren el repositorio y catálogo.
- En US3: T033-T035 y T036 pueden ejecutarse en paralelo; T037-T041 dependen de la base transaccional.
- En US4: T042-T043 pueden ejecutarse en paralelo con el trabajo de UI T047; T044-T049 requieren el servicio de reservas.
- Entre historias: tras Foundation, equipos separados pueden trabajar US1, US2 y el núcleo backend de US3 en paralelo, evitando editar los mismos archivos.

## Parallel Example: User Story 1

```text
Task: T017 Contract tests in backend/tests/contract/auth.contract.test.ts
Task: T018 Integration tests in backend/tests/integration/auth.integration.test.ts
Task: T019 Password hashing in backend/src/auth/password-hasher.ts
Task: T020 User/session SQL access in backend/src/auth/auth-repository.ts
```

## Parallel Example: User Story 3

```text
Task: T033 Validation unit tests in backend/tests/unit/reservation-validation.test.ts
Task: T034 Reservation contract tests in backend/tests/contract/reservation-create.contract.test.ts
Task: T035 Concurrency test in backend/tests/integration/reservation-concurrency.integration.test.ts
Task: T036 Reservation repository in backend/src/reservations/reservation-repository.ts
```

## Implementation Strategy

### MVP First

1. Completar Phase 1 y Phase 2.
2. Completar US1 para registro, login y protección de sesión.
3. Completar el backend mínimo de US2 para catálogo y disponibilidad autenticada.
4. Validar el MVP con los checkpoints de US1 y US2.

### Incremental Delivery

1. Foundation lista y validada.
2. US1 entrega identidad y acceso protegido.
3. US2 entrega exploración de disponibilidad.
4. US3 entrega reservas atómicas y el valor central del producto.
5. US4 entrega historial y cancelación.
6. Phase 7 cierra calidad sin agregar funciones fuera de scope.

## Notes

- Cada tarea cumple el formato `- [ ] T### [P?] [US#?] descripción con ruta`.
- `[P]` indica que la tarea usa archivos distintos y no depende de trabajo incompleto.
- Las historias tienen criterios de prueba independientes y trazabilidad a los requisitos del spec.
- Las tareas no incluyen pagos, administración de canchas, notificaciones externas,
  reservas multi-hora en un clic ni matchmaking.
