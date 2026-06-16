# 🏨 Gestionale B&B

Gestionale web per Bed & Breakfast sviluppato con **Next.js**, **React**, **TypeScript** e **PostgreSQL**.

🌐 Demo online: https://gestionale-b-b.vercel.app/

---

## ✨ Funzionalità

- Dashboard riepilogativa
- Gestione camere
- Gestione ospiti
- Gestione prenotazioni
- Check-in e check-out
- Gestione cassa
- Servizi extra
- Sistema sconti
- Gestione personale
- Report e statistiche
- Autenticazione utenti

---

## 🛠️ Tecnologie Utilizzate

### Frontend
- Next.js 16
- React 19
- TypeScript
- Bootstrap 5

### Backend
- Next.js Route Handlers
- REST API

### Database
- PostgreSQL
- pg

### Sicurezza
- bcryptjs
- JWT (jose)

### Utility
- xlsx

---

## 📂 Struttura del Progetto

```text
src/
├── app/
│   ├── api/
│   ├── dashboard/
│   ├── camere/
│   ├── ospiti/
│   ├── prenotazioni/
│   ├── cassa/
│   ├── personale/
│   └── report/
│
├── components/
├── lib/
└── middleware.ts
```

---

## 🗄️ Database

Tabelle principali:

- camere
- ospiti
- prenotazioni
- dettagli_prenotazione
- servizi_extra
- sconti
- cassa
- personale
- impostazioni
- tariffe_stagionali

---

## 🚀 Installazione

Clonare il repository:

```bash
git clone https://github.com/tuo-username/gestionale-bb.git
cd gestionale-bb
```

Installare le dipendenze:

```bash
npm install
```

Creare il file `.env.local`:

```env
DATABASE_URL=postgresql://utente:password@localhost:5432/gestionale_bb
JWT_SECRET=your_secret_key
```

Avviare il progetto:

```bash
npm run dev
```

---

## 🌍 Deploy

L'applicazione è distribuita su Vercel:

👉 https://gestionale-b-b.vercel.app/

---

## 🎯 Obiettivi

Questo progetto è stato sviluppato per simulare un gestionale reale per strutture ricettive e mettere in pratica:

- Sviluppo Full Stack
- TypeScript
- React e Next.js
- PostgreSQL
- REST API
- CRUD avanzate
- Autenticazione
- Progettazione database relazionali

---

## 👨‍💻 Autore

**Luca Vicari**

Progetto sviluppato come esercitazione Full Stack per la gestione completa di un Bed & Breakfast.
