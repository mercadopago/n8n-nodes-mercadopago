# 🔒 Guía de Automatización de Seguridad

Esta guía explica cómo funciona el sistema híbrido de automatización de seguridad implementado en este proyecto.

## 📁 Archivos del Sistema

```
.github/
├── dependabot.yml                    # Configuración de Dependabot
├── workflows/
│   ├── smart-security-fix.yml       # Workflow principal (auto-fix)
│   └── auto-merge.yml               # Workflow de auto-merge
├── CODEOWNERS                        # Revisores automáticos
└── SECURITY_AUTOMATION_GUIDE.md     # Esta guía

SECURITY.md                           # Política de seguridad pública
```

## 🔄 Flujo Completo del Sistema

```
┌─────────────────────────────────────────────────┐
│  1. Dependabot (Diario, 2 AM)                  │
│     - Escanea dependencias                      │
│     - Detecta vulnerabilidades                  │
└─────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────┐
│  2. Smart Security Fix (3 AM o inmediato)       │
│     - npm audit                                 │
│     - Cuenta vulnerabilidades por severidad     │
│     - Decide estrategia                         │
└─────────────────────────────────────────────────┘
                    ↓
         ┌──────────┴──────────┐
         ↓                     ↓
┌──────────────────┐   ┌──────────────────┐
│ Critical/High    │   │ Moderate/Low     │
│ AUTO-FIX         │   │ MANUAL REVIEW    │
├──────────────────┤   ├──────────────────┤
│ • Crear branch   │   │ • Crear issue    │
│ • npm audit fix  │   │ • Asignar team   │
│ • Run tests      │   │ • Label          │
│ • Build          │   └──────────────────┘
│ • Lint           │
│ • Create PR      │
└──────────────────┘
         ↓
┌─────────────────────────────────────────────────┐
│  3. Auto-Merge (Inmediato)                      │
│     - Verifica criterios                        │
│     - Espera checks                             │
│     - Aprueba automáticamente                   │
│     - Mergea a develop                          │
└─────────────────────────────────────────────────┘
         ↓
┌─────────────────────────────────────────────────┐
│  4. Resultado                                   │
│     ✅ Security fix en develop                  │
│     📧 Notificación al equipo                   │
│     🧹 Branch limpio                            │
└─────────────────────────────────────────────────┘
```

## 🎯 Casos de Uso

### Caso 1: Vulnerabilidad Crítica - Camino Feliz ✅

```
09:00 - Dependabot detecta CVE-2024-XXXX (Critical)
09:01 - Smart Security Fix se activa
09:02 - Crea branch feature/security-fix-20240216-090200
09:03 - Ejecuta npm audit fix
09:04 - Build + Tests + Lint → ✅ TODO PASA
09:05 - Commit + Push
09:06 - Crea PR #123 contra develop
09:07 - Auto-Merge detecta PR #123
09:08 - Espera a checks (build, tests)
09:10 - Todos los checks ✅
09:11 - Aprueba PR automáticamente
09:12 - Mergea a develop (squash)
09:13 - Elimina branch
09:14 - Notifica en PR: "🎉 Auto-merged"

Resultado: Vulnerabilidad resuelta en 14 minutos sin intervención humana
```

### Caso 2: Vulnerabilidad Crítica - Tests Fallan ⚠️

```
09:00 - Dependabot detecta CVE-2024-YYYY (Critical)
09:01 - Smart Security Fix se activa
09:02 - Crea branch
09:03 - Ejecuta npm audit fix
09:04 - Build ✅, Tests ❌ FALLAN, Lint ✅
09:05 - NO crea PR
09:06 - Crea Issue #124: "🚨 Security auto-fix failed"
09:07 - Asigna a @samhermeli y @Harievilozanini
09:08 - Notifica por email

Resultado: Equipo notificado para intervención manual inmediata
```

### Caso 3: Vulnerabilidades Moderadas 📝

```
09:00 - Dependabot detecta 3 vulnerabilidades (Moderate)
09:01 - Smart Security Fix se activa
09:02 - Analiza: 0 critical, 0 high, 3 moderate
09:03 - Decisión: MANUAL REVIEW
09:04 - Crea Issue #125: "🔍 Security: Manual review needed"
09:05 - Label: review-needed, low-priority
09:06 - Asigna al equipo

Resultado: Issue para agrupar en próxima ventana de mantenimiento
```

## 🛠️ Cómo Usar el Sistema

### Activación Automática

El sistema funciona **automáticamente**, no requiere configuración adicional:

1. **Dependabot**: Ya está activo en GitHub
2. **Workflows**: Se activan automáticamente

### Ejecución Manual (Si necesitas)

#### Ejecutar Smart Security Fix manualmente:

```bash
# Desde GitHub UI:
1. Ve a Actions → Smart Security Fix
2. Click "Run workflow"
3. Selecciona severidad mínima (opcional)
4. Click "Run workflow"
```

#### Ejecutar Auto-Merge manualmente:

```bash
# Desde GitHub UI:
1. Ve a Actions → Auto-Merge Security PRs
2. Click "Run workflow"
3. Ingresa número de PR
4. Click "Run workflow"
```

