async function brevoSend({ to, subject, html }) {
  const senderEmail = process.env.BREVO_SENDER_EMAIL;
  const senderName = process.env.BREVO_SENDER_NAME || 'PraksaHub';

  const response = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      'api-key': process.env.BREVO_API_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      sender: { email: senderEmail, name: senderName },
      to: [{ email: to }],
      subject,
      htmlContent: html,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Brevo API greška: ${response.status} ${error}`);
  }
}

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

async function sendPasswordResetEmail(to, resetLink) {
  await brevoSend({
    to,
    subject: 'Obnavljanje lozinke',
    html: `
    <div style="
      margin:0;
      padding:40px 20px;
      background-color:#f4f7fb;
      font-family:Arial,sans-serif;
    ">
      <div style="
        max-width:600px;
        margin:0 auto;
        background:#ffffff;
        border-radius:18px;
        overflow:hidden;
        box-shadow:0 8px 24px rgba(0,0,0,0.08);
      ">

        <!-- HEADER -->
        <div style="
          background:linear-gradient(135deg,#071b4a,#0f52ba);
          padding:40px 32px;
          color:white;
        ">
          <h1 style="
            margin:0;
            font-size:34px;
            font-weight:700;
          ">
            PraksaHub
          </h1>

          <p style="
            margin-top:12px;
            font-size:16px;
            opacity:0.9;
          ">
            Platforma za studentske prakse
          </p>
        </div>

        <!-- BODY -->
        <div style="padding:40px 32px;">
          <h2 style="
            margin-top:0;
            color:#071b4a;
            font-size:28px;
          ">
            Obnavljanje lozinke
          </h2>

          <p style="
            color:#4b5563;
            font-size:15px;
            line-height:1.7;
          ">
            Primili smo zahtjev za promjenu lozinke vašeg korisničkog naloga.
            Kliknite na dugme ispod kako biste postavili novu lozinku.
          </p>

          <div style="
            text-align:center;
            margin:40px 0;
          ">
            <a
              href="${resetLink}"
              style="
                display:inline-block;
                padding:16px 32px;
                background:linear-gradient(90deg,#2563eb,#38bdf8);
                color:white;
                text-decoration:none;
                border-radius:12px;
                font-size:16px;
                font-weight:bold;
              "
            >
              Resetuj lozinku
            </a>
          </div>

          <p style="
            color:#6b7280;
            font-size:14px;
            line-height:1.6;
          ">
            Link za reset lozinke važi 1 sat.
            Ako niste vi poslali zahtjev, možete ignorisati ovaj email.
          </p>

          <div style="
            margin-top:32px;
            padding:16px;
            background:#f9fafb;
            border-radius:10px;
            word-break:break-all;
            font-size:12px;
            color:#6b7280;
          ">
            ${resetLink}
          </div>
        </div>

        <!-- FOOTER -->
        <div style="
          padding:24px;
          text-align:center;
          border-top:1px solid #e5e7eb;
          color:#9ca3af;
          font-size:12px;
        ">
          © 2026 PraksaHub. Sva prava zadržana.
        </div>
      </div>
    </div>
  `,
  });
}

async function sendEmailVerificationEmail(to, verificationLink) {
  await brevoSend({
    to,
    subject: 'Verifikacija email adrese',
    html: `
  <div style="
    margin:0;
    padding:40px 20px;
    background-color:#f4f7fb;
    font-family:Arial,sans-serif;
  ">
    <div style="
      max-width:600px;
      margin:0 auto;
      background:#ffffff;
      border-radius:18px;
      overflow:hidden;
      box-shadow:0 8px 24px rgba(0,0,0,0.08);
    ">

      <!-- HEADER -->
      <div style="
        background:linear-gradient(135deg,#071b4a,#0f52ba);
        padding:40px 32px;
        color:white;
      ">
        <h1 style="
          margin:0;
          font-size:34px;
          font-weight:700;
        ">
          PraksaHub
        </h1>

        <p style="
          margin-top:12px;
          font-size:16px;
          opacity:0.9;
        ">
          Platforma za studentske prakse
        </p>
      </div>

      <!-- BODY -->
      <div style="padding:40px 32px;">
        <h2 style="
          margin-top:0;
          color:#071b4a;
          font-size:28px;
        ">
          Potvrdite email adresu
        </h2>

        <p style="
          color:#4b5563;
          font-size:15px;
          line-height:1.7;
        ">
          Hvala vam na registraciji na platformu PraksaHub.
          Kako biste aktivirali vaš korisnički račun,
          potrebno je potvrditi email adresu.
        </p>

        <div style="
          text-align:center;
          margin:40px 0;
        ">
          <a
            href="${verificationLink}"
            style="
              display:inline-block;
              padding:16px 32px;
              background:linear-gradient(90deg,#2563eb,#38bdf8);
              color:white;
              text-decoration:none;
              border-radius:12px;
              font-size:16px;
              font-weight:bold;
            "
          >
            Potvrdi email adresu
          </a>
        </div>

        <p style="
          color:#6b7280;
          font-size:14px;
          line-height:1.6;
        ">
          Verifikacioni link važi 24 sata.
          Ako niste kreirali nalog na platformi PraksaHub,
          možete ignorisati ovaj email.
        </p>

        <div style="
          margin-top:32px;
          padding:16px;
          background:#f9fafb;
          border-radius:10px;
          word-break:break-all;
          font-size:12px;
          color:#6b7280;
        ">
          ${verificationLink}
        </div>
      </div>

      <!-- FOOTER -->
      <div style="
        padding:24px;
        text-align:center;
        border-top:1px solid #e5e7eb;
        color:#9ca3af;
        font-size:12px;
      ">
        © 2026 PraksaHub. Sva prava zadržana.
      </div>
    </div>
  </div>
`,
  });
}

async function sendAccountApprovedEmail(to, role) {
  await brevoSend({
    to,
    subject: 'Vaš račun je odobren',
    html: `
      <h2>Račun je odobren</h2>
      <p>Vaš korisnički račun je uspješno odobren.</p>
      <p>Dodijeljena rola: <strong>${role}</strong></p>
    `,
  });
}

async function sendAccountRejectedEmail(to, reason) {
  await brevoSend({
    to,
    subject: 'Vaš zahtjev je odbijen',
    html: `
      <h2>Zahtjev za odobrenje je odbijen</h2>
      <p>Nažalost, vaš korisnički račun nije odobren.</p>
      <p>Razlog odbijanja: <strong>${reason}</strong></p>
    `,
  });
}

async function sendStudentDeactivationToCompany(to, studentName, oglasNaziv) {
  await brevoSend({
    to,
    subject: 'Obavještenje: student deaktivirao nalog',
    html: `
    <div style="margin:0;padding:40px 20px;background-color:#f4f7fb;font-family:Arial,sans-serif;">
      <div style="max-width:600px;margin:0 auto;background:#ffffff;border-radius:18px;overflow:hidden;box-shadow:0 8px 24px rgba(0,0,0,0.08);">
        <div style="background:linear-gradient(135deg,#071b4a,#0f52ba);padding:40px 32px;color:white;">
          <h1 style="margin:0;font-size:34px;font-weight:700;">PraksaHub</h1>
          <p style="margin-top:12px;font-size:16px;opacity:0.9;">Platforma za studentske prakse</p>
        </div>
        <div style="padding:40px 32px;">
          <h2 style="margin-top:0;color:#071b4a;font-size:24px;">Obavještenje o povlačenju prijave</h2>
          <p style="color:#4b5563;font-size:15px;line-height:1.7;">
            Obavještavamo vas da je student <strong>${studentName}</strong> deaktivirao/la
            svoj nalog na platformi PraksaHub.
          </p>
          <p style="color:#4b5563;font-size:15px;line-height:1.7;">
            Student je imao/la aktivnu prijavu na vašu praksu: <strong>${oglasNaziv}</strong>.
            Prijava je automatski povučena.
          </p>
          <p style="color:#6b7280;font-size:14px;line-height:1.6;">
            Možete razmotriti ostale kandidate za navedenu poziciju.
          </p>
        </div>
        <div style="padding:24px;text-align:center;border-top:1px solid #e5e7eb;color:#9ca3af;font-size:12px;">
          © 2026 PraksaHub. Sva prava zadržana.
        </div>
      </div>
    </div>`,
  });
}

async function sendStudentDeactivationToKoordinator(to, studentName, oglasNaziv) {
  await brevoSend({
    to,
    subject: 'Obavještenje: student deaktivirao nalog',
    html: `
    <div style="margin:0;padding:40px 20px;background-color:#f4f7fb;font-family:Arial,sans-serif;">
      <div style="max-width:600px;margin:0 auto;background:#ffffff;border-radius:18px;overflow:hidden;box-shadow:0 8px 24px rgba(0,0,0,0.08);">
        <div style="background:linear-gradient(135deg,#071b4a,#0f52ba);padding:40px 32px;color:white;">
          <h1 style="margin:0;font-size:34px;font-weight:700;">PraksaHub</h1>
          <p style="margin-top:12px;font-size:16px;opacity:0.9;">Platforma za studentske prakse</p>
        </div>
        <div style="padding:40px 32px;">
          <h2 style="margin-top:0;color:#071b4a;font-size:24px;">Obavještenje o povlačenju prijave</h2>
          <p style="color:#4b5563;font-size:15px;line-height:1.7;">
            Obavještavamo vas da je student <strong>${studentName}</strong> deaktivirao/la
            svoj nalog na platformi PraksaHub.
          </p>
          <p style="color:#4b5563;font-size:15px;line-height:1.7;">
            Student je imao/la aktivnu prijavu na praksu: <strong>${oglasNaziv}</strong>,
            za čiji ste koordinator odgovorni. Prijava je automatski povučena.
          </p>
          <p style="color:#6b7280;font-size:14px;line-height:1.6;">
            Molimo uzmite ovo u obzir pri planiranju prakse.
          </p>
        </div>
        <div style="padding:24px;text-align:center;border-top:1px solid #e5e7eb;color:#9ca3af;font-size:12px;">
          © 2026 PraksaHub. Sva prava zadržana.
        </div>
      </div>
    </div>`,
  });
}

async function sendPrijavaPodnesenaEmail(to, oglasNaziv, kompanijaNaziv) {
  await brevoSend({
    to,
    subject: 'Prijava na praksu uspješno podnesena',
    html: `
    <div style="margin:0;padding:40px 20px;background-color:#f4f7fb;font-family:Arial,sans-serif;">
      <div style="max-width:600px;margin:0 auto;background:#ffffff;border-radius:18px;overflow:hidden;box-shadow:0 8px 24px rgba(0,0,0,0.08);">
        <div style="background:linear-gradient(135deg,#071b4a,#0f52ba);padding:40px 32px;color:white;">
          <h1 style="margin:0;font-size:34px;font-weight:700;">PraksaHub</h1>
          <p style="margin-top:12px;font-size:16px;opacity:0.9;">Platforma za studentske prakse</p>
        </div>
        <div style="padding:40px 32px;">
          <h2 style="margin-top:0;color:#071b4a;font-size:24px;">Prijava podnesena</h2>
          <p style="color:#4b5563;font-size:15px;line-height:1.7;">
            Vaša prijava na praksu <strong>${oglasNaziv}</strong> kod kompanije <strong>${kompanijaNaziv}</strong>
            je uspješno podnesena.
          </p>
          <p style="color:#4b5563;font-size:15px;line-height:1.7;">
            Koordinator će pregledati vašu prijavu i obavijestiti vas o odluci.
          </p>
        </div>
        <div style="padding:24px;text-align:center;border-top:1px solid #e5e7eb;color:#9ca3af;font-size:12px;">
          © 2026 PraksaHub. Sva prava zadržana.
        </div>
      </div>
    </div>`,
  });
}

async function sendPrijavaShortlistedEmail(to, oglasNaziv, kompanijaNaziv) {
  const safeOglasNaziv = escapeHtml(oglasNaziv);
  const safeKompanijaNaziv = escapeHtml(kompanijaNaziv);

  await brevoSend({
    to,
    subject: 'Promjena statusa prijave',
    html: `
    <div style="margin:0;padding:40px 20px;background-color:#f4f7fb;font-family:Arial,sans-serif;">
      <div style="max-width:600px;margin:0 auto;background:#ffffff;border-radius:18px;overflow:hidden;box-shadow:0 8px 24px rgba(0,0,0,0.08);">
        <div style="background:linear-gradient(135deg,#071b4a,#0f52ba);padding:40px 32px;color:white;">
          <h1 style="margin:0;font-size:34px;font-weight:700;">PraksaHub</h1>
          <p style="margin-top:12px;font-size:16px;opacity:0.9;">Platforma za studentske prakse</p>
        </div>
        <div style="padding:40px 32px;">
          <h2 style="margin-top:0;color:#071b4a;font-size:24px;">Promjena statusa prijave</h2>
          <p style="color:#4b5563;font-size:15px;line-height:1.7;">
            Vaša prijava na praksu <strong>${safeOglasNaziv}</strong> kod kompanije <strong>${safeKompanijaNaziv}</strong>
            je ažurirana.
          </p>
          <p style="color:#4b5563;font-size:15px;line-height:1.7;">
            Označeni ste za uži krug kandidata.
          </p>
        </div>
        <div style="padding:24px;text-align:center;border-top:1px solid #e5e7eb;color:#9ca3af;font-size:12px;">
          © 2026 PraksaHub. Sva prava zadržana.
        </div>
      </div>
    </div>`,
  });
}

async function sendPraksaZavrsenaStudentEmail(to, oglasNaziv, kompanijaNaziv, datumKraja) {
  const safeOglasNaziv = escapeHtml(oglasNaziv);
  const safeKompanijaNaziv = escapeHtml(kompanijaNaziv);
  const safeDatumKraja = escapeHtml(datumKraja);

  await brevoSend({
    to,
    subject: 'Praksa je završena',
    html: `
    <div style="margin:0;padding:40px 20px;background-color:#f4f7fb;font-family:Arial,sans-serif;">
      <div style="max-width:600px;margin:0 auto;background:#ffffff;border-radius:18px;overflow:hidden;box-shadow:0 8px 24px rgba(0,0,0,0.08);">
        <div style="background:linear-gradient(135deg,#071b4a,#0f52ba);padding:40px 32px;color:white;">
          <h1 style="margin:0;font-size:34px;font-weight:700;">PraksaHub</h1>
          <p style="margin-top:12px;font-size:16px;opacity:0.9;">Platforma za studentske prakse</p>
        </div>
        <div style="padding:40px 32px;">
          <h2 style="margin-top:0;color:#0e9e6e;font-size:24px;">Praksa je završena</h2>
          <p style="color:#4b5563;font-size:15px;line-height:1.7;">
            Vaša stručna praksa <strong>${safeOglasNaziv}</strong> kod kompanije
            <strong>${safeKompanijaNaziv}</strong> je uspješno završena dana <strong>${safeDatumKraja}</strong>.
          </p>
          <p style="color:#4b5563;font-size:15px;line-height:1.7;">
            Hvala vam na angažmanu tokom trajanja prakse. Detalje možete pregledati u svom profilu na platformi PraksaHub.
          </p>
        </div>
        <div style="padding:24px;text-align:center;border-top:1px solid #e5e7eb;color:#9ca3af;font-size:12px;">
          © 2026 PraksaHub. Sva prava zadržana.
        </div>
      </div>
    </div>`,
  });
}

async function sendPraksaZavrsenaCompanyEmail(to, studentName, oglasNaziv, datumKraja) {
  const safeStudentName = escapeHtml(studentName);
  const safeOglasNaziv = escapeHtml(oglasNaziv);
  const safeDatumKraja = escapeHtml(datumKraja);

  await brevoSend({
    to,
    subject: 'Obavještenje: praksa je završena',
    html: `
    <div style="margin:0;padding:40px 20px;background-color:#f4f7fb;font-family:Arial,sans-serif;">
      <div style="max-width:600px;margin:0 auto;background:#ffffff;border-radius:18px;overflow:hidden;box-shadow:0 8px 24px rgba(0,0,0,0.08);">
        <div style="background:linear-gradient(135deg,#071b4a,#0f52ba);padding:40px 32px;color:white;">
          <h1 style="margin:0;font-size:34px;font-weight:700;">PraksaHub</h1>
          <p style="margin-top:12px;font-size:16px;opacity:0.9;">Platforma za studentske prakse</p>
        </div>
        <div style="padding:40px 32px;">
          <h2 style="margin-top:0;color:#071b4a;font-size:24px;">Praksa je završena</h2>
          <p style="color:#4b5563;font-size:15px;line-height:1.7;">
            Obavještavamo vas da je stručna praksa studenta <strong>${safeStudentName}</strong>
            na poziciji <strong>${safeOglasNaziv}</strong> završena dana <strong>${safeDatumKraja}</strong>.
          </p>
          <p style="color:#6b7280;font-size:14px;line-height:1.6;">
            Detalje o završenoj praksi možete pregledati u svom profilu na platformi PraksaHub.
          </p>
        </div>
        <div style="padding:24px;text-align:center;border-top:1px solid #e5e7eb;color:#9ca3af;font-size:12px;">
          © 2026 PraksaHub. Sva prava zadržana.
        </div>
      </div>
    </div>`,
  });
}

async function sendPrijavaStatusEmail(to, oglasNaziv, kompanijaNaziv, status, razlog) {
  const finalApproved = status === 'ODOBRENA';
  const rejected = status === 'ODBIJENA_KOORDINATOR' || status === 'ODBIJENA_KOMPANIJA' || status === 'ODBIJENA';
  const statusTekst = status === 'CEKA_KOMPANIJU'
    ? 'proslijedjena kompaniji'
    : status === 'ODBIJENA_KOMPANIJA'
      ? 'odbijena od kompanije'
      : status === 'ODBIJENA_KOORDINATOR' || status === 'ODBIJENA'
        ? 'odbijena od koordinatora'
        : finalApproved
          ? 'odobrena'
          : 'azurirana';
  const boja = finalApproved ? '#0e9e6e' : rejected ? '#dc2626' : '#1a6fd4';

  await brevoSend({
    to,
    subject: `Prijava na praksu ${statusTekst}`,
    html: `
    <div style="margin:0;padding:40px 20px;background-color:#f4f7fb;font-family:Arial,sans-serif;">
      <div style="max-width:600px;margin:0 auto;background:#ffffff;border-radius:18px;overflow:hidden;box-shadow:0 8px 24px rgba(0,0,0,0.08);">
        <div style="background:linear-gradient(135deg,#071b4a,#0f52ba);padding:40px 32px;color:white;">
          <h1 style="margin:0;font-size:34px;font-weight:700;">PraksaHub</h1>
          <p style="margin-top:12px;font-size:16px;opacity:0.9;">Platforma za studentske prakse</p>
        </div>
        <div style="padding:40px 32px;">
          <h2 style="margin-top:0;color:${boja};font-size:24px;">Prijava ${statusTekst}</h2>
          <p style="color:#4b5563;font-size:15px;line-height:1.7;">
            Vaša prijava na praksu <strong>${oglasNaziv}</strong> kod kompanije <strong>${kompanijaNaziv}</strong>
            je <strong style="color:${boja};">${statusTekst}</strong>.
          </p>
          ${rejected && razlog ? `<p style="color:#4b5563;font-size:15px;line-height:1.7;">Razlog odbijanja: <strong>${razlog}</strong></p>` : ''}
          ${status === 'CEKA_KOMPANIJU' ? '<p style="color:#4b5563;font-size:15px;line-height:1.7;">Kompanija sada moze pregledati prijavu i donijeti odluku.</p>' : ''}
          ${finalApproved ? '<p style="color:#4b5563;font-size:15px;line-height:1.7;">Cestitamo! Vasa praksa je odobrena.</p>' : ''}
        </div>
        <div style="padding:24px;text-align:center;border-top:1px solid #e5e7eb;color:#9ca3af;font-size:12px;">
          © 2026 PraksaHub. Sva prava zadržana.
        </div>
      </div>
    </div>`,
  });
}

async function sendEvaluacijaStudentaEmail(to, studentIme, oglasNaziv, ukupnaOcjena) {
  const safeIme = escapeHtml(studentIme);
  const safeOglas = escapeHtml(oglasNaziv);

  await brevoSend({
    to,
    subject: 'Kompanija vas je evaluirala',
    html: `
    <div style="margin:0;padding:40px 20px;background-color:#f4f7fb;font-family:Arial,sans-serif;">
      <div style="max-width:600px;margin:0 auto;background:#ffffff;border-radius:18px;overflow:hidden;box-shadow:0 8px 24px rgba(0,0,0,0.08);">
        <div style="background:linear-gradient(135deg,#071b4a,#0f52ba);padding:40px 32px;color:white;">
          <h1 style="margin:0;font-size:34px;font-weight:700;">PraksaHub</h1>
          <p style="margin-top:12px;font-size:16px;opacity:0.9;">Platforma za studentske prakse</p>
        </div>
        <div style="padding:40px 32px;">
          <h2 style="margin-top:0;color:#071b4a;font-size:24px;">Nova evaluacija</h2>
          <p style="color:#4b5563;font-size:15px;line-height:1.7;">
            Poštovani/a <strong>${safeIme}</strong>,
          </p>
          <p style="color:#4b5563;font-size:15px;line-height:1.7;">
            Kompanija je popunila evaluaciju vašeg rada tokom prakse 
            <strong>${safeOglas}</strong>.
          </p>
          <div style="margin:32px 0;padding:20px;background:#f0f6ff;border-radius:12px;text-align:center;">
            <p style="margin:0 0 8px;color:#5a7a9a;font-size:14px;font-weight:600;">UKUPNA OCJENA</p>
            <p style="margin:0;font-size:48px;font-weight:800;color:#1a6fd4;">${ukupnaOcjena}<span style="font-size:24px;color:#9aabbc;">/5</span></p>
          </div>
          <p style="color:#6b7280;font-size:14px;line-height:1.6;">
            Prijavite se na platformu PraksaHub da vidite detalje evaluacije.
          </p>
        </div>
        <div style="padding:24px;text-align:center;border-top:1px solid #e5e7eb;color:#9ca3af;font-size:12px;">
          © 2026 PraksaHub. Sva prava zadržana.
        </div>
      </div>
    </div>`,
  });
}

async function sendOdustajanjeKompaniji(to, studentName, oglasNaziv) {
  const safeStudent = escapeHtml(studentName);
  const safeOglas = escapeHtml(oglasNaziv);

  await brevoSend({
    to,
    subject: 'Obavještenje: student odustao od prijave',
    html: `
    <div style="margin:0;padding:40px 20px;background-color:#f4f7fb;font-family:Arial,sans-serif;">
      <div style="max-width:600px;margin:0 auto;background:#ffffff;border-radius:18px;overflow:hidden;box-shadow:0 8px 24px rgba(0,0,0,0.08);">
        <div style="background:linear-gradient(135deg,#071b4a,#0f52ba);padding:40px 32px;color:white;">
          <h1 style="margin:0;font-size:34px;font-weight:700;">PraksaHub</h1>
          <p style="margin-top:12px;font-size:16px;opacity:0.9;">Platforma za studentske prakse</p>
        </div>
        <div style="padding:40px 32px;">
          <h2 style="margin-top:0;color:#dc2626;font-size:24px;">Student odustao od prijave</h2>
          <p style="color:#4b5563;font-size:15px;line-height:1.7;">
            Obavještavamo vas da je student <strong>${safeStudent}</strong> odustao/la
            od prijave na vašu praksu: <strong>${safeOglas}</strong>.
          </p>
          <p style="color:#6b7280;font-size:14px;line-height:1.6;">
            Možete razmotriti ostale kandidate za navedenu poziciju.
          </p>
        </div>
        <div style="padding:24px;text-align:center;border-top:1px solid #e5e7eb;color:#9ca3af;font-size:12px;">
          © 2026 PraksaHub. Sva prava zadržana.
        </div>
      </div>
    </div>`,
  });
}

async function sendOdustajanjeKoordinatoru(to, studentName, oglasNaziv) {
  const safeStudent = escapeHtml(studentName);
  const safeOglas = escapeHtml(oglasNaziv);

  await brevoSend({
    to,
    subject: 'Obavještenje: student odustao od prijave',
    html: `
    <div style="margin:0;padding:40px 20px;background-color:#f4f7fb;font-family:Arial,sans-serif;">
      <div style="max-width:600px;margin:0 auto;background:#ffffff;border-radius:18px;overflow:hidden;box-shadow:0 8px 24px rgba(0,0,0,0.08);">
        <div style="background:linear-gradient(135deg,#071b4a,#0f52ba);padding:40px 32px;color:white;">
          <h1 style="margin:0;font-size:34px;font-weight:700;">PraksaHub</h1>
          <p style="margin-top:12px;font-size:16px;opacity:0.9;">Platforma za studentske prakse</p>
        </div>
        <div style="padding:40px 32px;">
          <h2 style="margin-top:0;color:#dc2626;font-size:24px;">Student odustao od prijave</h2>
          <p style="color:#4b5563;font-size:15px;line-height:1.7;">
            Obavještavamo vas da je student <strong>${safeStudent}</strong> odustao/la
            od prijave na praksu: <strong>${safeOglas}</strong>, za čiji ste koordinator zaduženi.
          </p>
          <p style="color:#6b7280;font-size:14px;line-height:1.6;">
            Molimo uzmite ovo u obzir pri praćenju prijava.
          </p>
        </div>
        <div style="padding:24px;text-align:center;border-top:1px solid #e5e7eb;color:#9ca3af;font-size:12px;">
          © 2026 PraksaHub. Sva prava zadržana.
        </div>
      </div>
    </div>`,
  });
}

module.exports = {
  sendPasswordResetEmail,
  sendEmailVerificationEmail,
  sendAccountApprovedEmail,
  sendAccountRejectedEmail,
  sendStudentDeactivationToCompany,
  sendStudentDeactivationToKoordinator,
  sendPrijavaPodnesenaEmail,
  sendPrijavaShortlistedEmail,
  sendPrijavaStatusEmail,
  sendEvaluacijaStudentaEmail,
  sendPraksaZavrsenaStudentEmail,
  sendPraksaZavrsenaCompanyEmail,
  sendOdustajanjeKompaniji,
  sendOdustajanjeKoordinatoru,
};
