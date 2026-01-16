# Bulk API (`POST /api/reservations/bulk`)

## Descripción

Endpoint **bulk** para crear/actualizar **reservas** (upsert por **PNR**) con sus **viajeros**, y **emitir tokens** (de grupo y/o por viajero) en una sola llamada. Devuelve URLs listas para **verificación** y **QR** (SVG e imagen).

* **TTL de tokens:** `departurePtyAt + 7 días`.
* **Seguridad:** los tokens son opacos (`publicId`). La validación real ocurre en `/api/verify`.

---

## Comportamiento clave (actualizado)

- **Dedupe de viajeros (sin `replaceTravelers`)**: el API evita duplicados comparando `firstName`, `lastName1`, `lastName2` **normalizados** (trim, espacios comprimidos, minúsculas).  
  - Si el mismo viajero ya existe en la reserva o viene repetido dentro del mismo payload, **no se crea de nuevo**.  
  - Con `replaceTravelers: true` se **eliminan** todos los viajeros de la reserva y se **recrean** exactamente los enviados.
- **Tokens por viajero en batch**: se insertan con **`createMany`** y luego se consultan para devolver `tokenId` y URLs; esto reduce roundtrips y acelera la emisión.
- **TTL**: `expiresAt = departurePtyAt + 7 días`.
- **PNR obligatorio**: upsert por `pnrLocator`.

---

## Endpoint

```
POST /api/reservations/bulk
Content-Type: application/json
```

### Body (JSON)

```json
{
  "items": [
    {
      "pnrLocator": "ABC123",
      "arrivalPtyAt": "2025-12-04",
      "departurePtyAt": "2025-12-07",
      "travelers": [
        { "firstName": "Juan", "lastName1": "Pérez", "lastName2": "Gómez" },
        { "firstName": "María", "lastName1": "Rodríguez" }
      ],
      "tokenMode": "both",
      "revokePreviousTokens": true,
      "replaceTravelers": true,
      "qrOptions": { "width": 600, "margin": 2, "ec": "Q", "formats": ["jpg","png","webp"] }
    }
  ]
}
```

### Campos del body (por item)

|| Campo                  | Tipo                                  | Oblig. | Ejemplo         | Descripción                                                                                                                                    |
|| ---------------------- | ------------------------------------- | :----: | --------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
|| `pnrLocator`           | string                                | **Sí** | `"ABC123"`      | **Identificador único** de la reserva. Se usa para **upsert**. Sugerido 6 caracteres alfanuméricos.                                            |
|| `arrivalPtyAt`         | string (YYYY-MM-DD)                   | **Sí** | `"2025-12-04"`  | **Fecha de llegada a PTY**. Formato `YYYY-MM-DD`.                                                                                              |
|| `departurePtyAt`       | string (YYYY-MM-DD)                   | **Sí** | `"2025-12-07"`  | **Fecha de salida de PTY**. Debe ser **≥** `arrivalPtyAt`.                                                                                     |
|| `travelers`            | `TravelerInput[]`                     | **Sí** | ver abajo       | Lista de viajeros de la reserva (mínimo 1).                                                                                                    |
|| `tokenMode`            | `'group' \| 'per_traveler' \| 'both'` |   No   | `"group"`       | **Qué tokens emitir**: uno para toda la reserva (`group`), uno por viajero (`per_traveler`) o ambos (`both`). Default: `group`.                |
|| `revokePreviousTokens` | boolean                               |   No   | `true`          | Si `true`, **revoca** los tokens activos previos de esta reserva antes de emitir nuevos. Default: `false`.                                     |
|| `replaceTravelers`     | boolean                               |   No   | `true`          | Si `true`, **reemplaza** los viajeros existentes por los enviados (borra y recrea). Si `false`, **agrega** a los existentes. Default: `false`. |
|| `qrOptions.width`      | number                                |   No   | `600`           | Ancho del QR en píxeles. Rango: 240–2048. Default: `600`.                                                                                      |
|| `qrOptions.margin`     | number                                |   No   | `2`             | Margen (*quiet zone*) en módulos. Rango: 0–8. Default: `2`.                                                                                    |
|| `qrOptions.ec`         | `'L' \| 'M' \| 'Q' \| 'H'`            |   No   | `"Q"`           | Nivel de corrección de error (más alto = más robusto). Default: `Q`.                                                                           |
|| `qrOptions.formats`    | `('jpg' \| 'png' \| 'webp')[]`        |   No   | `["jpg","png"]` | Formatos de imagen de QR a devolver. Default: `["jpg","png","webp"]`.                                                                          |

