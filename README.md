# ⚡ TaskFlow V3

> Modern proje, iş ve efor takip sistemi — Linear'dan ilham alan, kurumsal düzeyde bir platform.

![.NET](https://img.shields.io/badge/.NET_9-512BD4?style=for-the-badge&logo=dotnet&logoColor=white)
![React](https://img.shields.io/badge/React_19-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)

---

## 🎯 Proje Hakkında

TaskFlow V3; hataların, rutin görevlerin ve müşteri taleplerinin uçtan uca yönetildiği, termin tarihlerine duyarlı bir proje yönetim platformudur. Clean Architecture, CQRS ve modern React altyapısı üzerine inşa edilmiştir.

---

## ✨ Özellikler

- 🗂️ **Kanban Board** — Sürükle-bırak ile iş durumu güncelleme
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
├── TaskFlow.Backend/
│   ├── TaskFlow.Core/           # Entity'ler, Enum'lar, Ortak tipler
│   ├── TaskFlow.Application/    # CQRS (MediatR), Use Cases, Interfaces
│   ├── TaskFlow.Infrastructure/ # EF Core, PostgreSQL, DbContext
│   └── TaskFlow.Api/            # Minimal API endpoints, JWT, Swagger
│
└── taskflow-ui/
    └── src/
        ├── components/          # Kanban, Modal, Login, CMD+K
        ├── contexts/            # AuthContext (JWT yönetimi)
        ├── hooks/               # TanStack Query hooks
        └── lib/                 # Axios client, TypeScript tipleri
```

---

## 🛠️ Teknoloji Yığını

### Backend
| Teknoloji | Kullanım |
|-----------|---------|
| .NET 9 | Runtime |
| Minimal API | API katmanı |
| Clean Architecture | Mimari desen |
| CQRS + MediatR | Komut/Sorgu ayrımı |
| Result Pattern | Hata yönetimi |
| PostgreSQL + Npgsql | Veritabanı |
| Entity Framework Core 9 | ORM |
| JWT Bearer | Kimlik doğrulama |
| Swagger / OpenAPI | API dokümantasyonu |

### Frontend
| Teknoloji | Kullanım |
|-----------|---------|
| Vite + React 19 | Çekirdek framework |
| TypeScript | Tip güvenliği |
| TanStack Query | Server state yönetimi |
| @dnd-kit | Sürükle-bırak |
| Axios | HTTP client + JWT interceptor |
| Tailwind CSS v3 | Stil sistemi |
| shadcn/ui | UI bileşenleri |

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
| `GET` | `/api/issues/{id}` | İş detayı |
| `POST` | `/api/issues/` | Yeni iş oluştur |
| `PATCH` | `/api/issues/{id}/status` | Durum güncelle |
| `POST` | `/api/issues/{id}/effort` | Efor kaydet |

### SubTasks / Comments / Attachments 🔐
| Method | Endpoint | Açıklama |
|--------|----------|----------|
| `POST` | `/api/subtasks/` | Alt görev ekle |
| `PATCH` | `/api/subtasks/{id}/toggle` | Tamamla / Geri al |
| `POST` | `/api/comments/` | Yorum ekle |
| `POST` | `/api/attachments/` | Dosya yükle |

> 🔐 JWT token gerektirir.

---

## 📁 CQRS Yapısı

```
TaskFlow.Application/Features/
├── Auth/
│   ├── Commands/ RegisterCommand.cs
│   └── Queries/  LoginQuery.cs
├── Issues/
│   ├── Commands/ CreateIssueCommand, UpdateIssueStatusCommand, LogEffortCommand
│   └── Queries/  GetIssuesQuery, GetIssueByIdQuery
├── SubTasks/Commands/  SubTaskCommands.cs
├── Comments/Commands/  CreateCommentCommand.cs
└── Attachments/Commands/ UploadAttachmentCommand.cs
```

---

## 🔒 Güvenlik

- Şifreler **SHA-256** ile hash'lenerek saklanır
- JWT token'lar **7 gün** geçerlidir
- Hassas yapılandırma dosyaları (`.Development.json`, `.Production.json`) Git'e eklenmez
- CORS yalnızca yetkili origin'lere izin verir

---

## 📄 Lisans

MIT © 2026 TaskFlow
