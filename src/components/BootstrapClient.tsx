"use client";
// Questo componente serve a caricare il JS di Bootstrap lato client,
// necessario per funzionalità come il menu a tendina
import { useEffect } from "react";

export default function BootstrapClient() {
  useEffect(() => {
    require("bootstrap/dist/js/bootstrap.bundle.min.js");
  }, []);

  return null;
}
