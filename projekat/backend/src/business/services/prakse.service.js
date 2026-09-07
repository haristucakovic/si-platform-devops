'use strict';

const { Op } = require('sequelize');
const {
  User,
  Student,
  Kompanija,
  Fakultet,
  Odsjek,
  Oglas,
  PrijavaNaPraksu,
  Praksa,
  Aktivnost,
  Ugovor,
  Izvjestaj,
  Evaluacija,
  Prisustvo,
  EvaluacijaStudenta,
} = require('../../infrastructure/database/models');
const { resolveCoordinatorProfile } = require('./coordinatorProfile.service');
const { createNotification, createNotificationForKoordinator } = require('./notifications.service');
const {
  getOrCreatePreferences,
  canSendInApp,
  canSendEmail,
} = require('./notificationPreferences.service');
const {
  sendPraksaZavrsenaStudentEmail,
  sendPraksaZavrsenaCompanyEmail,
} = require('./email.service');
const {
  APPLICATION_STATUS,
  COORDINATOR_STATUS,
  COMPANY_STATUS,
  STUDENT_STATUS,
} = require('./applicationStatus.service');

const PRACTICE_LIFECYCLE = {
  UPCOMING: 'NADOLAZECA',
  ACTIVE: 'AKTIVNA',
  FINISHED: 'ZAVRSENA',
  WITHDRAWN: 'ODUSTAO',
};

const FILTER_LIFECYCLE = {
  all: null,
  upcoming: PRACTICE_LIFECYCLE.UPCOMING,
  active: PRACTICE_LIFECYCLE.ACTIVE,
  finished: PRACTICE_LIFECYCLE.FINISHED,
  nadolazeca: PRACTICE_LIFECYCLE.UPCOMING,
  aktivna: PRACTICE_LIFECYCLE.ACTIVE,
  zavrsena: PRACTICE_LIFECYCLE.FINISHED,
};

const PRACTICE_COMPLETION_NOTIFICATION_TIP = 'PRAKSA_ZAVRSENA';

function makeError(message, status = 400) {
  const error = new Error(message);
  error.status = status;
  return error;
}

function formatUtcDate(year, month, day) {
  return [
    String(year).padStart(4, '0'),
    String(month).padStart(2, '0'),
    String(day).padStart(2, '0'),
  ].join('-');
}

function dateOnly(value) {
  if (!value) return null;
  if (value instanceof Date) {
    if (Number.isNaN(value.getTime())) return null;
    return formatUtcDate(value.getUTCFullYear(), value.getUTCMonth() + 1, value.getUTCDate());
  }

  const normalized = String(value).slice(0, 10);
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(normalized);
  if (!match) return null;
  const date = new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3])));
  if (
    date.getUTCFullYear() !== Number(match[1]) ||
    date.getUTCMonth() !== Number(match[2]) - 1 ||
    date.getUTCDate() !== Number(match[3])
  ) {
    return null;
  }
  return normalized;
}

function toUtcDate(dateValue) {
  const [year, month, day] = dateValue.split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, day));
}

function calculatePracticeDates(datumPocetka, trajanje) {
  if (!datumPocetka) {
    throw makeError('Datum početka prakse je obavezan.');
  }
  if (trajanje === null || trajanje === undefined || String(trajanje).trim() === '') {
    throw makeError('Trajanje prakse je obavezno.');
  }

  const start = dateOnly(datumPocetka);
  const months = Number(String(trajanje).trim());
  if (!start || !Number.isInteger(months) || months <= 0) {
    throw makeError('Nije moguće odrediti datum završetka prakse iz unesenog trajanja.');
  }

  const [startYear, startMonth, startDay] = start.split('-').map(Number);
  const targetFirst = new Date(Date.UTC(startYear, startMonth - 1 + months, 1));
  const targetYear = targetFirst.getUTCFullYear();
  const targetMonth = targetFirst.getUTCMonth() + 1;
  const targetLastDay = new Date(Date.UTC(targetYear, targetMonth, 0)).getUTCDate();

  let end;
  if (startDay > targetLastDay) {
    end = formatUtcDate(targetYear, targetMonth, targetLastDay);
  } else {
    const nextPeriodDate = new Date(Date.UTC(targetYear, targetMonth - 1, startDay));
    nextPeriodDate.setUTCDate(nextPeriodDate.getUTCDate() - 1);
    end = formatUtcDate(
      nextPeriodDate.getUTCFullYear(),
      nextPeriodDate.getUTCMonth() + 1,
      nextPeriodDate.getUTCDate()
    );
  }

  return {
    datumPocetka: start,
    datumKraja: end,
    datumPocetkaDate: toUtcDate(start),
    datumKrajaDate: toUtcDate(end),
  };
}

