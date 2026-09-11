<!--
Sync Impact Report
- Version change: unspecified -> 1.0.0
- Modified principles: none; initial constitution established
- Added sections: Product and Technical Constraints; Development Workflow and Quality Gates
- Removed sections: none
- Follow-up TODOs: confirm the original ratification date
-->

# Sistema de Reservas de Padel Constitution

## Core Principles

### I. Dominio de Reservas Inmutable
El sistema MUST gestionar exclusivamente las cinco canchas fijas: Cancha Laureles,
Cancha El Poblado, Cancha Belen, Cancha Robledo y Cancha Envigado. Las reservas MUST
usar bloques de tiempo en formato de 24 horas. Todo flujo de reserva MUST requerir un
usuario autenticado. Estas reglas son invariantes del dominio y cualquier cambio exige
una enmienda constitucional.

### II. Integridad y Prevencion de Double-Booking
Antes de escribir cualquier reserva, el backend MUST validar de forma atomica que la
cancha este libre durante el bloque solicitado. Si existe una reserva incompatible,
MUST rechazar la operacion con HTTP 409 y no persistir ningun dato. Esta es la regla
critica del sistema porque protege la disponibilidad real de las canchas.

### III. Stack TypeScript y Simplicidad
Todo el stack MUST usar TypeScript. La interfaz MUST usar React con Tailwind CSS; el
backend MUST usar Node.js con Express; y la persistencia MUST usar SQLite local en
`padel.db`, mediante `better-sqlite3` o SQL directo. La estructura MUST mantenerse
plana en `/frontend`, `/backend` y `/db`. No se permiten ORMs pesados, Clean
Architecture ni patrones complejos sin una justificacion constitucional.

### IV. Validacion y Errores Semanticos
El backend MUST devolver HTTP 400 para peticiones invalidas, 401 para solicitudes no
autenticadas y 409 para conflictos de reserva. La UI MUST traducir los errores tecnicos
a mensajes amigables y MUST ocultar stack traces y detalles internos. Las validaciones
de entrada y de reglas de negocio MUST ejecutarse antes de modificar el estado.

### V. Fuente de Verdad y Codigo Sin Sombra
El trabajo MUST implementar estrictamente lo documentado en `spec.md`. El agente MUST
evitar funciones especulativas, incluyendo pasarelas de pago y perfiles complejos no
solicitados. Si una instruccion contradice esta constitucion o revela una falla logica,
el agente MUST detenerse, explicar el conflicto y solicitar la actualizacion de
`spec.md` antes de modificar codigo fuente.

## Restricciones de Producto y Tecnologia

La aplicacion administra reservas de canchas de padel para usuarios autenticados.
Las funciones, entidades y rutas deben limitarse al alcance aprobado en `spec.md`.
La programacion MUST favorecer funciones y componentes funcionales con Hooks en React;
las clases solo pueden usarse cuando una dependencia las haga obligatorias. Las
funciones y variables MUST usar `camelCase`; las interfaces y tipos MUST usar
`PascalCase`. El catalogo de canchas no puede ampliarse por configuracion ni por
entrada del usuario.

## Flujo de Desarrollo y Puertas de Calidad

Cada cambio MUST poder trazarse a un requisito de `spec.md` y MUST verificar las
invariantes de autenticacion, disponibilidad y codigos HTTP. Antes de integrar un
cambio que afecte reservas, se MUST comprobar el rechazo de colisiones y la ausencia
de escrituras parciales. Las revisiones MUST verificar el stack aprobado, la estructura
plana, la ausencia de codigo sombra y la no exposicion de errores internos. La
complejidad adicional requiere una justificacion escrita en la especificacion o en la
revision del cambio.

## Governance
<!-- Example: Constitution supersedes all other practices; Amendments require documentation, approval, migration plan -->

Esta constitucion prevalece sobre practicas de implementacion que entren en conflicto
con ella. Toda enmienda MUST describir el motivo, las reglas afectadas, el impacto en
`spec.md` y los cambios de migracion necesarios. La version MUST seguir SemVer:
MAJOR para eliminar o redefinir reglas incompatibles, MINOR para agregar o ampliar
principios, y PATCH para aclaraciones no semanticas. Toda revision de cambios MUST
incluir una comprobacion de cumplimiento constitucional. Los conflictos entre
constitucion y especificacion MUST resolverse actualizando primero `spec.md` y, si
corresponde, esta constitucion; no se permite implementar mientras el conflicto siga
abierto.

**Version**: 1.0.0 | **Ratified**: TODO(RATIFICATION_DATE): confirmar fecha de adopcion original | **Last Amended**: 2026-09-11
