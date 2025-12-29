# 🎬 Gestionnaire de Films - Application Docker & Kubernetes

Une application web de gestion de films avec architecture microservices, containerisée avec Docker et orchestrée avec Kubernetes.

## 📋 Table des matières

- [Vue d'ensemble](#vue-densemble)
- [Architecture](#architecture)
- [Technologies](#technologies)
- [Structure du projet](#structure-du-projet)
- [Installation](#installation)
- [Configuration](#configuration)
- [Déploiement](#déploiement)
- [API](#api)

## 🎯 Vue d'ensemble

Cette application permet de gérer une base de données de films avec :

- **Frontend** : Interface utilisateur avec Nginx
- **Backend** : API REST avec Node.js/Express
- **Bases de données** : Support MySQL ou SQLite
- **Orchestration** : Déploiement Kubernetes avec ingress

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                        Ingress                           │
│                 (myapp.local:80)                         │
└────────────────┬─────────────────────┬──────────────────┘
                 │                     │
        ┌────────▼─────────┐  ┌──────▼────────────┐
        │                  │  │                   │
        │  Frontend Pod    │  │  Backend Pod      │
        │  (Nginx:80)      │  │  (Node:3000)      │
        │                  │  │                   │
        └────────┬─────────┘  └──────┬────────────┘
                 │                   │
        ┌────────▼─────────────┬─────▼────────────┐
        │  Frontend Service    │ Backend Service  │
        │  (LoadBalancer)      │ (ClusterIP)      │
        └──────────────────────┴──────┬───────────┘
                                      │
                            ┌─────────▼────────┐
                            │  MySQL Service   │
                            │  (Port 3306)     │
                            └──────────────────┘
```

## 🛠️ Technologies

### Frontend

- **Framework** : Nginx 1.17.10 (Alpine)
- **Dépendances** : Express.js, CORS

### Backend

- **Runtime** : Node.js 18 (Alpine)
- **Framework** : Express.js
- **ORM/Drivers** : MySQL2, SQLite3
- **Utilité** : dotenv, CORS, wait-port

### Base de données

- **Principal** : MySQL 8.0
- **Alternative** : SQLite3

### Orchestration

- **Conteneurisation** : Docker
- **Orchestration** : Kubernetes
- **Ingress** : Native Kubernetes Ingress

## 📁 Structure du projet

```
deploiement_gestionnaire_film_docker_kubernetes/
├── README.md
├── Movie_app/
│   ├── backend/
│   │   ├── Dockerfile                 # Image Docker backend
│   │   ├── package.json               # Dépendances Node.js
│   │   └── src/
│   │       ├── server.js              # Point d'entrée
│   │       ├── config/
│   │       │   ├── index.js           # Routeur BD
│   │       │   ├── mysql.js           # Config MySQL
│   │       │   └── sqlite.js          # Config SQLite
│   │       └── routes/
│   │           └── movies.js          # API routes
│   └── frontend/
│       ├── Dockerfile                 # Image Docker frontend
│       ├── nginx.conf                 # Config Nginx
│       ├── package.json               # Dépendances
│       └── static/
│           ├── index.html             # Page principale
│           ├── css/
│           │   └── style.css          # Styles
│           └── js/
│               └── main.js            # Logique cliente
└── Deploiements/
    ├── frontend-deployment.yaml       # Déploiement Frontend
    ├── node-deployment.yaml           # Déploiement Backend + Config
    ├── mysql-pod.yaml                 # Pod MySQL + Stockage
    ├── service-db.yaml                # Service MySQL
    ├── service-web.yaml               # Service Backend
    └── ingress.yaml                   # Ingress rules
```

## 🚀 Installation

### Prérequis

- Docker & Docker Compose
- Kubernetes (kubectl)
- Git

### Installation locale

1. **Cloner le repository**

```bash
git clone https://github.com/EvradeMarc/deploiement_gestionnaire_film_docker_kubernetes.git
cd deploiement_gestionnaire_film_docker_kubernetes
```

2. **Build des images Docker**

```bash
# Backend
cd Movie_app/backend
docker build -t movie-backend:latest .

# Frontend
cd ../frontend
docker build -t movie-frontend:latest .
```

3. **Démarrer avec Docker Compose**

```bash
docker-compose up -d
```

## ⚙️ Configuration

### Variables d'environnement

#### 📝 Fichier `.env` local

Le fichier `.env` est **ignoré par Git** (voir `.gitignore`). Créez-le localement :

```bash
# À la racine du répertoire backend
cd Movie_app/backend
cp .env.example .env
```

**Contenu du fichier `.env`** :

```env
# Backend Configuration
PORT=3000
NODE_ENV=development

# Database Configuration
DB_HOST=localhost
DB_NAME=moviedb
DB_USER=root
DB_PASSWORD=your_secure_password_here

# MySQL Configuration
MYSQL_DATABASE=moviedb
MYSQL_USER=heem
MYSQL_PASSWORD=your_secure_password_here
MYSQL_ROOT_PASSWORD=your_secure_password_here
```

#### 🔑 Détail des variables obligatoires

| Variable      | Description                             | Exemple                       |
| ------------- | --------------------------------------- | ----------------------------- |
| `PORT`        | Port d'écoute du backend                | `3000`                        |
| `NODE_ENV`    | Environnement                           | `development` ou `production` |
| `DB_HOST`     | Host MySQL (localhost ou mysql-service) | `localhost`                   |
| `DB_NAME`     | Nom de la base de données               | `moviedb`                     |
| `DB_USER`     | Utilisateur MySQL                       | `root`                        |
| `DB_PASSWORD` | Mot de passe MySQL                      | Votre mot de passe sécurisé   |

#### ⚠️ Sécurité des secrets

- ✅ Le fichier `.env` est dans `.gitignore` et **ne sera pas commité**
- ✅ Utilisez un fichier `.env.example` comme référence pour les développeurs
- ✅ En production, utilisez les **Kubernetes Secrets** (voir ci-dessous)
- ❌ Ne mettez **jamais** de vrais mots de passe dans le code source

#### ☸️ Kubernetes - ConfigMap & Secrets

**Backend ConfigMap (`node-deployment.yaml`)** :

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: node-config
data:
  DB_NAME: "moviedb"
  DB_USER: "root"
  DB_HOST: "mysql-service"
  PORT: "3000"
  NODE_ENV: "production"
```

**Backend Secret (`node-deployment.yaml`)** :

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: db-secret
type: Opaque
data:
  DB_PASSWORD: "RXZyYWRlQDE5MDQ=" # Base64: echo -n 'password' | base64
```

**MySQL Secret (`mysql-pod.yaml`)** :

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: mysql-secret
type: Opaque
data:
  MYSQL_PASSWORD: "RXZyYWRlQDE5MDQ="
  MYSQL_ROOT_PASSWORD: "RXZyYWRlQDE5MDQ="
```

#### 🔐 Encoder en Base64 pour Kubernetes

```bash
# Encoder
echo -n 'your_password' | base64
# Résultat: eW91cl9wYXNzd29yZA==

# Décoder (vérification)
echo 'eW91cl9wYXNzd29yZA==' | base64 -d
```

### Sélection de la base de données

Le backend choisit automatiquement entre MySQL et SQLite selon `config/index.js` :

- **Si** `DB_HOST` est défini → **MySQL**
- **Sinon** → **SQLite**

### Nginx Configuration

Fichier : `Movie_app/frontend/nginx.conf`

```nginx
upstream backend-service {
    server backend-service:3000;
}

server {
    listen 80;
    location / {
        root /usr/share/nginx/html;
        try_files $uri $uri/ =404;
    }
    location /api {
        proxy_pass http://backend-service;
    }
}
```

## ☸️ Déploiement Kubernetes

### 1. Créer le namespace (optionnel)

```bash
kubectl create namespace movies
```

### 2. Déployer les ressources

```bash
# Déployer MySQL
kubectl apply -f Deploiements/mysql-pod.yaml

# Déployer le Backend
kubectl apply -f Deploiements/node-deployment.yaml

# Déployer le Frontend
kubectl apply -f Deploiements/frontend-deployment.yaml

# Configurer l'Ingress
kubectl apply -f Deploiements/ingress.yaml
```

### 3. Vérifier le déploiement

```bash
# Vérifier les pods
kubectl get pods

# Vérifier les services
kubectl get services

# Vérifier l'ingress
kubectl get ingress

# Afficher les logs
kubectl logs -f deployment/node-deployment
kubectl logs -f deployment/frontend-deployment
```

### 4. Accéder à l'application

Ajouter dans `/etc/hosts` (ou `C:\Windows\System32\drivers\etc\hosts` sur Windows) :

```
127.0.0.1  myapp.local
```

Puis accéder à : `http://myapp.local`

## 📡 API

### Endpoint principal

```
GET/POST/PUT/DELETE /api/movies
```

Routes définies dans `Movie_app/backend/src/routes/movies.js`

### Configuration CORS

- **Origine** : Configurée via Express CORS middleware
- **Méthodes** : GET, POST, PUT, DELETE

## 🐳 Images Docker

Les images sont publiées sur Docker Hub sous le namespace `evrademarc` :

- `evrademarc/backend:latest` - API backend
- `evrademarc/frontend:latest` - Interface frontend

## 📊 Persistent Storage

MySQL utilise un `PersistentVolumeClaim` de 1Gi pour persister les données :

```yaml
accessModes:
  - ReadWriteOnce
resources:
  requests:
    storage: 1Gi
```

## 🔐 Sécurité

### 🛡️ Fichiers ignorés par Git

Le fichier `.gitignore` protège les informations sensibles :

```gitignore
# Environment variables
.env
.env.local
.env.*.local

# Dependencies
node_modules/
npm-debug.log
yarn-error.log

# IDE
.vscode/
.idea/
*.swp

# Logs & Temporary files
logs/
tmp/
*.log

# Database
*.db
*.sqlite
*.sqlite3
```

**Points importants** :

- ✅ `.env` n'est **jamais** commité
- ✅ Utiliser `.env.example` pour documenter les variables
- ✅ Chaque développeur maintient son propre `.env` local

### ⚠️ Avant production

- [ ] Utiliser des secrets Kubernetes pour les mots de passe
- [ ] Mettre à jour les credentials par défaut
- [ ] Activer HTTPS avec certificats
- [ ] Configurer les Network Policies
- [ ] Ajouter des limites de ressources (CPU/Memory)

## 📝 Scripts utiles

### Backend

```bash
# Développement (avec nodemon)
npm run dev

# Production
npm start
```

### Frontend

```bash
# Développement
npm run dev

# Production
npm start
```

---
