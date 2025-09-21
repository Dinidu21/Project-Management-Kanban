# 📌 Project Management Kanban

A **full-stack Kanban project management application** built with a modern tech stack.  
This repository combines both the **frontend (React + Vite + TypeScript + Tailwind)** and **backend (Spring Boot + Maven + ELK + Prometheus/Grafana)** into a single monorepo.


## Youtube [Link](https://youtu.be/ksZ4Z6YW-mA?si=p3334xg1S9GIE6zC)


## 🚀 Tech Stack

### Frontend
<p align= "center">
  <img src="https://skillicons.dev/icons?i=react,ts,tailwind,vite,npm" />
</p>

- **React + Vite** – Fast and modern frontend development  
- **TypeScript** – Type safety and better DX  
- **TailwindCSS + shadcn/ui** – Modern UI components & styling  
- **ESLint + Prettier** – Code quality and formatting  

### Backend
<p align= "center">
  <img src="https://skillicons.dev/icons?i=java,spring,maven,docker,prometheus,grafana,elasticsearch" />
  <img
       src="https://go-skill-icons.vercel.app/api/icons?i=kibana,"
    />
</p>

- **Spring Boot (Java)** – Backend REST API  
- **Maven** – Dependency management & build tool  
- **Spring Security + JWT + OAuth2** – Authentication & authorization  
- **PostgreSQL** – Database support  
- **Prometheus + Grafana** – Monitoring & observability  
- **ELK Stack (Elasticsearch + Logstash + Kibana)** – Centralized logging  

---

## 📂 Project Structure

```

.
├── frontend/   # React + Vite + Tailwind app
└── backend/    # Spring Boot application

````

---

## 🖼️ Screenshots

| Dashboard | Projects | Teams |
|-----------|----------|-------|
| ![Dashboard](/screenshots/dashboard.png) | ![Projects](./docs/screenshots/projects.png) | ![Teams](./docs/screenshots/teams.png) |

---

## ⚙️ Setup Instructions

### 🔧 Backend (Spring Boot)
```bash
cd backend

# Build & run
./mvnw spring-boot:run
````

Backend runs by default on **[http://localhost:8080](http://localhost:8080)**.

### 🎨 Frontend (React + Vite)

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

Frontend runs by default on **[http://localhost:5173](http://localhost:5173)**.

---

## 🛡️ Features

* ✅ User authentication (JWT + OAuth2 via Github ,Google)
* ✅ Create & manage projects, tasks, and teams
* ✅ Drag & drop Kanban board
* ✅ Real-time activity logging
* ✅ Metrics & monitoring with Prometheus/Grafana
* ✅ Centralized logging with ELK Stack **and more**

---

## 📊 Observability & Monitoring

* **Elastic APM Agent** integrated with backend for application performance monitoring
* **Logstash** pipeline for structured logging
* **Prometheus JMX Exporter** for JVM metrics
* **Grafana dashboards** for visualization

---

## 🤝 Contributing

1. Fork this repo
2. Create a feature branch (`git checkout -b feat/amazing-feature`)
3. Commit changes (`git commit -m 'feat: add amazing feature'`)
4. Push branch (`git push origin feat/amazing-feature`)
5. Create a Pull Request 🎉

---

## 📜 License

This project is licensed under the **MIT License**.
Feel free to use it for learning, experimenting, or building production-grade systems.

---
