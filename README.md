# 🇨🇱 Chilean Postal Codes API

**API gratuita, pública y sin llaves** para obtener códigos postales en Chile, utilizando scraping automatizado sobre la web oficial de Correos de Chile.

> 🛠️ Construido con ❤️ por [KaiNext](https://kainext.cl) – soluciones tecnológicas reales para problemas reales.

---

## ✨ ¿Qué hace esta API?

Correos de Chile tiene un formulario web para consultar códigos postales, pero no entrega APIs públicas para ello. Esta solución:

- ✅ Simula el formulario oficial mediante **Playwright**
- ✅ Realiza scraping seguro y eficiente solo si el dato no está en la base
- ✅ Almacena los resultados en una base de datos para futuras consultas instantáneas
- ✅ Expone endpoints REST públicos para **buscar códigos postales**, obtener **regiones** y **comunas**
- ✅ No requiere autenticación, API keys ni tokens

---

## 🌐 Producción

> 📡 Base URL pública:

```
https://postal-code-api.kainext.cl/v1/api
```

### 🔍 Buscar código postal

```
GET /v1/postal-codes/search
```

**Parámetros query:**

| Parámetro | Tipo   | Requerido | Descripción            |
| --------- | ------ | --------- | ---------------------- |
| commune   | string | ✅        | Nombre de la comuna    |
| street    | string | ✅        | Nombre de la calle     |
| number    | string | ✅        | Número de la dirección |

> 💡 Si el código no existe en la base, se hace scraping automáticamente y se guarda para la próxima vez.

---

### 📚 Obtener todas las regiones con sus comunas

```
GET /v1/regions/with-communes
```

---

### 📍 Obtener todas las comunas

```
GET /v1/communes/all
```

---

### 🌱 Seeders (Uso interno con contraseña)

| Endpoint                    | Descripción                |
| --------------------------- | -------------------------- |
| `POST /v1/seeders/regions`  | Pobla la tabla de regiones |
| `POST /v1/seeders/communes` | Pobla la tabla de comunas  |
| `POST /v1/seeders/all`      | Pobla regiones y comunas   |

> 🔐 Requiere una contraseña. Si logras adivinarla... hay premio 🎁

---

## 🚀 Instalación local

```bash
git clone https://github.com/kainext/correos-cl-postal-code-api.git
cd correos-cl-postal-code-api

# Configura tus variables de entorno
cp .env.example .env

# Instala dependencias
npm install

# Ejecuta en modo desarrollo
npm run start:dev
```

---

## 🧪 Scripts útiles

```bash
npm run seed:regions     # Inserta las regiones
npm run seed:communes    # Inserta todas las comunas
npm run start:dev        # Modo desarrollo
npm run build            # Compilación
npm run start:prod       # Ejecuta desde dist/
```

---

## 🧠 Tecnologías utilizadas

- **NestJS + Fastify** – API moderna en Node.js usando Fastify como adaptador, para mayor rendimiento que Express.
- **Playwright** – Automatización robusta para hacer scraping del formulario de Correos de Chile.
- **TypeORM** – ORM flexible para trabajar con PostgreSQL.
- **PostgreSQL** – Base de datos relacional para almacenar búsquedas exitosas y evitar scraping innecesario.
- **Swagger** – Documentación interactiva disponible en `/v1/api`.
- **Railway** – Plataforma utilizada para desplegar y mantener la API en producción.

---

## 🤝 Contribuciones

¡Este proyecto está abierto a mejoras, ideas y pull requests!

1. Haz un fork del repo
2. Crea una branch (`git checkout -b feature/nueva-idea`)
3. Realiza tus cambios
4. Envía un PR (pull request)

> 🙏 Por favor, mantén el código limpio, con buenas prácticas y comentarios donde sea necesario.

---

## ⚖️ Licencia

MIT © [KaiNext](https://kainext.cl) – puedes usarlo, mejorarlo y compartirlo libremente.

---

## ☕ Apóyame

Si esta API te sirvió o te ahorró tiempo, puedes agradecer:

- Compartiendo el proyecto 🙌
- Dándole estrella al repo ⭐
- Escribiéndome en [LinkedIn](https://www.linkedin.com/in/alejandroexequielhernandez/)

---

## 📫 Contacto

Este proyecto es mantenido por:

**Alejandro Exequiel Hernández Lara**

- Fundador y Arquitecto en [KaiNext](https://kainext.cl)
- 📧 contacto@kainext.cl
- 🌐 [postal-code-api.kainext.cl](https://postal-code-api.kainext.cl)
- 🏢 KaiNext Solutions Limitada – Santiago, Chile