### Monitoreo

#### Dashboard de GitHub

```
Repositorio → Insights → Dependency graph → Dependabot
```

Aquí verás:
- Alertas activas
- PRs abiertos por Dependabot
- Historial de vulnerabilidades

#### Actions Tab

```
Repositorio → Actions
```

Aquí verás:
- Workflows ejecutados
- Estado (success/failure)
- Logs detallados

#### Security Tab

```
Repositorio → Security → Security advisories
```

Aquí verás:
- Vulnerabilidades reportadas
- Estado de resolución
- Timeline

## 📊 Métricas y KPIs

### Métricas a Monitorear

| Métrica | Dónde | Objetivo |
|---------|-------|----------|
| **MTTF** (Mean Time To Fix) | Actions logs | < 24h para critical |
| **Auto-fix Success Rate** | Actions → Smart Security Fix | > 80% |
| **Auto-merge Success Rate** | Actions → Auto-Merge | > 90% |
| **Open Vulnerabilities** | Security tab | 0 critical, 0 high |
| **PR Review Time** | PRs con label security | < 48h |

### Cómo Calcular

```bash
# MTTF (Manual)
1. Ve a Security → Advisories
2. Para cada one resuelta: fecha resolución - fecha detección
3. Promedio

# Success Rate (Manual)
1. Ve a Actions → Workflow
2. Cuenta: Successful runs / Total runs
```

## ⚙️ Configuración Avanzada

### Ajustar Frecuencia de Dependabot

Edita `.github/dependabot.yml`:

```yaml
schedule:
  interval: "daily"  # Opciones: daily, weekly, monthly
  time: "02:00"      # Hora UTC
```

### Cambiar Criterios de Auto-Fix

Edita `.github/workflows/smart-security-fix.yml`:

```yaml
# Línea ~150 (job: analyze-vulnerabilities, step: decide)
# Cambiar lógica de:
if [ $CRITICAL -gt 0 ] || [ $HIGH -gt 0 ]; then
# Por ejemplo, solo critical:
if [ $CRITICAL -gt 0 ]; then
```

### Cambiar Método de Merge

Edita `.github/workflows/auto-merge.yml`:

```yaml
# Línea ~300 (job: auto-merge, step: Merge PR)
merge_method: 'squash'  # Opciones: merge, squash, rebase
```

### Deshabilitar Auto-Merge

Si quieres mantener auto-fix pero sin auto-merge:

```bash
# Opción 1: Deshabilitar workflow
1. Renombra auto-merge.yml a auto-merge.yml.disabled

# Opción 2: Agregar condición
# En auto-merge.yml, línea 1:
# Agregar comentario: # DISABLED
```

## 🚨 Troubleshooting

### Problema: Workflow no se ejecuta

**Diagnóstico:**
```bash
# 1. Verifica permisos en Settings → Actions
Settings → Actions → General → Workflow permissions
→ Debe ser: "Read and write permissions"

# 2. Verifica que workflows existen
ls -la .github/workflows/

# 3. Revisa sintaxis YAML
# Usa: https://www.yamllint.com/
```

### Problema: Auto-merge no funciona

**Diagnóstico:**
```bash
# 1. Verifica que PR tiene labels correctos
Labels requeridos: "automated" Y "security"

# 2. Verifica checks
Todos deben pasar (build, tests, lint)

# 3. Revisa logs
Actions → Auto-Merge → Click en run → Ver logs
```

### Problema: Tests fallan después de update

**Solución:**
```bash
# 1. Check locally
git checkout feature/security-fix-XXXXX
npm install
npm run build
npm test

# 2. Si fallan, investiga breaking changes
npm audit
npm view <paquete>@latest changelog

# 3. Fix manualmente
# Actualiza código para ser compatible
# Commitea y pushea

# 4. Los checks se re-ejecutarán automáticamente
```

## 📚 Referencias

- [Dependabot Documentation](https://docs.github.com/en/code-security/dependabot)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [GitHub Security Best Practices](https://docs.github.com/en/code-security)

## 🤝 Soporte

Si tienes problemas:

1. **Revisa logs** en Actions tab
2. **Consulta** esta guía
3. **Crea issue** con label "security" y "help-wanted"
4. **Contacta** a @samhermeli o @Harievilozanini

## 🔄 Mantenimiento del Sistema

### Mensual

- [ ] Revisar métricas de auto-fix success rate
- [ ] Verificar que no hay alertas pendientes
- [ ] Actualizar SECURITY.md si hay cambios

### Trimestral

- [ ] Revisar y ajustar criterios de auto-merge
- [ ] Evaluar si cambiar frecuencia de Dependabot
- [ ] Actualizar documentación

### Anual

- [ ] Revisar todo el sistema de seguridad
- [ ] Actualizar workflows a latest actions versions
- [ ] Benchmark vs otros proyectos

---

**💡 Recuerda**: Este sistema está diseñado para trabajar automáticamente. Solo intervén manualmente cuando recibas notificaciones de fallo.

**🎯 Objetivo**: Zero vulnerabilidades críticas/altas en producción.