function todayDateOnly(now = new Date()) {
  const parts = new Intl.DateTimeFormat('en', {
    timeZone: 'Europe/Sarajevo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(now);
  const dateParts = Object.fromEntries(
    parts
      .filter(({ type }) => type !== 'literal')
      .map(({ type, value }) => [type, value])
  );
  return `${dateParts.year}-${dateParts.month}-${dateParts.day}`;
}

function practiceLifecycleStatus(praksa, today = todayDateOnly()) {
  if (praksa.datumOdustajanja) return PRACTICE_LIFECYCLE.WITHDRAWN;

  const start = dateOnly(praksa.datumPocetka);
  const end = dateOnly(praksa.datumKraja);
  if (!start || !end) return null;
  if (start > today) return PRACTICE_LIFECYCLE.UPCOMING;
  if (end < today) return PRACTICE_LIFECYCLE.FINISHED;
  return PRACTICE_LIFECYCLE.ACTIVE;
}

function normalizePracticeFilter(filter = 'all') {
  const normalized = String(filter || 'all').toLowerCase();
  if (!Object.prototype.hasOwnProperty.call(FILTER_LIFECYCLE, normalized)) {
    throw makeError('Neispravan filter praksi.');
  }
  return FILTER_LIFECYCLE[normalized];
}

async function ensurePracticeForApplication(prijava, oglas, { transaction } = {}) {
  let praksa = await Praksa.findOne({
    where: { prijavaID: prijava.id },
    transaction,
  });

  if (!praksa) {
    const period = calculatePracticeDates(oglas.datumPocetka, oglas.trajanje);
    praksa = await Praksa.create(
      {
        prijavaID: prijava.id,
        datumPocetka: period.datumPocetkaDate,
        datumKraja: period.datumKrajaDate,
        razlogOdustajanja: null,
        datumOdustajanja: null,
      },
      { transaction }
    );
  }

  return praksa;
}

function approvedAcceptedWhere() {
  return {
    status: APPLICATION_STATUS.APPROVED,
    koordinatorStatus: COORDINATOR_STATUS.APPROVED,
    kompanijaStatus: COMPANY_STATUS.APPROVED,
    studentStatus: STUDENT_STATUS.ACCEPTED,
  };
}

function mapPractice(praksa) {
  const prijava = praksa.PrijavaNaPraksu;
  const student = prijava?.Student;
  const studentUser = student?.User;
  const oglas = prijava?.Oglas || prijava?.Ogla;
  const kompanija = oglas?.Kompanija;

  return {
    id: praksa.id,
    prijavaID: praksa.prijavaID,
    lifecycleStatus: practiceLifecycleStatus(praksa),
    datumPocetka: dateOnly(praksa.datumPocetka),
    datumKraja: dateOnly(praksa.datumKraja),
    datumOdustajanja: dateOnly(praksa.datumOdustajanja),
    status: prijava?.status || null,
    koordinatorStatus: prijava?.koordinatorStatus || null,
    kompanijaStatus: prijava?.kompanijaStatus || null,
    studentStatus: prijava?.studentStatus || null,
    koordinatorID: prijava?.koordinatorID || null,
    oglas: oglas ? { id: oglas.id, naziv: oglas.naziv } : null,
    kompanija: kompanija ? { id: kompanija.id, naziv: kompanija.naziv } : null,
    student: student
      ? {
        id: student.id,
        ime: studentUser?.ime || null,
        prezime: studentUser?.prezime || null,
        index_number: student.index_number,
        odsjek: student.Odsjek?.naziv || null,
        fakultet: student.Fakultet?.naziv || null,
      }
      : null,
  };
}

function displayContractDate(value) {
  const date = dateOnly(value);
  if (!date) return '-';
  const [year, month, day] = date.split('-');
  return `${day}.${month}.${year}.`;
}

function contractNumber(ugovor, praksa) {
  return `UG-${ugovor.id || praksa.id}`;
}

function renderContract(praksa, ugovor) {
  const studentName = [praksa.student?.ime, praksa.student?.prezime].filter(Boolean).join(' ') || '-';
  const companyName = praksa.kompanija?.naziv || '-';
  const practiceName = praksa.oglas?.naziv || 'stručna praksa';

  return [
    'UGOVOR O OBAVLJANJU STRUČNE PRAKSE',
    '',
    `Broj ugovora: ${contractNumber(ugovor, praksa)}`,
    `Datum kreiranja: ${displayContractDate(ugovor.datumKreiranja)}`,
    '',
    '1. UGOVORNE STRANE',
    `Kompanija: ${companyName}`,
    `Student: ${studentName}`,
    `Broj indeksa: ${praksa.student?.index_number || '-'}`,
    '',
    '2. PREDMET UGOVORA',
    `Predmet ovog ugovora je obavljanje stručne prakse na poziciji "${practiceName}" kod kompanije ${companyName}.`,
    '',
    '3. TRAJANJE PRAKSE',
    `Praksa se obavlja u periodu od ${displayContractDate(praksa.datumPocetka)} do ${displayContractDate(praksa.datumKraja)}.`,
    '',
    '4. OBAVEZE KOMPANIJE',
    'Kompanija se obavezuje studentu omogućiti obavljanje dogovorene prakse, stručno usmjeravanje i uslove potrebne za rad.',
    '',
    '5. OBAVEZE STUDENTA',
    'Student se obavezuje uredno izvršavati zadatke prakse, poštovati pravila kompanije i odgovorno postupati s povjerenim informacijama.',
    '',
    '6. ZAVRŠNE ODREDBE',
    'Ovaj digitalno generisani ugovor dostupan je studentu i kompaniji putem sistema PraksaHub.',
    '',
    'Potpis studenta: ____________________',
    'Potpis ovlaštene osobe kompanije: ____________________',
  ].join('\n');
}

async function loadPractices({ practiceWhere = {}, studentWhere = {}, oglasWhere = {}, filter = 'all' }) {
  const lifecycleFilter = normalizePracticeFilter(filter);
  const rows = await Praksa.findAll({
    where: practiceWhere,
    include: [{
      model: PrijavaNaPraksu,
      required: true,
      where: approvedAcceptedWhere(),
      attributes: ['id', 'status', 'koordinatorID', 'koordinatorStatus', 'kompanijaStatus', 'studentStatus'],
      include: [
        {
          model: Student,
          required: true,
          where: studentWhere,
          attributes: ['id', 'index_number', 'fakultetID', 'odsjekID'],
          include: [
            { model: User, attributes: ['ime', 'prezime'] },
            { model: Fakultet, attributes: ['id', 'naziv'], required: false },
            { model: Odsjek, attributes: ['id', 'naziv'], required: false },
          ],
        },
        {
          model: Oglas,
          required: true,
          where: oglasWhere,
          attributes: ['id', 'naziv', 'kompanijaID'],
          include: [{ model: Kompanija, attributes: ['id', 'naziv'] }],
        },
      ],
    }],
    order: [['datumPocetka', 'DESC']],
  });

  const mapped = rows.map(mapPractice);
  return lifecycleFilter
    ? mapped.filter((praksa) => praksa.lifecycleStatus === lifecycleFilter)
    : mapped;
}

async function resolveStudent(userId) {
  const user = await User.findByPk(userId);
  if (!user || user.role !== 'STUDENT') {
    throw makeError('Nemate dozvolu za pristup ovom resursu.', 403);
  }
  const student = await Student.findOne({ where: { userID: user.id } });
  if (!student) throw makeError('Studentski profil nije pronađen.', 404);
  return student;
}

async function resolveCompany(userId) {
  const user = await User.findByPk(userId);
  if (!user || user.role !== 'COMPANY') {
    throw makeError('Nemate dozvolu za pristup ovom resursu.', 403);
  }
  const kompanija = await Kompanija.findOne({ where: { userID: user.id } });
  if (!kompanija) throw makeError('Profil kompanije nije pronađen.', 404);
  return kompanija;
}

async function getStudentPractices(userId, filter = 'all') {
  const student = await resolveStudent(userId);
  const prakse = await loadPractices({ studentWhere: { id: student.id }, filter });
  return { prakse };
}

async function getStudentPracticeById(userId, practiceId) {
  const student = await resolveStudent(userId);
  const prakse = await loadPractices({
    practiceWhere: { id: practiceId },
    studentWhere: { id: student.id },
    filter: 'all',
  });
  return prakse[0] || null;
}

async function getCompanyPractices(userId, filter = 'all') {
  const kompanija = await resolveCompany(userId);
  const prakse = await loadPractices({ oglasWhere: { kompanijaID: kompanija.id }, filter });
  return { prakse };
}

async function getCompanyPracticeById(userId, practiceId) {
  const kompanija = await resolveCompany(userId);
  const prakse = await loadPractices({
    practiceWhere: { id: practiceId },
    oglasWhere: { kompanijaID: kompanija.id },
    filter: 'all',
  });
  return prakse[0] || null;
}

async function getPracticeContract(userId, role, practiceId) {
  const parsedPracticeId = Number(practiceId);
  if (!Number.isInteger(parsedPracticeId) || parsedPracticeId <= 0) {
    throw makeError('Praksa nije pronađena.', 404);
  }

  let praksa;
  if (role === 'STUDENT') {
    praksa = await getStudentPracticeById(userId, parsedPracticeId);
  } else if (role === 'COMPANY') {
    praksa = await getCompanyPracticeById(userId, parsedPracticeId);
  } else {
    throw makeError('Nemate dozvolu za pristup ovom resursu.', 403);
  }

  if (!praksa) {
    throw makeError('Praksa nije pronađena.', 404);
  }

  let ugovor = await Ugovor.findOne({ where: { praksaID: praksa.id } });
  let created = false;
  if (!ugovor) {
    ugovor = await Ugovor.create({
      praksaID: praksa.id,
      status: 'KREIRAN',
      dokumentUrl: null,
    });
    created = true;
  }

  return {
    created,
    ugovor: {
      id: ugovor.id,
      praksaID: ugovor.praksaID,
      status: ugovor.status,
      datumKreiranja: dateOnly(ugovor.datumKreiranja),
      broj: contractNumber(ugovor, praksa),
    },
    sadrzaj: renderContract(praksa, ugovor),
  };
}

async function getCoordinatorPractices(userId, filter = 'all') {
  const koordinator = await resolveCoordinatorProfile(userId);
  if (!koordinator) throw new Error('KOORDINATOR_NOT_FOUND');
  const prakse = await loadPractices({ studentWhere: { fakultetID: koordinator.fakultetID }, filter });
  return { prakse };
}

async function getCoordinatorPracticeById(userId, practiceId) {
  const koordinator = await resolveCoordinatorProfile(userId);
  if (!koordinator) throw new Error('KOORDINATOR_NOT_FOUND');
  const prakse = await loadPractices({
    practiceWhere: { id: practiceId },
    studentWhere: { fakultetID: koordinator.fakultetID },
    filter: 'all',
  });
  return prakse[0] || null;
}

async function getCoordinatorPracticeSummary(userId) {
  const { prakse } = await getCoordinatorPractices(userId, 'all');
  return {
    aktivnePrakse: prakse.filter((praksa) => praksa.lifecycleStatus === PRACTICE_LIFECYCLE.ACTIVE).length,
    zavrsene: prakse.filter((praksa) => praksa.lifecycleStatus === PRACTICE_LIFECYCLE.FINISHED).length,
  };
}

async function backfillAcceptedPractices() {
  const acceptedApplications = await PrijavaNaPraksu.findAll({
    where: approvedAcceptedWhere(),
    include: [
      { model: Oglas, attributes: ['id', 'datumPocetka', 'trajanje'] },
      { model: Praksa, required: false, attributes: ['id', 'prijavaID'] },
    ],
  });

  for (const prijava of acceptedApplications) {
    if (prijava.Praksa) continue;
    try {
      await ensurePracticeForApplication(prijava, prijava.Oglas || prijava.Ogla);
    } catch (error) {
      console.warn(`[prakse] Preskočen backfill prijave ${prijava.id}: ${error.message}`);
    }
  }
}

async function notifyPracticeCompletion(praksa) {
  const prijava = praksa.PrijavaNaPraksu;
  const student = prijava?.Student;
  const studentUser = student?.User;
  const oglas = prijava?.Oglas || prijava?.Ogla;
  const kompanija = oglas?.Kompanija;
  const oglasNaziv = oglas?.naziv || 'praksu';
  const kompanijaNaziv = kompanija?.naziv || 'Kompanija';
  const studentName = [studentUser?.ime, studentUser?.prezime].filter(Boolean).join(' ') || 'Student';
  const datumKraja = displayContractDate(praksa.datumKraja);
  const naslov = 'Praksa je završena';
  const poruka = `Vaša praksa "${oglasNaziv}" kod kompanije ${kompanijaNaziv} je završena dana ${datumKraja}.`;

  const preferences = studentUser?.id ? await getOrCreatePreferences(studentUser.id) : null;

  if (student?.id && canSendInApp(preferences, PRACTICE_COMPLETION_NOTIFICATION_TIP)) {
    await createNotification(
      student.id,
      prijava.id,
      PRACTICE_COMPLETION_NOTIFICATION_TIP,
      naslov,
      poruka
    );
  }

  const emailPromises = [];

  if (studentUser?.email && canSendEmail(preferences, PRACTICE_COMPLETION_NOTIFICATION_TIP)) {
    emailPromises.push(
      sendPraksaZavrsenaStudentEmail(
        studentUser.email,
        oglasNaziv,
        kompanijaNaziv,
        datumKraja
      )
    );
  }

  const companyEmail = kompanija?.User?.email;
  if (companyEmail) {
    emailPromises.push(
      sendPraksaZavrsenaCompanyEmail(companyEmail, studentName, oglasNaziv, datumKraja)
    );
  }

  await Promise.all(emailPromises);
}

async function completeExpiredPractices(now = new Date()) {
  const today = todayDateOnly(now);
  const todayDate = toUtcDate(today);

  const rows = await Praksa.findAll({
    where: {
      datumOdustajanja: null,
      datumObavijestiZavrsetka: null,
      datumKraja: { [Op.lt]: todayDate },
    },
    include: [{
      model: PrijavaNaPraksu,
      required: true,
      where: approvedAcceptedWhere(),
      include: [
        {
          model: Student,
          required: true,
          include: [{ model: User, attributes: ['id', 'ime', 'prezime', 'email'] }],
        },
        {
          model: Oglas,
          required: true,
          attributes: ['id', 'naziv'],
          include: [{
            model: Kompanija,
            attributes: ['id', 'naziv'],
            include: [{ model: User, attributes: ['email'] }],
          }],
        },
      ],
    }],
  });

  let processed = 0;
  const errors = [];

  for (const praksa of rows) {
    if (practiceLifecycleStatus(praksa, today) !== PRACTICE_LIFECYCLE.FINISHED) {
      continue;
    }

    try {
      await notifyPracticeCompletion(praksa);
      await praksa.update({ datumObavijestiZavrsetka: new Date() });
      processed += 1;
    } catch (error) {
      errors.push({ praksaId: praksa.id, message: error.message });
      console.warn(`[prakse] Greška pri automatskom završetku prakse ${praksa.id}: ${error.message}`);
    }
  }

  return { processed, errors };
}

async function createActivity(userId, practiceId, opis) {
  const praksa = await getStudentPracticeById(userId, practiceId);

  if (!praksa) {
    throw makeError('Praksa nije pronađena.', 404);
  }

  if (praksa.lifecycleStatus !== PRACTICE_LIFECYCLE.ACTIVE) {
    throw makeError('Aktivnosti se mogu unositi samo tokom aktivne prakse.');
  }

  return Aktivnost.create({
    praksaID: practiceId,
    opis,
    datum: new Date(),
  });
}


async function getPracticeActivities(userId, role, practiceId) {
  let praksa = null;

  if (role === 'STUDENT') {
    praksa = await getStudentPracticeById(userId, practiceId);
  }

  if (role === 'COMPANY') {
    praksa = await getCompanyPracticeById(userId, practiceId);
  }

  if (role === 'COORDINATOR') {
    const { prakse } = await getCoordinatorPractices(userId);
    praksa = prakse.find(p => p.id === Number(practiceId));
  }

  if (!praksa) {
    throw makeError('Praksa nije pronađena.', 404);
  }

  return Aktivnost.findAll({
    where: {
      praksaID: practiceId,
    },
    order: [['datum', 'DESC']],
  });
}

async function resolvePracticeAccess(userId, role, practiceId) {
  const parsedPracticeId = Number(practiceId);
  if (!Number.isInteger(parsedPracticeId) || parsedPracticeId <= 0) {
    throw makeError('Praksa nije pronađena.', 404);
  }

  let praksa = null;

  if (role === 'STUDENT') {
    praksa = await getStudentPracticeById(userId, parsedPracticeId);
  }

  if (role === 'COMPANY') {
    praksa = await getCompanyPracticeById(userId, parsedPracticeId);
  }

  if (role === 'COORDINATOR') {
    const { prakse } = await getCoordinatorPractices(userId);
    praksa = prakse.find((item) => item.id === parsedPracticeId);
  }

  if (!praksa) {
    throw makeError('Praksa nije pronađena.', 404);
  }

  return praksa;
}

function normalizeAttendancePayload(data = {}) {
  const datum = dateOnly(data.datum);
  if (!datum) {
    throw makeError('Datum prisustva je obavezan.');
  }

  const status = typeof data.status === 'boolean'
    ? data.status
    : String(data.status).toLowerCase() !== 'false';

  let brojSati = null;
  if (data.brojSati !== null && data.brojSati !== undefined && String(data.brojSati).trim() !== '') {
    brojSati = Number(data.brojSati);
    if (!Number.isInteger(brojSati) || brojSati < 0 || brojSati > 24) {
      throw makeError('Broj sati mora biti cijeli broj od 0 do 24.');
    }
  }

  return {
    datum,
    status,
    brojSati,
    napomena: data.napomena ? String(data.napomena).trim() : null,
  };
}

async function getPracticeAttendance(userId, role, practiceId) {
  await resolvePracticeAccess(userId, role, practiceId);

  return Prisustvo.findAll({
    where: { praksaID: Number(practiceId) },
    order: [['datum', 'DESC']],
  });
}

async function upsertPracticeAttendance(userId, practiceId, data = {}) {
  const praksa = await resolvePracticeAccess(userId, 'COMPANY', practiceId);

  if (praksa.lifecycleStatus !== PRACTICE_LIFECYCLE.ACTIVE) {
    throw makeError('Prisustvo se može evidentirati samo tokom aktivne prakse.');
  }

  const payload = normalizeAttendancePayload(data);
  if (payload.datum < praksa.datumPocetka || payload.datum > praksa.datumKraja) {
    throw makeError('Datum prisustva mora biti unutar perioda prakse.');
  }

  const datum = toUtcDate(payload.datum);
  const [prisustvo, created] = await Prisustvo.findOrCreate({
    where: {
      praksaID: praksa.id,
      datum,
    },
    defaults: {
      praksaID: praksa.id,
      datum,
      status: payload.status,
      brojSati: payload.brojSati,
      napomena: payload.napomena,
    },
  });

  if (!created) {
    await prisustvo.update({
      status: payload.status,
      brojSati: payload.brojSati,
      napomena: payload.napomena,
    });
  }

  return { prisustvo, created };
}


async function generatePracticeReport(userId, practiceId, data = {}) {
  const praksa = await getCompanyPracticeById(userId, practiceId);

  if (!praksa) {
    throw makeError('Praksa nije pronađena.', 404);
  }

  const evalStudenta = await EvaluacijaStudenta.findOne({
    where: { prijavaID: praksa.prijavaID },
  });

  if (!evalStudenta) {
    throw makeError('Morate prvo evaluirati studenta prije generisanja izvještaja.');
  }

  const komentar = String(data.komentar || '').trim();
  if (!komentar) {
    throw makeError('Komentar je obavezan.');
  }

  const prisustva = await Prisustvo.findAll({
    where: { praksaID: praksa.id },
    order: [['datum', 'ASC']],
  });

  const ukupnoEvidentirano = prisustva.length;
  const prisutanDana = prisustva.filter((p) => p.status).length;
  const ukupnoSati = prisustva
    .filter((p) => p.status && p.brojSati)
    .reduce((sum, p) => sum + p.brojSati, 0);

  const studentName = [praksa.student?.ime, praksa.student?.prezime].filter(Boolean).join(' ') || '-';
  const companyName = praksa.kompanija?.naziv || '-';
  const practiceName = praksa.oglas?.naziv || 'Praksa';

  const sadrzajLinije = [
    'IZVJEŠTAJ O OBAVLJENOJ PRAKSI',
    '',
    `Student: ${studentName}`,
    `Broj indeksa: ${praksa.student?.index_number || '-'}`,
    `Kompanija: ${companyName}`,
    `Praksa: ${practiceName}`,
    `Period: ${displayContractDate(praksa.datumPocetka)} - ${displayContractDate(praksa.datumKraja)}`,
    '',
    'PRISUSTVO',
    `Evidentiranih dana: ${ukupnoEvidentirano}`,
    `Prisutnih dana: ${prisutanDana} / ${ukupnoEvidentirano}`,
  ];

  if (ukupnoSati > 0) {
    sadrzajLinije.push(`Ukupno sati: ${ukupnoSati}`);
  }

  sadrzajLinije.push(
    '',
    'EVALUACIJA STUDENTA',
    `Tehničke vještine: ${evalStudenta.tehnickeVjestine}/5`,
    `Komunikacija: ${evalStudenta.komunikacija}/5`,
    `Radna etika: ${evalStudenta.radnaEtika}/5`,
    `Inicijativa: ${evalStudenta.inicijativa}/5`,
    `Timski rad: ${evalStudenta.timskiRad}/5`,
    `Ukupna ocjena: ${evalStudenta.ukupnaOcjena}/5`,
  );

  if (evalStudenta.komentar) {
    sadrzajLinije.push(`Komentar evaluacije: ${evalStudenta.komentar}`);
  }

  sadrzajLinije.push(
    '',
    'KOMENTAR KOMPANIJE',
    komentar,
    '',
    `Datum generisanja: ${displayContractDate(new Date())}`,
    '',
    'Ovaj izvještaj služi kao potvrda o pohađanju studentske prakse.',
  );

  const sadrzaj = sadrzajLinije.join('\n');

  const prijava = await PrijavaNaPraksu.findOne({
    where: { id: praksa.prijavaID },
    attributes: ['koordinatorID'],
  });

  const [izvjestaj, created] = await Izvjestaj.findOrCreate({
    where: { praksaID: praksa.id },
    defaults: {
      praksaID: praksa.id,
      koordinatorID: prijava?.koordinatorID,
      sadrzaj,
      dokumentUrl: null,
      datumGenerisanja: new Date(),
    },
  });

  if (!created) {
    await izvjestaj.update({ sadrzaj, datumGenerisanja: new Date() });
  }

  try {
    const tip = created ? 'IZVJESTAJ' : 'IZVJESTAJ_AZURIRANO';
    const naslov = created ? 'Izvještaj o praksi je generisan' : 'Izvještaj o praksi je ažuriran';
    const poruka = created
      ? `Kompanija ${companyName} je generisala izvještaj za praksu: ${practiceName}.`
      : `Kompanija ${companyName} je ažurirala izvještaj za praksu: ${practiceName}.`;

    if (praksa.student?.id) {
      await createNotification(praksa.student.id, praksa.prijavaID, tip, naslov, poruka);
    }

    if (prijava?.koordinatorID) {
      await createNotificationForKoordinator(prijava.koordinatorID, praksa.prijavaID, tip, naslov, poruka);
    }
  } catch (notifErr) {
    console.error('Greška pri slanju notifikacije za izvještaj:', notifErr.message);
  }

  return {
    created,
    izvjestaj,
    evaluacijaStudenta: evalStudenta,
    prisustvo: { ukupnoEvidentirano, prisutanDana, ukupnoSati },
    sadrzaj,
  };
}


async function getPracticeReport(userId, role, practiceId) {
  let praksa = null;

  if (role === 'STUDENT') {
    praksa = await getStudentPracticeById(userId, practiceId);
  }

  if (role === 'COMPANY') {
    praksa = await getCompanyPracticeById(userId, practiceId);
  }

  if (role === 'COORDINATOR') {
    praksa = await getCoordinatorPracticeById(userId, practiceId);
  }

  if (!praksa) {
    throw makeError('Praksa nije pronađena.', 404);
  }

  const [izvjestaj, evaluacijaStudenta, prisustva] = await Promise.all([
    Izvjestaj.findOne({ where: { praksaID: Number(practiceId) } }),
    EvaluacijaStudenta.findOne({ where: { prijavaID: praksa.prijavaID } }),
    Prisustvo.findAll({ where: { praksaID: Number(practiceId) } }),
  ]);

  const ukupnoEvidentirano = prisustva.length;
  const prisutanDana = prisustva.filter((p) => p.status).length;
  const ukupnoSati = prisustva
    .filter((p) => p.status && p.brojSati)
    .reduce((sum, p) => sum + p.brojSati, 0);

  return {
    izvjestaj: izvjestaj || null,
    evaluacijaStudenta: evaluacijaStudenta || null,
    prisustvo: { ukupnoEvidentirano, prisutanDana, ukupnoSati },
    sadrzaj: izvjestaj?.sadrzaj || null,
  };
}

module.exports = {
  PRACTICE_LIFECYCLE,
  calculatePracticeDates,
  practiceLifecycleStatus,
  ensurePracticeForApplication,
  getStudentPractices,
  getStudentPracticeById,
  getCompanyPractices,
  getCompanyPracticeById,
  getPracticeContract,
  getCoordinatorPractices,
  getCoordinatorPracticeById,
  getCoordinatorPracticeSummary,
  backfillAcceptedPractices,
  completeExpiredPractices,
  createActivity,
  getPracticeActivities,
  getPracticeAttendance,
  upsertPracticeAttendance,
  generatePracticeReport,
  getPracticeReport,
};