**TravelerInput**

* `firstName` (string, **obligatorio**): primer nombre.
* `lastName1` (string, **obligatorio**): primer apellido.
* `lastName2` (string, opcional): segundo apellido.

> **PII**: en /verify se expone solo **inicial** del nombre y apellidos.

- **`travelers`** (array, **obligatorio**): lista de viajeros (≥1).  
  - El API aplica **dedupe automático** por `(firstName, lastName1, lastName2)` **normalizados** (sin espacios extra y en minúsculas).  
  - Duplicados existentes en la BD o en el **mismo payload** se **ignoran** cuando `replaceTravelers` es `false`.  
  - Con `replaceTravelers: true` se borra todo y se crean exactamente los informados (sin dedupe).
- **`replaceTravelers`** (boolean, default `false`):  
  - `true` → **reemplazo completo** (DELETE + bulk INSERT).  
  - `false` → **agregado incremental** **solo** de viajeros **nuevos** (con dedupe).

---

## Respuesta (200 OK)

```json
{
  "results": [
    {
      "index": 0,
      "status": "ok",
      "reservationId": "f1f2c3d4-....",
      "pnrLocator": "ABC123",
      "arrivalPtyAt": "2025-12-04T00:00:00.000Z",
      "departurePtyAt": "2025-12-07T00:00:00.000Z",
      "tokens": [
        {
          "kind": "group",
          "tokenId": "0a1b2c3d-....",
          "publicId": "AbCDeFgHiJkLmNoPqRsT1",
          "expiresAt": "2025-12-14T00:00:00.000Z",
          "verifyUrl": "https://.../api/verify?id=AbCDeF...",
          "qrSvgUrl": "https://.../api/qr/AbCDeF....svg",
          "qrImageUrls": {
            "jpg": "https://.../api/qr/AbCDeF....jpg?w=600&m=2&ec=Q",
            "png": "https://.../api/qr/AbCDeF....png?w=600&m=2&ec=Q",
            "webp": "https://.../api/qr/AbCDeF....webp?w=600&m=2&ec=Q"
          }
        },
        {
          "kind": "traveler",
          "travelerId": "9a8b7c6d-....",
          "tokenId": "....",
          "publicId": "....",
          "expiresAt": "....",
          "verifyUrl": "....",
          "qrSvgUrl": "....",
          "qrImageUrls": { "jpg": "....", "png": "...." }
        }
      ]
    }
  ]
}
```

### Errores por item

Cada elemento en `results` puede traer:

* `status: "error"`, `error: "missing_pnr_locator" | "invalid_dates" | "invalid_dates_range" | "missing_travelers" | "internal_error"`
* `index`: posición del item fallido en el arreglo de entrada.

Errores globales del request:

* `400 {"error":"invalid_json"}` → el body no es JSON válido.
* `400 {"error":"empty_items"}` → `items` vacío o ausente.

---

## Notas

* **Upsert por PNR:** si existe, se actualiza; si no, se crea.
* **TTL:** se calcula como `departurePtyAt + 7 días`.
* **Revocación:** puedes forzar revocar tokens activos previos con `revokePreviousTokens: true`.
* **Viajeros:** usa `replaceTravelers: true` si quieres sincronizar exacto contra tu fuente (borra y recrea).

---
