CREATE TABLE camere (
  id_camera    SERIAL PRIMARY KEY,
  nome_numero  VARCHAR(20)    NOT NULL,
  tipologia    VARCHAR(20)    NOT NULL CHECK (tipologia IN ('Singola','Doppia','Matrimoniale','Tripla','Suite')),
  capienza_max SMALLINT       NOT NULL,
  prezzo_base_notte DECIMAL(6,2) NOT NULL,
  descrizione  TEXT,
  servizi_inclusi TEXT,
  stato        VARCHAR(20)    NOT NULL DEFAULT 'Pulita' CHECK (stato IN ('Pulita','Da pulire','In manutenzione'))
);

CREATE TABLE ospiti (
  id_ospite         SERIAL PRIMARY KEY,
  nome              VARCHAR(50)  NOT NULL,
  cognome           VARCHAR(50)  NOT NULL,
  tipo_documento    VARCHAR(20)  NOT NULL CHECK (tipo_documento IN ('Carta d''Identità','Passaporto','Patente')),
  numero_documento  VARCHAR(20)  NOT NULL,
  nazionalita       VARCHAR(50)  NOT NULL,
  telefono          VARCHAR(20),
  email             VARCHAR(100),
  data_nascita      DATE,
  indirizzo         VARCHAR(200),
  note              TEXT,
  data_registrazione TIMESTAMP   NOT NULL DEFAULT NOW()
);

CREATE TABLE personale (
  id_dipendente   SERIAL PRIMARY KEY,
  nome            VARCHAR(50)    NOT NULL,
  cognome         VARCHAR(50)    NOT NULL,
  ruolo           VARCHAR(20)    NOT NULL CHECK (ruolo IN ('Reception','Housekeeping','Manager')),
  telefono        VARCHAR(20),
  email           VARCHAR(100),
  stipendio       DECIMAL(8,2)   NOT NULL,
  data_assunzione DATE           NOT NULL
);

CREATE TABLE servizi_extra (
  id_servizio    SERIAL PRIMARY KEY,
  nome_servizio  VARCHAR(50)  NOT NULL,
  descrizione    TEXT,
  costo          DECIMAL(6,2) NOT NULL,
  unita_misura   VARCHAR(20)  NOT NULL CHECK (unita_misura IN ('a notte','a persona','una tantum'))
);

CREATE TABLE prenotazioni (
  id_prenotazione  SERIAL PRIMARY KEY,
  id_ospite        INT          NOT NULL REFERENCES ospiti(id_ospite),
  id_camera        INT          NOT NULL REFERENCES camere(id_camera),
  data_checkin     DATE         NOT NULL,
  data_checkout    DATE         NOT NULL,
  numero_ospiti    SMALLINT     NOT NULL,
  stato            VARCHAR(30)  NOT NULL DEFAULT 'Confermata' CHECK (stato IN ('Confermata','Check-in effettuato','Check-out effettuato','Annullata','No-show')),
  canale           VARCHAR(20)  NOT NULL DEFAULT 'Diretto' CHECK (canale IN ('Diretto','Booking','Airbnb','Expedia','Altro')),
  note_prenotazione TEXT
);

CREATE TABLE dettagli_prenotazione (
  id_dettaglio     SERIAL PRIMARY KEY,
  id_prenotazione  INT          NOT NULL REFERENCES prenotazioni(id_prenotazione),
  id_servizio      INT          NOT NULL REFERENCES servizi_extra(id_servizio),
  quantita         INT          NOT NULL DEFAULT 1,
  prezzo_finale    DECIMAL(8,2) NOT NULL
);

CREATE TABLE cassa (
  id_transazione      SERIAL PRIMARY KEY,
  id_prenotazione     INT          NOT NULL REFERENCES prenotazioni(id_prenotazione),
  data_ora_pagamento  TIMESTAMP    NOT NULL DEFAULT NOW(),
  tipo                VARCHAR(20)  NOT NULL CHECK (tipo IN ('Caparra','Saldo','Rimborso')),
  importo             DECIMAL(8,2) NOT NULL,
  metodo_pagamento    VARCHAR(20)  NOT NULL CHECK (metodo_pagamento IN ('Contanti','Carta','Bonifico','PayPal'))
);
// aggiunti dopo
-- Tabella impostazioni generali
CREATE TABLE impostazioni (
  chiave VARCHAR(50) PRIMARY KEY,
  valore VARCHAR(200) NOT NULL
);

INSERT INTO impostazioni (chiave, valore)
VALUES ('tassa_soggiorno_per_notte', '2.00');

-- Aggiunta campi tassa di soggiorno a prenotazioni
ALTER TABLE prenotazioni
ADD COLUMN tassa_soggiorno DECIMAL(6,2) NOT NULL DEFAULT 0,
ADD COLUMN ospiti_esenti SMALLINT NOT NULL DEFAULT 0;