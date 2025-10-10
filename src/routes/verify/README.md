# Verificación en Página (`/verify`) — sin API separada

Esta implementación **elimina** el endpoint `GET /api/verify` y realiza la verificación **directamente** en el `+page.server.ts` de la ruta `/verify`.  
El **QR** debe apuntar a: /verify?id=<PUBLIC_ID>

## ¿Qué hace?

- Lee el `publicId` del query param `id`.
- Busca el token, valida su estado (`active` / `revoked` / `expired`).
- Carga datos **públicos** desde las vistas:
  - `v_public_reservations`: apellidos de la reserva, `arrivalPtyAt`, `departurePtyAt`, `phase`.
  - `v_public_travelers`: `displayTraveler` (inicial + apellidos), solo si el token es por viajero.
- Registra un **access log** en `qr_access_logs` con resultado (`ok` / `not_found` / `revoked` / `expired`) y **IP hasheada** si configuraste `IP_HASH_SALT`.
- Devuelve al componente la data lista para renderizar (no JSON API).

## Ruta
GET /verify?id=<PUBLIC_ID>

### Respuesta (a la UI de SvelteKit)

El `load` de `+page.server.ts` expone al componente los siguientes datos (serializables):

- **Caso OK**
  ```ts
  {
    ok: true,
    status: 200,
    token: {
      publicId: string,
      type: 'group' | 'traveler',
      status: 'active',
      expiresAt: string,        // ISO
      id: string,               // uuid del token
      reservationId: string,    // uuid
      travelerId?: string       // si aplica
    },
    reservation: {
      reservationId: string,
      reservationLastNames: string | null,
      arrivalPtyAt: string,     // 'YYYY-MM-DD'
      departurePtyAt: string,   // 'YYYY-MM-DD'
      phase: 'upcoming' | 'in_progress' | 'completed'
    },
    traveler: {                 // solo tokens por viajero
      travelerId: string,
      displayTraveler: string | null
    } | null
  }

- **Caso error**
```ts
  { ok: false, status: 400|403|404|410, error: 'missing_id'|'revoked'|'not_found'|'expired' }
```
