# Implementation Plan: Reservas de Canchas de Padel

**Branch**: `001-reservas-canchas` | **Date**: 2026-09-11 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/001-reservas-canchas/spec.md`

**Note**: This template is filled in by the `/speckit-plan` command; its definition describes the execution workflow.

## Summary

Entregar autenticacion por correo y contraseña, consulta autenticada de disponibilidad
para las cinco canchas, reservas de bloques de una hora y gestion de reservas propias.
La aplicacion usara React, Express y SQLite local. La reserva se confirmara dentro de
una transaccion que valide nuevamente la disponibilidad y el limite de una reserva
activa antes de persistirla. La grilla de disponibilidad se limitará estrictamente al
rango de 07:00 AM a 10:00 PM, sin mostrar horarios entre las 10:00 PM y las 06:00 AM.

## Technical Context

<!--
  ACTION REQUIRED: Replace the content in this section with the technical details
  for the project. The structure here is presented in advisory capacity to guide
  the iteration process.
-->

**Language/Version**: TypeScript 5.x sobre Node.js 22 LTS

**Primary Dependencies**: React 19, Express 5, Tailwind CSS 4, better-sqlite3,
sesiones HTTP con cookie segura y Vitest/Supertest/Playwright para pruebas

**Storage**: SQLite local en `db/padel.db`; SQL directo y transacciones SQLite

**Testing**: Vitest para logica, Supertest para contratos HTTP y Playwright para los
flujos principales de navegador

**Target Platform**: Navegadores modernos y servidor Linux local

**Project Type**: Aplicacion web con frontend y backend

**Performance Goals**: Consultas de disponibilidad y operaciones de reserva con p95 menor
de 500 ms en el entorno local de validacion; la grilla debe mostrarse en menos de 60 s
de interaccion del usuario.

**Constraints**: Zona horaria `America/Bogota`; cinco canchas inmutables; bloques de una
hora; una reserva activa por usuario; horario operativo restringido a 07:00 AM a 10:00
PM; el rango de 10:00 PM a 06:00 AM no es elegible ni visible como disponible; sin
pagos, notificaciones externas ni panel de administracion; errores tecnicos nunca llegan
a la UI.

**Scale/Scope**: MVP local para un club, cinco canchas, usuarios autenticados y una
reserva activa por usuario; el almacenamiento debe soportar concurrencia de solicitudes
de reserva sin double-booking.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

* PASS - El stack y la estructura cumplen TypeScript, React/Tailwind, Node/Express,
  SQLite y los directorios planos `/frontend`, `/backend` y `/db`.
* PASS - La reserva se diseñara con validacion atomica dentro de una transaccion SQLite;
  un conflicto devuelve 409 y no deja escrituras parciales.
* PASS - Las rutas protegidas requieren sesion; los datos de reservas se filtran por
  usuario autenticado y no permiten acceso a terceros.
* PASS - La UI traducira errores a mensajes amigables y no expondra stack traces.
* PASS - El alcance excluye las funciones declaradas como non-goals en el spec.

## Project Structure

### Documentation (this feature)

```text
specs/001-reservas-canchas/
├── plan.md              # Este plan
├── research.md          # Decisiones tecnicas
├── data-model.md        # Entidades y estados
├── quickstart.md        # Validacion end-to-end
├── contracts/           # Contratos HTTP
└── tasks.md             # Se generara con /speckit-tasks
```

### Source Code (repository root)
<!--
  ACTION REQUIRED: Replace the placeholder tree below with the concrete layout
  for this feature. Delete unused options and expand the chosen structure with
  real paths (e.g., apps/admin, packages/something). The delivered plan must
  not include Option labels.
-->

```text
backend/
├── src/
│   ├── auth/
│   ├── reservations/
│   ├── availability/
│   ├── http/
│   └── db/
└── tests/
  ├── unit/
  ├── integration/
  └── contract/

frontend/
├── src/
│   ├── auth/
│   ├── reservations/
│   ├── components/
│   └── services/
└── tests/

db/
├── migrations/
└── padel.db
```

**Structure Decision**: Se adopta una estructura web plana con `/frontend`, `/backend`
y `/db`. El backend concentra autenticacion, disponibilidad, reservas y HTTP; el
frontend contiene las vistas y servicios de usuario; `/db` contiene la base local y su
esquema. No se agregan capas de Clean Architecture ni repositorios abstractos.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

No hay violaciones constitucionales que justificar. Las pruebas se mantienen como
subdirectorios de `/backend` y `/frontend`, no como un proyecto adicional.
