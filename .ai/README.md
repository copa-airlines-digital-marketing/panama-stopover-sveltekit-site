# 🤖 Directorio AI - Reglas y Documentación

Este directorio contiene toda la documentación relacionada con las reglas de IA, el proceso de refactor y guías de desarrollo.

---

## 📁 Estructura

```
.ai/
├── README.md              # Este archivo
├── config/                # Configuración de Cursor/IA
│   └── CURSOR_CONFIG_SUMMARY.md
├── guides/                # Guías de desarrollo
│   ├── ENV_SETUP_GUIDE.md
│   └── ENV_TEMPLATE.txt
└── refactor/              # Documentación del refactor
    ├── DEV_SERVER_FIXED.md
    ├── DOMAINS_COMPLETE.md
    ├── FASE_DOMINIOS_COMPLETADA.md
    ├── IMPLEMENTATION_COMPLETE.md
    ├── IMPLEMENTATION_STATUS.md
    ├── MIGRATION_PROGRESS.md
    ├── NEXT_STEPS.md
    ├── PROGRESS_UPDATE.md
    ├── REFACTOR_FINAL_STATUS.md
    ├── REFACTOR_STATUS.md
    ├── SUBMODULE_ERRORS.md
    └── VALIDATION_REPORT.md
```

---

## 📂 Descripción de Directorios

### `/config` - Configuración de Cursor/IA
Documentación sobre cómo está configurado Cursor para trabajar en este proyecto.

- **CURSOR_CONFIG_SUMMARY.md**: Guía completa de configuración de Cursor
  - Reglas del proyecto
  - Archivos ignorados
  - Errores a ignorar
  - Arquitectura DDD

### `/guides` - Guías de Desarrollo
Guías prácticas para desarrolladores que trabajan en el proyecto.

- **ENV_SETUP_GUIDE.md**: Guía completa de variables de entorno
  - Explicación de cada variable
  - Dónde obtener valores
  - Ejemplos
  - Troubleshooting

- **ENV_TEMPLATE.txt**: Plantilla para crear `.env`
  - Todas las variables requeridas
  - Sin valores sensibles
  - Listo para copiar

### `/refactor` - Documentación del Refactor
Historial completo del proceso de refactor del proyecto.

#### Estado Final
- **REFACTOR_FINAL_STATUS.md**: Estado final del refactor
- **IMPLEMENTATION_COMPLETE.md**: Resumen de implementación
- **DEV_SERVER_FIXED.md**: Cómo se resolvieron errores del dev server

#### Progreso
- **IMPLEMENTATION_STATUS.md**: Estado de implementación detallado
- **MIGRATION_PROGRESS.md**: Progreso de migración
- **PROGRESS_UPDATE.md**: Actualizaciones de progreso
- **REFACTOR_STATUS.md**: Estado del refactor

#### Fases Completadas
- **FASE_DOMINIOS_COMPLETADA.md**: Fase de dominios DDD
- **DOMAINS_COMPLETE.md**: Dominios completados
- **VALIDATION_REPORT.md**: Reporte de validación

#### Problemas Resueltos
- **SUBMODULE_ERRORS.md**: Errores en submodules y cómo resolverlos

#### Próximos Pasos
- **NEXT_STEPS.md**: Siguiente pasos del refactor

---

## 🔧 Archivos de Configuración en Root

Estos archivos deben permanecer en el root del proyecto porque Cursor los busca ahí:

- **`.cursorrules`**: Reglas del proyecto para Cursor AI
- **`.cursorignore`**: Archivos y directorios que Cursor debe ignorar

---

## 📚 Documentación del Proyecto

La documentación general del proyecto (no relacionada con IA) está en `/docs`:

- `cms.md`: Documentación de Directus CMS
- `server.md`: Documentación del servidor
- `REPOSITORY_STRUCTURE.md`: Estructura del repositorio

---

## 🎯 Propósito

Este directorio existe para:

1. **Mantener el root limpio**: Solo archivos esenciales en el root
2. **Organizar documentación**: Fácil de encontrar y mantener
3. **Historial del refactor**: Registrar todo el proceso de mejora
4. **Guías para desarrolladores**: Ayudar a nuevos desarrolladores
5. **Configuración de IA**: Documentar cómo trabajar con Cursor

---

## 📖 Lectura Recomendada

### Para Nuevos Desarrolladores
1. `/guides/ENV_SETUP_GUIDE.md` - Configurar entorno
2. `/config/CURSOR_CONFIG_SUMMARY.md` - Entender reglas de Cursor
3. `/refactor/REFACTOR_FINAL_STATUS.md` - Estado del proyecto

### Para Entender el Refactor
1. `/refactor/REFACTOR_FINAL_STATUS.md` - Resumen ejecutivo
2. `/refactor/IMPLEMENTATION_STATUS.md` - Detalles de implementación
3. `/refactor/DEV_SERVER_FIXED.md` - Cómo se resolvieron problemas

### Para Trabajar con Cursor
1. `/config/CURSOR_CONFIG_SUMMARY.md` - Configuración completa
2. Root: `.cursorrules` - Reglas del proyecto
3. Root: `.cursorignore` - Archivos ignorados

---

## ✅ Beneficios de esta Estructura

- ✅ **Root limpio**: Más fácil de navegar
- ✅ **Organizado**: Documentación agrupada por propósito
- ✅ **Mantenible**: Fácil de actualizar
- ✅ **Descubrible**: Estructura clara
- ✅ **Histórico**: Registro completo del refactor

---

**Última actualización:** 2026-01-16
