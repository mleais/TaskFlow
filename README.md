# ⚡ TaskFlow V3

> Modern proje, iş ve efor takip sistemi — Linear'dan ilham alan, kurumsal düzeyde bir platform.

![.NET](https://img.shields.io/badge/.NET_9-512BD4?style=for-the-badge&logo=dotnet&logoColor=white)
![React](https://img.shields.io/badge/React_19-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)

---

## 🖼️ Özellikler

- 🗂️ **Kanban Board** — Sürükle-bırak ile iş durumu güncelleme (dnd-kit)
- ✅ **Alt Görevler** — Checklist ve ilerleme barı
- 💬 **Yorumlar** — `@mention` destekli ekip iletişimi
- 📎 **Dosya Ekleri** — Gerçek dosya yükleme ve indirme
- ⏱️ **Efor Takibi** — Tahmini ve harcanan süre karşılaştırması
- ⌨️ **CMD+K Menüsü** — Klavye navigasyonlu hızlı komut paleti
- 🔐 **JWT Auth** — Güvenli kayıt ve giriş sistemi
- 🌙 **Dark Mode** — Linear tarzı premium karanlık tema

---

## 🏗️ Mimari

```
TaskFlow/
├── TaskFlow.Backend/           # .NET 9 Minimal API
│   ├── TaskFlow.Core/          # Entity'ler, Enum'lar, Ortak tipler
│   ├── TaskFlow.Application/   # CQRS (MediatR), Use Cases, Interfaces
│   ├── TaskFlow.Infrastructure/# EF Core, PostgreSQL, DbContext
│   └── TaskFlow.Api/           # Minimal API endpoints, JWT, Swagger
│
├── taskflow-ui/                # Vite + React + TypeScript
│   └── src/
│       ├── components/         # Kanban, Modal, Login, CMD+K
│       ├── contexts/           # AuthContext (JWT yönetimi)
│       ├── hooks/              # TanStack Query hooks
│       └── lib/                # Axios client, TypeScript tipleri
│
├── render.yaml                 # Render.com IaC (DB + API + UI)
└── .gitignore
```

### Backend Teknolojileri
| Katman | Teknoloji |
|--------|-----------|
| Runtime | .NET 9 |
| API Stili | Minimal API |
| Mimari | Clean Architecture |
| Mesajlaşma | CQRS + MediatR |
| Hata Yönetimi | Result Pattern |
| Veritabanı | PostgreSQL (Npgsql) |
| ORM | Entity Framework Core 9 |
| Auth | JWT Bearer |
| Dokümantasyon | Swagger / OpenAPI |

### Frontend Teknolojileri
| Teknoloji | Kullanım |
|-----------|---------|
| Vite + React 19 | Çekirdek framework |
| TypeScript | Tip güvenliği |
| TanStack Query | Server state, cache |
| @dnd-kit | Sürükle-bırak Kanban |
| Axios | HTTP client + JWT interceptor |
| Tailwind CSS v3 | Stil sistemi |
| shadcn/ui | UI bileşenleri |
| lucide-react | İkonlar |

---

## 🚀 Yerel Geliştirme

### Gereksinimler
- [.NET 9 SDK](https://dotnet.microsoft.com/download)
- [Node.js 20+](https://nodejs.org)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/)

### 1. PostgreSQL'i Docker ile başlat
```bash
docker run --name taskflow-postgres \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=taskflow_v3 \
  -p 5432:5432 -d postgres:latest
```

### 2. `appsettings.Development.json` oluştur
`TaskFlow.Backend/TaskFlow.Api/` klasörüne aşağıdaki dosyayı ekle (Git'e gitmez):
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Database=taskflow_v3;Username=postgres;Password=postgres"
  },
  "Jwt": {
    "Key": "EN_AZ_32_KARAKTER_GIZLI_ANAHTAR_BURAYA"
  }
}
```

### 3. Veritabanını oluştur
```bash
cd TaskFlow.Backend
dotnet ef database update --project TaskFlow.Infrastructure --startup-project TaskFlow.Api
```

### 4. Backend'i başlat
```bash
dotnet run --project TaskFlow.Api
# API: https://localhost:7143
# Swagger: https://localhost:7143/swagger
```

### 5. Frontend'i başlat
```bash
cd taskflow-ui
npm install
npm run dev
# Uygulama: http://localhost:5173
```

---

## ☁️ Render.com'a Deploy

Proje kök dizinindeki `render.yaml` dosyası sayesinde tek tıkla deploy edilebilir:

1. [render.com](https://render.com) → **New → Blueprint**
2. Bu repoyu bağla
3. **Deploy** — Render otomatik olarak şunları kurar:
   - 🗄️ PostgreSQL veritabanı
   - ⚙️ .NET 9 API (Docker ile)
   - 🌐 React frontend (Static site)
   - 🔑 JWT Secret Key (otomatik üretilir)
   - 🔗 CORS ve bağlantı ayarları (otomatik yapılandırılır)

> **Not:** Şifre veya bağlantı bilgisi girmenize gerek yoktur. Render tüm environment variable'ları otomatik yönetir.

---

## 📡 API Endpoints

### Auth
| Method | Endpoint | Açıklama |
|--------|----------|----------|
| `POST` | `/api/auth/register` | Yeni kullanıcı kaydı |
| `POST` | `/api/auth/login` | Giriş → JWT token |

### Issues 🔐
| Method | Endpoint | Açıklama |
|--------|----------|----------|
| `GET` | `/api/issues/` | Tüm işleri listele |
| `GET` | `/api/issues/{id}` | İş detayı (SubTask, Comment, Attachment dahil) |
| `POST` | `/api/issues/` | Yeni iş oluştur |
| `PATCH` | `/api/issues/{id}/status` | Durum güncelle (Kanban) |
| `POST` | `/api/issues/{id}/effort` | Efor kaydet |

### SubTasks 🔐
| Method | Endpoint | Açıklama |
|--------|----------|----------|
| `POST` | `/api/subtasks/` | Alt görev ekle |
| `PATCH` | `/api/subtasks/{id}/toggle` | Tamamla / Geri al |

### Comments 🔐
| Method | Endpoint | Açıklama |
|--------|----------|----------|
| `POST` | `/api/comments/` | Yorum ekle |

### Attachments 🔐
| Method | Endpoint | Açıklama |
|--------|----------|----------|
| `POST` | `/api/attachments/` | Dosya yükle (multipart/form-data) |

> 🔐 işaretli endpoint'ler JWT token gerektirir.

---

## 📁 Proje Yapısı — CQRS Detayı

```
TaskFlow.Application/Features/
├── Auth/
│   ├── Commands/RegisterCommand.cs
│   └── Queries/LoginQuery.cs
├── Issues/
│   ├── Commands/
│   │   ├── CreateIssueCommand.cs
│   │   ├── UpdateIssueStatusCommand.cs
│   │   └── LogEffortCommand.cs
│   └── Queries/
│       ├── GetIssuesQuery.cs
│       └── GetIssueByIdQuery.cs
├── SubTasks/Commands/SubTaskCommands.cs
├── Comments/Commands/CreateCommentCommand.cs
└── Attachments/Commands/UploadAttachmentCommand.cs
```

---

## 🔒 Güvenlik

- Şifreler **SHA-256** ile hash'lenerek saklanır
- JWT token'lar **7 gün** geçerlidir
- `appsettings.Development.json` ve `appsettings.Production.json` Git'e **eklenmez**
- CORS yalnızca yetkili origin'lere izin verir
- Render'da JWT Secret Key **otomatik üretilir**, hiç görünmez

---

## 📄 Lisans

MIT © 2026 TaskFlow
