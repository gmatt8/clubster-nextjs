// apps/web-manager/app/verify-club/page.js

"use client";
import { useState, useEffect, useRef } from "react";
import { createBrowserSupabase } from "@lib/supabase-browser";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function VerifyClubPage() {
  const router = useRouter();
  const supabase = createBrowserSupabase();

  // Campi del form
  const [clubName, setClubName] = useState("");
  const [address, setAddress] = useState("");
  const [lat, setLat] = useState(null);
  const [lng, setLng] = useState(null);
  const [phoneNumber, setPhoneNumber] = useState("");

  // Dati documento
  const [docUrl, setDocUrl] = useState("");
  const [docName, setDocName] = useState("");     // nome file visualizzato
  const [docFilePath, setDocFilePath] = useState(""); // path su Storage (per rimozione)

  // Checkboxes (4 in totale)
  const [confirmLocalLegal, setConfirmLocalLegal] = useState(false); // 1
  const [confirmLicenses, setConfirmLicenses] = useState(false);     // 2
  const [confirmSafety, setConfirmSafety] = useState(false);         // 3
  const [confirmTerms, setConfirmTerms] = useState(false);           // 4

  // Errori e stato di caricamento
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploadingDoc, setUploadingDoc] = useState(false);

  // ID manager loggato
  const [managerId, setManagerId] = useState(null);

  // Ref per l'input address
  const addressInputRef = useRef(null);
  // Ref per input file nascosto
  const fileInputRef = useRef(null);

  // Recupero utente loggato
  useEffect(() => {
    async function getUser() {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      if (userError) {
        setError("Errore nel recupero utente");
      } else if (user) {
        setManagerId(user.id);
      }
    }
    getUser();
  }, [supabase]);

  // Inizializza Autocomplete di Google Maps
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!window.google || !window.google.maps || !window.google.maps.places) {
      console.warn("Google Maps JS non è ancora caricato");
      return;
    }

    const autocomplete = new window.google.maps.places.Autocomplete(
      addressInputRef.current,
      {
        types: ["geocode"],
      }
    );

    autocomplete.addListener("place_changed", () => {
      const place = autocomplete.getPlace();
      if (!place.geometry) return;

      const latVal = place.geometry.location.lat();
      const lngVal = place.geometry.location.lng();
      setLat(latVal);
      setLng(lngVal);

      const formattedAddress = place.formatted_address || "";
      setAddress(formattedAddress);
    });
  }, []);

  // Verifica se il form è compilato
  const isFormValid = () => {
    return (
      clubName.trim() !== "" &&
      address.trim() !== "" &&
      phoneNumber.trim() !== "" &&
      docUrl.trim() !== "" &&
      confirmLocalLegal &&
      confirmLicenses &&
      confirmSafety &&
      confirmTerms
    );
  };

  // Gestione caricamento file su Supabase Storage
  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!managerId) {
      setError("Impossibile caricare il file: manca l'ID del manager.");
      return;
    }

    setError("");
    setUploadingDoc(true);

    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${managerId}.${fileExt}`;
      const filePath = `${managerId}/${fileName}`;

      // 1. Carica il file nel bucket "club-verify"
      const { error: uploadError } = await supabase.storage
        .from("club-verify")
        .upload(filePath, file, { upsert: true }); 
      // "upsert: true" sovrascrive se esiste già

      if (uploadError) {
        setError(uploadError.message);
        setUploadingDoc(false);
        return;
      }

      // 2. Ottieni URL pubblico
      const { data: publicData } = supabase.storage
        .from("club-verify")
        .getPublicUrl(filePath);

      if (publicData?.publicUrl) {
        setDocUrl(publicData.publicUrl);
        setDocName(file.name);
        setDocFilePath(filePath);
      } else {
        setError("Impossibile ottenere l'URL pubblico del file");
      }
    } catch (err) {
      console.error("Errore caricamento file:", err);
      setError("Errore generico nel caricamento del file");
    } finally {
      setUploadingDoc(false);
    }
  };

  // Rimuove il file dal bucket (opzionale) e resetta lo stato
  const handleRemoveDoc = async () => {
    if (!docFilePath) {
      // Se non abbiamo il path, rimuoviamo solo dallo stato
      setDocUrl("");
      setDocName("");
      setDocFilePath("");
      return;
    }

    try {
      // Cancella dal bucket
      const { error: removeError } = await supabase.storage
        .from("club-verify")
        .remove([docFilePath]);

      if (removeError) {
        // Se c'è un errore in rimozione, lo mostriamo
        setError(removeError.message);
      } else {
        // Reset state
        setDocUrl("");
        setDocName("");
        setDocFilePath("");
      }
    } catch (err) {
      setError("Errore durante la rimozione del file");
      console.error(err);
    }
  };

  // Invio form
  async function handleSubmit(e) {
    e.preventDefault();

    if (!managerId) {
      setError("Impossibile recuperare l'ID del manager");
      return;
    }

    setLoading(true);
    setError("");

    // Invio i dati all'endpoint /api/club (POST)
    const response = await fetch("/api/club", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        manager_id: managerId,
        name: clubName,
        address,
        phone_number: phoneNumber,
        doc_url: docUrl,
        lat,
        lng,
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      setError(result.error || "Errore sconosciuto durante la creazione del club");
      setLoading(false);
      return;
    }

    setLoading(false);
    router.push("/dashboard");
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#CBD0F5", // Sfondo lilla/viola chiaro
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "2rem",
      }}
    >
      {/* Logo in alto */}
      <div style={{ marginBottom: "1rem" }}>
        <Image
          src="/images/clubster-manager-logo.png"
          alt="clubster manager logo"
          width={200}
          height={60}
          priority
        />
      </div>

      {/* Box bianco centrale */}
      <div
        style={{
          backgroundColor: "#fff",
          borderRadius: "8px",
          maxWidth: "900px",
          width: "100%",
          padding: "2rem 2rem 3rem 2rem",
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
        }}
      >
        {/* Titolo sezione */}
        <h2
          style={{
            marginTop: 0,
            marginBottom: "1.5rem",
            textAlign: "left",
            fontWeight: "bold",
          }}
        >
          Club’s details
        </h2>

        <form onSubmit={handleSubmit}>
          {/* Riga a 2 colonne: Club Name - Address */}
          <div
            style={{
              display: "flex",
              gap: "1rem",
              marginBottom: "1rem",
            }}
          >
            {/* Club Name */}
            <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
              <label style={{ marginBottom: "0.3rem" }}>
                Club Name <span style={{ color: "red" }}>*</span>
              </label>
              <input
                type="text"
                value={clubName}
                onChange={(e) => setClubName(e.target.value)}
                style={{
                  padding: "0.5rem",
                  borderRadius: "4px",
                  border: "1px solid #ccc",
                }}
                required
              />
            </div>

            {/* Address */}
            <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
              <label style={{ marginBottom: "0.3rem" }}>
                Address <span style={{ color: "red" }}>*</span>
              </label>
              <input
                ref={addressInputRef}
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                style={{
                  padding: "0.5rem",
                  borderRadius: "4px",
                  border: "1px solid #ccc",
                }}
                required
              />
            </div>
          </div>

          {/* Phone number */}
          <div style={{ display: "flex", flexDirection: "column", marginBottom: "1rem" }}>
            <label style={{ marginBottom: "0.3rem" }}>
              Phone number <span style={{ color: "red" }}>*</span>
            </label>
            <input
              type="text"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              style={{
                padding: "0.5rem",
                borderRadius: "4px",
                border: "1px solid #ccc",
              }}
              required
            />
          </div>

          {/* Titolo per Upload Document */}
          <h3
            style={{
              margin: "2rem 0 0.5rem 0",
              textAlign: "left",
              fontWeight: "bold",
            }}
          >
            Club Ownership Verification
          </h3>
          <p
            style={{
              margin: "0 auto 1.5rem auto",
              fontSize: "0.9rem",
              color: "#555",
              maxWidth: "400px",
            }}
          >
            Upload one of the following:
            <br />
            - Business Registration Certificate
            <br />
            - Utility Bill &amp; Lease Agreement
            <br />
            - Official Club License
          </p>

          {/* Se non c'è un docUrl, mostriamo il pulsante Upload */}
          {!docUrl && (
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                marginBottom: "2rem",
              }}
            >
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: "#f5f5f5",
                  border: "1px dashed #007bff",
                  color: "#007bff",
                  padding: "1rem 2rem",
                  borderRadius: "8px",
                  cursor: "pointer",
                }}
              >
                {uploadingDoc ? "Uploading..." : "Upload Document"}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="application/pdf,image/*"
                style={{ display: "none" }}
                onChange={handleFileChange}
              />
            </div>
          )}

          {/* Se c'è un docUrl, mostriamo il nome file + X per rimuoverlo */}
          {docUrl && (
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                marginBottom: "2rem",
                alignItems: "center",
                gap: "1rem",
              }}
            >
              <p style={{ margin: 0, color: "green" }}>
                <strong>File:</strong> {docName}
              </p>
              <button
                type="button"
                onClick={handleRemoveDoc}
                style={{
                  backgroundColor: "#ff5c5c",
                  color: "#fff",
                  border: "none",
                  borderRadius: "4px",
                  padding: "0.5rem 1rem",
                  cursor: "pointer",
                }}
              >
                X
              </button>
            </div>
          )}

          {/* Titolo per Checkboxes */}
          <h3
            style={{
              margin: "2rem 0 1rem 0",
              textAlign: "left",
              fontWeight: "bold",
            }}
          >
            Licenses and Authorizations
          </h3>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "0.5rem",
              marginBottom: "1.5rem",
            }}
          >
            <label style={{ display: "flex", alignItems: "center" }}>
              <input
                type="checkbox"
                checked={confirmLocalLegal}
                onChange={(e) => setConfirmLocalLegal(e.target.checked)}
                style={{ marginRight: "0.5rem" }}
              />
              I confirm that the club complies with all local legal and licensing
              requirements
            </label>

            <label style={{ display: "flex", alignItems: "center" }}>
              <input
                type="checkbox"
                checked={confirmLicenses}
                onChange={(e) => setConfirmLicenses(e.target.checked)}
                style={{ marginRight: "0.5rem" }}
              />
              I confirm that the club holds all necessary operational licenses
            </label>

            <label style={{ display: "flex", alignItems: "center" }}>
              <input
                type="checkbox"
                checked={confirmSafety}
                onChange={(e) => setConfirmSafety(e.target.checked)}
                style={{ marginRight: "0.5rem" }}
              />
              I confirm that the club meets all building and safety standards
            </label>

            <label style={{ display: "flex", alignItems: "center" }}>
              <input
                type="checkbox"
                checked={confirmTerms}
                onChange={(e) => setConfirmTerms(e.target.checked)}
                style={{ marginRight: "0.5rem" }}
              />
              I have read and accept the Terms &amp; Conditions and Privacy Policy
            </label>
          </div>

          {/* Messaggio d'errore */}
          {error && (
            <p style={{ color: "red", marginBottom: "1rem", textAlign: "center" }}>
              {error}
            </p>
          )}

          {/* Pulsante Next */}
          <div style={{ textAlign: "center" }}>
            <button
              type="submit"
              disabled={!isFormValid() || loading || uploadingDoc}
              style={{
                padding: "0.75rem 2rem",
                backgroundColor: "#007bff",
                color: "#fff",
                border: "none",
                borderRadius: "4px",
                cursor:
                  isFormValid() && !loading && !uploadingDoc
                    ? "pointer"
                    : "not-allowed",
              }}
            >
              {loading ? "Saving..." : "Next"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
