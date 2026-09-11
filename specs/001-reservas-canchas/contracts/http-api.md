# HTTP API Contracts

Base URL: `/api`  
Content type: `application/json`  
Timezone for date and hour validation: `America/Bogota`

## Error shape

All handled errors use this shape and never include stack traces:

```json
{
  "error": {
    "code": "reservation_conflict",
    "message": "La cancha ya fue reservada en este horario."
  }
}
```

`code` is stable for UI translation; `message` is safe to show to the user.

## Authentication

### `POST /api/auth/register`

Request:

```json
{
  "email": "ana@example.com",
  "password": "Una-clave-segura-123"
}
```

Responses:

- `201`: account created and session established.
- `400`: invalid email or password.
- `409`: email already registered.

### `POST /api/auth/login`

Request:

```json
{
  "email": "ana@example.com",
  "password": "Una-clave-segura-123"
}
```

Responses:

- `200`: session established and safe user summary returned.
- `400`: malformed request.
- `401`: invalid credentials.

### `POST /api/auth/logout`

Requires an active session. Invalidates the current session.

Responses: `204` on success, `401` without a session.

### `GET /api/auth/me`

Returns the authenticated user summary.

Responses: `200` with user summary, `401` without a session.

## Courts and availability

### `GET /api/courts`

Requires an active session. Returns exactly the five fixed courts:

```json
{
  "courts": [
    { "id": "laureles", "name": "Cancha Laureles" },
    { "id": "el-poblado", "name": "Cancha El Poblado" },
    { "id": "belen", "name": "Cancha Belen" },
    { "id": "robledo", "name": "Cancha Robledo" },
    { "id": "envigado", "name": "Cancha Envigado" }
  ]
}
```

Response: `200`; `401` without a session.

### `GET /api/courts/{courtId}/availability?date=YYYY-MM-DD`

Requires an active session. Returns 24 one-hour blocks for the selected date and court.
Each block includes `startHour`, `endHour`, and `status` with `available`, `reserved`,
or `past`.

Responses: `200`; `400` invalid date or court; `401` without a session; `404` unknown
court.

## Reservations

### `POST /api/reservations`

Requires an active session.

Request:

```json
{
  "courtId": "laureles",
  "date": "2026-09-15",
  "startHour": 14
}
```

The server derives `endHour` as `startHour + 1`, validates the block in
`America/Bogota`, checks the user's active reservation, rechecks court availability in
the write transaction, and then persists.

Responses:

- `201`: created reservation with court, date, start and end time.
- `400`: invalid court, date, non-integer hour, or past block.
- `401`: no active session.
- `409` with `reservation_conflict`: another active reservation occupies the block.
- `409` with `active_reservation_limit`: user already has an active reservation.

### `GET /api/reservations/me`

Requires an active session. Returns only the current user's future active reservations,
cancelled reservations and past history, grouped by status.

Response: `200`; `401` without a session.

### `POST /api/reservations/{reservationId}/cancel`

Requires an active session. Cancels only a future active reservation owned by the
current user after explicit confirmation in the UI.

Responses:

- `204`: cancelled successfully.
- `401`: no active session.
- `404`: reservation does not exist for the current user.
- `409`: reservation is already past or cancelled.
