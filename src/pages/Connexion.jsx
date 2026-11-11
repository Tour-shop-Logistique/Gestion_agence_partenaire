import React from "react";
import AuthLayout from "../components/auth/AuthLayout";
import AuthPanel from "../components/auth/AuthPanel";

const Connexion = () => (
  <AuthLayout
    aside={
      <>
        <h1 className="text-3xl font-bold leading-tight mb-3 text-white">Bon retour parmi nous</h1>
        <p className="text-white/70 max-w-sm">
          Expéditions, colis, encaissements et agents : tout le pilotage de votre agence au même endroit.
        </p>
      </>
    }
  >
    <AuthPanel initialView="login" />
  </AuthLayout>
);

export default Connexion;
