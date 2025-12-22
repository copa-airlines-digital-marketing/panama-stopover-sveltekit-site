# API de **QR como imagen** (JPG/PNG/WEBP)

Genera códigos QR **raster** (compatibles con clientes de correo) que apuntan a la verificación:
`/api/verify?id=<PUBLIC_ID>`.

---

## Endpoints

```
GET /api/qr/:publicId.jpg
GET /api/qr/:publicId.png
GET /api/qr/:publicId.webp
```

> Opcional (vector): `GET /api/qr/:publicId.svg`

**Parámetros (query):**

| Param | Tipo   |           Rango | Default | Descripción                     |
| ----- | ------ | --------------: | ------: | ------------------------------- |
| `w`   | number |        240–2048 | **600** | Ancho (px). Alto = ancho.       |
| `m`   | number |             0–8 |   **2** | Margen (quiet zone) en módulos. |
| `ec`  | string | `L` `M` `Q` `H` |   **Q** | Corrección de error (robustez). |

---

## Ejemplos

**JPG (recomendado para email):**

```
/api/qr/AbCDeFgHiJkLmNoPqRsT1.jpg?w=600&m=2&ec=Q
```

**PNG (máxima compatibilidad):**

```
/api/qr/AbCDeFgHiJkLmNoPqRsT1.png?w=600&m=2&ec=Q
```

**WEBP (si el cliente lo soporta):**

```
/api/qr/AbCDeFgHiJkLmNoPqRsT1.webp?w=600
```

**HTML (plantilla de correo):**

```html
<img
  src="https://panama-stopover.com/api/qr/AbCDeFgHiJkLmNoPqRsT1.jpg?w=600&m=2&ec=Q"
  width="300"
  alt="QR de verificación de Stopover" />
```

---

## Recomendaciones para email

* Usa **JPG** o **PNG**; tamaño sugerido **600–800 px** de ancho y `ec=Q` o `H`.
* No apliques compresión extra en el ESP (si la hay, sube `w`).
* Alto contraste: QR negro sobre fondo blanco.
* Incluye `alt` por accesibilidad.

---

## Respuestas y headers

* **200 OK** → imagen (`Content-Type` acorde).
* **404 Not Found** → `publicId` inexistente.
* **415 Unsupported Media Type** → formato no soportado (solo `jpg`/`png`/`webp`/`svg`).
* **Cache-Control**: `no-store` (evita cachear imágenes de tokens sensibles).
* **x-fallback: sharp-missing** (solo si `sharp` no está disponible; se sirve **PNG**).

---

## Integración con el **Bulk API**

El endpoint bulk de creación/upsert devuelve URLs listas:

```json
{
  "tokens": [
    {
      "kind": "group",
      "publicId": "AbCDeFgHiJkLmNoPqRsT1",
      "verifyUrl": "https://.../api/verify?id=AbCDeFgHiJkLmNoPqRsT1",
      "qrSvgUrl": "https://.../api/qr/AbCDeFgHiJkLmNoPqRsT1.svg",
      "qrImageUrls": {
        "jpg": "https://.../api/qr/AbCDeFgHiJkLmNoPqRsT1.jpg?w=600&m=2&ec=Q",
        "png": "https://.../api/qr/AbCDeFgHiJkLmNoPqRsT1.png?w=600&m=2&ec=Q",
        "webp": "https://.../api/qr/AbCDeFgHiJkLmNoPqRsT1.webp?w=600"
      }
    }
  ]
}
```

Configura los defaults por item con `qrOptions`: `width`, `margin`, `ec`, `formats`.

---

## Requisitos del proyecto

* **Node 18+**
* Dependencias: `qrcode` (obligatoria), `sharp` (opcional para JPG/WEBP; si falla, se entrega PNG).
* SvelteKit (adapter Node u otro compatible con `Response(ArrayBuffer)`).

---

## Notas de implementación (TypeScript)

* La ruta se implementa con tres endpoints:
  `api/qr/[publicId].jpg`, `api/qr/[publicId].png`, `api/qr/[publicId].webp`.
  
---

## Seguridad y privacidad

* El QR **solo** encierra `verify?id=<publicId>` (sin PII).
* `/api/verify` respeta expiración/estado del token y expone solo **inicial + apellidos + fechas + fase**.
* Ante filtración, **revoca** el token y reemite otro.

---

## Troubleshooting

* **Imagen “borrosa” en correo:** sube `w` (p. ej. `w=800`) y usa `ec=Q/H`. Evita que el ESP reescale.
* **Cliente no soporta WEBP:** usa **JPG** o **PNG**.
* **Falla `sharp` en dev Windows:** se servirá **PNG** con `x-fallback: sharp-missing`. Para prod, asegúrate de instalar el binario de `sharp` compatible con tu plataforma/Node.

---

¿Quieres añadir **content negotiation** (auto-WEBP si el cliente lo acepta, y JPG si no) o **firma HMAC** de los parámetros `w/m/ec`? Lo puedo sumar.
