# Security Policy

## 🔒 Seguridad en n8n-nodes-mercadopago

Tomamos muy en serio la seguridad de este proyecto. Este documento describe nuestras políticas y procedimientos de seguridad.

## 📋 Versiones Soportadas

Actualmente mantenemos las siguientes versiones con actualizaciones de seguridad:

| Versión | Soporte          | Estado           |
| ------- | ---------------- | ---------------- |
| 0.1.x   | ✅ Activo        | Actualizado      |
| < 0.1.0 | ❌ No soportado  | No actualizado   |

**Recomendación**: Siempre usa la última versión disponible en npm.

## 🚨 Reportar una Vulnerabilidad

### Si encuentras una vulnerabilidad de seguridad, por favor:

#### 1️⃣ **NO la reportes públicamente**
   - No abras un issue público
   - No publiques en redes sociales
   - No la compartas hasta que esté resuelta

#### 2️⃣ **Repórtala de forma privada**

**Método preferido**: GitHub Security Advisories
1. Ve a la pestaña ["Security"](../../security)
2. Click en "Report a vulnerability"
3. Completa el formulario con detalles

**Alternativa**: Email directo
- 📧 Email: developers@mercadopago.com
- 🏷️ Subject: `[SECURITY] n8n-nodes-mercadopago - [descripción breve]`

#### 3️⃣ **Incluye la siguiente información**

```markdown
**Tipo de vulnerabilidad:**
[XSS, Injection, Credential exposure, etc.]

**Componente afectado:**
[Qué parte del código está afectada]

**Versiones afectadas:**
[e.g., 0.1.0 - 0.1.1]

**Descripción:**
[Descripción detallada de la vulnerabilidad]

**Pasos para reproducir:**
1. ...
2. ...
3. ...

**Impacto:**
[¿Qué puede hacer un atacante con esto?]

**Severidad sugerida:**
[Critical / High / Medium / Low]

**Prueba de concepto (opcional):**
[Código o screenshots demostrando el issue]

**Solución sugerida (opcional):**
[Si tienes ideas de cómo arreglarlo]
```

### ⏱️ Tiempo de Respuesta

Nos comprometemos a:

| Severidad | Respuesta Inicial | Fix Target      |
|-----------|-------------------|-----------------|
| Critical  | 24 horas          | 48-72 horas     |
| High      | 48 horas          | 1 semana        |
| Medium    | 1 semana          | 2-4 semanas     |
| Low       | 2 semanas         | Próximo release |

### 🔄 Proceso de Resolución

1. **Reconocimiento** (24-48h)
   - Confirmamos recepción del reporte
   - Evaluamos la severidad
   - Asignamos responsable

2. **Investigación** (Depende de severidad)
   - Reproducimos el issue
   - Evaluamos el impacto
   - Desarrollamos fix

3. **Fix y Testing** (Depende de severidad)
   - Implementamos solución
   - Ejecutamos tests completos
   - Validamos que no rompe funcionalidad existente

4. **Release**
   - Publicamos versión parcheada
   - Notificamos a usuarios
   - Publicamos advisory público

5. **Divulgación Responsable**
   - Te damos crédito (si lo deseas)
   - Publicamos detalles (después del fix)
   - Actualizamos SECURITY.md

## 🛡️ Seguridad en el Desarrollo

### Automatización de Seguridad

Este proyecto utiliza múltiples capas de seguridad automatizada:

#### 1. **Dependabot**
- ✅ Monitoreo diario de dependencias
- ✅ Alertas automáticas de vulnerabilidades
- ✅ PRs automáticos para actualizaciones

#### 2. **Smart Security Fix Workflow**
- ✅ Análisis automático de severidad
- ✅ Auto-fix para vulnerabilidades críticas/altas
- ✅ Tests automáticos antes de merge
- ✅ Review manual para cambios moderados/bajos

#### 3. **Auto-Merge**
- ✅ Aprobación automática de fixes seguros
- ✅ Merge solo si todos los checks pasan
- ✅ Integración rápida de parches de seguridad

#### 4. **NPM Audit**
- ✅ Ejecutado en cada CI/CD run
- ✅ Falla el build si hay vulnerabilidades críticas

### Mejores Prácticas

**Al contribuir, por favor:**
- ✅ Ejecuta `npm audit` antes de hacer PR
- ✅ Nunca commitees credenciales o secrets
- ✅ Valida inputs de usuario
- ✅ Usa HTTPS para todas las APIs
- ✅ Sigue el principio de menor privilegio

## 🔐 Manejo de Credenciales

Este proyecto maneja credenciales de Mercado Pago. **IMPORTANTE:**

### ❌ NUNCA
- Commitees Access Tokens en el código
- Compartas credenciales de producción
- Uses credenciales en tests automáticos públicos
- Hardcodees tokens en ejemplos

### ✅ SIEMPRE
- Usa variables de entorno
- Documenta qué permisos necesita el token
- Instruye a usuarios a usar tokens con permisos mínimos
- Valida tokens antes de usarlos

## 📚 Recursos de Seguridad

### Documentación Relacionada
- [Mercado Pago Security Best Practices](https://www.mercadopago.com/developers/en/docs/security)
- [n8n Security Documentation](https://docs.n8n.io/hosting/security/)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)

### Contactos de Seguridad
- **Equipo de Seguridad MP**: security@mercadopago.com
- **Maintainers**: @samhermeli, @Harievilozanini

## 🏆 Hall of Fame

Agradecemos a quienes han contribuido a mejorar la seguridad de este proyecto:

<!--
Formato:
- **[Nombre o username]** - [Breve descripción] - [Fecha]
-->

_Ninguno aún - ¡Sé el primero!_

## 📄 Licencia

Este proyecto está bajo licencia MIT. Ver [LICENSE](LICENSE) para más detalles.

## 🔄 Actualizaciones de Este Documento

Este documento se revisa y actualiza regularmente. Última actualización: 2026-02-16

---

**🔒 Recuerda**: La seguridad es responsabilidad de todos. Si ves algo, di algo.

**🙏 Gracias** por ayudarnos a mantener este proyecto seguro para toda la comunidad.
