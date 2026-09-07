'use strict';

const { Op } = require('sequelize');
const {
  sequelize,
  User,
  Student,
  Oglas,
  PrijavaNaPraksu,
  Praksa,
  Kompanija,
  Dokument,
  Odsjek,
  Fakultet,
  Koordinator,
} = require('../../infrastructure/database/models');
const {
  createNotification,
  createNotificationForKompanija,
  createNotificationForKoordinator,
} = require('./notifications.service');
const {
  sendPrijavaPodnesenaEmail,
  sendPrijavaShortlistedEmail,
  sendPrijavaStatusEmail,
  sendOdustajanjeKompaniji,
  sendOdustajanjeKoordinatoru,
} = require('./email.service');
const {
  getOrCreatePreferences,
  canSendInApp,
  canSendEmail,
} = require('./notificationPreferences.service');
const { checkStudentApplicationLimit } = require('./application_limit.service');
const {
  APPLICATION_STATUS,
  COORDINATOR_STATUS,
  COMPANY_STATUS,
  STUDENT_STATUS,
  canCompanyAct,
  canCompanyShortlist,
  isCoordinatorApproved,
  normalizeStatusFilter,
} = require('./applicationStatus.service');
const {
  calculatePracticeDates,
  ensurePracticeForApplication,
  getStudentPracticeById,
} = require('./prakse.service');

function makeError(message, status) {
  const err = new Error(message);
  err.status = status;
  return err;
}

function hasValue(value) {
  if (value === null || value === undefined) return false;
  return String(value).trim().length > 0;
}

function isStudentProfileComplete(user, student) {
  return (
    hasValue(user.ime) &&
    hasValue(user.prezime) &&
    hasValue(user.email) &&
    hasValue(student.index_number) &&
    Number.isInteger(Number(student.year_of_study)) &&
    Number(student.year_of_study) > 0 &&
    hasValue(student.fakultetID)
  );
}

async function resolveCompanyFromUser(userId) {
  const user = await User.findByPk(userId);
  if (!user || user.role !== 'COMPANY') {
    throw makeError('Samo kompanije mogu upravljati kandidatima.', 403);
  }

  const kompanija = await Kompanija.findOne({ where: { userID: user.id } });
  if (!kompanija) {
    throw makeError('Profil kompanije nije pronadjen.', 404);
  }

  return { user, kompanija };
}

function normalizeId(id, missingMessage) {
  const value = Number(id);
  if (!Number.isInteger(value) || value <= 0) {
    throw makeError(missingMessage, 404);
  }
  return value;
}

function mapCompanyApplicationDocument(dokument) {
  return {
    id: dokument.id,
    naziv: dokument.original_name,
    tip: dokument.tip_dokumenta,
    mimeType: dokument.mime_path,
    velicina: dokument.size,
    datumDodavanja: dokument.created_at,
  };
}

function mapCompanyApplication(prijava) {
  const student = prijava.Student;
  const user = student?.User;
  const oglas = prijava.Oglas || prijava.Ogla;

  return {
    id: prijava.id,
    status: prijava.status,
    koordinatorStatus: prijava.koordinatorStatus,
    kompanijaStatus: prijava.kompanijaStatus,
    studentStatus: prijava.studentStatus,
    studentOdlucioAt: prijava.studentOdlucioAt,
    datumPrijave: prijava.datumPrijave,
    oglas: oglas
      ? {
          id: oglas.id,
          naziv: oglas.naziv,
          status: oglas.status,
        }
      : null,
    student: student
      ? {
          id: student.id,
          ime: user?.ime || null,
          prezime: user?.prezime || null,
          email: user?.email || null,
          godinaStudija: student.year_of_study,
          fakultet: student.Fakultet
            ? { id: student.Fakultet.id, naziv: student.Fakultet.naziv }
            : null,
          odsjek: student.Odsjek
            ? { id: student.Odsjek.id, naziv: student.Odsjek.naziv }
            : null,
        }
      : null,
    dokumenti: Array.isArray(prijava.Dokuments)
      ? prijava.Dokuments.map(mapCompanyApplicationDocument)
      : [],
  };
}

async function resolveStudentFromUser(userId) {
  const user = await User.findByPk(userId);
  if (!user || user.role !== 'STUDENT') {
    throw makeError('Nemate dozvolu za pristup ovom resursu.', 403);
  }

  const student = await Student.findOne({ where: { userID: user.id } });
  if (!student || !isStudentProfileComplete(user, student)) {
    throw makeError('Profil studenta nije potpun. Popunite profil prije prijave.', 400);
  }

  return { user, student };
}

async function resolveStudentForListing(userId) {
  const user = await User.findByPk(userId);
  if (!user || user.role !== 'STUDENT') {
    throw makeError('Nemate dozvolu za pristup ovom resursu.', 403);
  }

  const student = await Student.findOne({ where: { userID: user.id } });
  if (!student || !isStudentProfileComplete(user, student)) {
    return null;
  }

  return student;
}

async function resolveStudentForDecision(userId) {
  const user = await User.findByPk(userId);
  if (!user || user.role !== 'STUDENT') {
    throw makeError('Samo studenti mogu odlučiti o učešću na praksi.', 403);
  }

  const student = await Student.findOne({ where: { userID: user.id } });
  if (!student) {
    throw makeError('Nemate pravo odlučivati o ovoj prijavi.', 403);
  }

  return student;
}

async function notifyStudent({ prijava, tip, naslov, poruka, emailStatus, razlog, oglas, kompanija }) {
  const student = prijava.Student;
  const studentId = student?.id;
  const studentUserId = student?.User?.id;
  const studentEmail = student?.User?.email;
  const preferences = studentUserId ? await getOrCreatePreferences(studentUserId) : null;

  if (studentId && canSendInApp(preferences, tip)) {
    createNotification(studentId, prijava.id, tip, naslov, poruka).catch(() => {});
  }

  if (studentEmail && canSendEmail(preferences, tip)) {
    sendPrijavaStatusEmail(
      studentEmail,
      oglas?.naziv || 'praksu',
      kompanija?.naziv || 'Kompanija',
      emailStatus,
      razlog
    ).catch(() => {});
  }
}

async function createApplication(userId, data = {}) {
  const limitCheck = await checkStudentApplicationLimit(userId);
  if (!limitCheck.allowed) {
    const err = new Error(
      `Dostigli ste maksimalan broj aktivnih prijava (${limitCheck.current}/${limitCheck.limit}). ` +
      'Pricekajte da neka prijava bude rijesena.'
    );
    err.status = 403;
    throw err;
  }

  const oglasID = Number(data.oglasID);
  if (!Number.isInteger(oglasID) || oglasID <= 0) {
    throw makeError('Oglas nije pronadjen.', 404);
  }

  const { student, user } = await resolveStudentFromUser(userId);

  const oglas = await Oglas.findByPk(oglasID);
  if (!oglas) {
    throw makeError('Oglas nije pronadjen.', 404);
  }

  if (oglas.status !== 'AKTIVAN') {
    throw makeError('Nije moguce prijaviti se na neaktivan oglas.', 400);
  }

  const existingApplication = await PrijavaNaPraksu.findOne({
    where: {
      studentID: student.id,
      oglasID: oglas.id,
    },
  });

  if (existingApplication) {
    throw makeError('Vec ste se prijavili na ovaj oglas.', 409);
  }

  const prijava = await PrijavaNaPraksu.create({
    studentID: student.id,
    oglasID: oglas.id,
    status: APPLICATION_STATUS.WAITING_COORDINATOR,
    koordinatorStatus: COORDINATOR_STATUS.PENDING,
    kompanijaStatus: COMPANY_STATUS.UNAVAILABLE,
    studentStatus: STUDENT_STATUS.UNAVAILABLE,
    studentOdlucioAt: null,
  });

  await Dokument.update(
    { prijava_id: prijava.id },
    { where: { student_id: student.id, oglas_id: oglas.id, prijava_id: null } }
  );

  const prijavaDocs = await Dokument.findAll({
    where: { student_id: student.id, prijava_id: prijava.id },
  });

  const cv = prijavaDocs.find((d) => d.tip_dokumenta === 'CV');
  const motivaciono = prijavaDocs.find((d) => d.tip_dokumenta === 'MOTIVACIONO_PISMO');

  await prijava.update({
    cv: cv ? cv.file_path : null,
    motivacionoPismo: motivaciono ? motivaciono.file_path : null,
  });

  const kompanija = await Kompanija.findByPk(oglas.kompanijaID);
  const kompanijaNaziv = kompanija?.naziv || 'Kompanija';
  const tip = 'PRIJAVA_PODNESENA';
  const preferences = await getOrCreatePreferences(userId);

  if (canSendInApp(preferences, tip)) {
    createNotification(
      student.id,
      prijava.id,
      tip,
      'Prijava podnesena',
      `Vasa prijava na praksu "${oglas.naziv}" kod kompanije ${kompanijaNaziv} je uspjesno podnesena. Ceka odobrenje koordinatora.`
    ).catch(() => {});
  }

  if (canSendEmail(preferences, tip)) {
    sendPrijavaPodnesenaEmail(user.email, oglas.naziv, kompanijaNaziv).catch(() => {});
  }

  return prijava;
}

async function getMyApplications(userId) {
  const student = await resolveStudentForListing(userId);
  if (!student) return [];

  return PrijavaNaPraksu.findAll({
    where: { studentID: student.id },
    include: [
      {
        model: Oglas,
        attributes: ['id', 'naziv', 'status', 'kompanijaID'],
        include: [{ model: Kompanija, attributes: ['id', 'naziv'] }],
      },
    ],
    order: [['datumPrijave', 'DESC']],
  });
}

async function getCompanyApplicationsForListing(userId, oglasId) {
  const { kompanija } = await resolveCompanyFromUser(userId);
  const listingId = normalizeId(oglasId, 'Oglas nije pronadjen.');

  const oglas = await Oglas.findByPk(listingId, {
    attributes: ['id', 'naziv', 'status', 'kompanijaID'],
  });

  if (!oglas) {
    throw makeError('Oglas nije pronadjen.', 404);
  }

  if (oglas.kompanijaID !== kompanija.id) {
    throw makeError('Nemate pravo upravljati ovim oglasom.', 403);
  }

  if (oglas.status !== 'AKTIVAN') {
    throw makeError('Prijave kandidata su dostupne samo za aktivne oglase.', 400);
  }

  const applications = await PrijavaNaPraksu.findAll({
    where: {
      oglasID: oglas.id,
      koordinatorStatus: COORDINATOR_STATUS.APPROVED,
      status: { [Op.ne]: APPLICATION_STATUS.WITHDRAWN },
    },
    attributes: [
      'id',
      'studentID',
      'oglasID',
      'status',
      'koordinatorStatus',
      'kompanijaStatus',
      'studentStatus',
      'studentOdlucioAt',
      'datumPrijave',
    ],
    include: [
      {
        model: Student,
        attributes: ['id', 'year_of_study', 'fakultetID', 'odsjekID'],
        include: [
          { model: User, attributes: ['ime', 'prezime', 'email'] },
          { model: Fakultet, attributes: ['id', 'naziv'] },
          { model: Odsjek, attributes: ['id', 'naziv'] },
        ],
      },
      {
        model: Oglas,
        attributes: ['id', 'naziv', 'status'],
      },
      {
        model: Dokument,
        attributes: ['id', 'original_name', 'tip_dokumenta', 'mime_path', 'size', 'created_at'],
      },
    ],
    order: [['datumPrijave', 'DESC']],
  });

  return {
    oglas: {
      id: oglas.id,
      naziv: oglas.naziv,
      status: oglas.status,
    },
    applications: applications.map(mapCompanyApplication),
  };
}

async function loadCompanyActionContext(userId, applicationId) {
  const { kompanija } = await resolveCompanyFromUser(userId);
  const prijavaId = normalizeId(applicationId, 'Prijava nije pronadjena.');

  const prijava = await PrijavaNaPraksu.findByPk(prijavaId, {
    attributes: [
      'id',
      'studentID',
      'oglasID',
      'status',
      'koordinatorStatus',
      'kompanijaStatus',
      'studentStatus',
      'studentOdlucioAt',
      'datumPrijave',
    ],
    include: [
      {
        model: Student,
        attributes: ['id', 'year_of_study', 'fakultetID', 'odsjekID'],
        include: [
          { model: User, attributes: ['id', 'ime', 'prezime', 'email'] },
          { model: Fakultet, attributes: ['id', 'naziv'] },
          { model: Odsjek, attributes: ['id', 'naziv'] },
        ],
      },
    ],
  });

  if (!prijava) {
    throw makeError('Prijava nije pronadjena.', 404);
  }

  const oglas = await Oglas.findByPk(prijava.oglasID, {
    attributes: ['id', 'naziv', 'status', 'kompanijaID'],
    include: [{ model: Kompanija, attributes: ['id', 'naziv'] }],
  });

  if (!oglas) {
    throw makeError('Oglas nije pronadjen.', 404);
  }

  if (oglas.kompanijaID !== kompanija.id) {
    throw makeError('Nemate pravo upravljati ovim oglasom.', 403);
  }

  if (oglas.status !== 'AKTIVAN') {
    throw makeError('Selekcija kandidata je moguca samo za aktivne oglase.', 400);
  }

  if (!isCoordinatorApproved(prijava)) {
    throw makeError('Prijava jos nije odobrena od koordinatora.', 400);
  }

  if (prijava.status === APPLICATION_STATUS.WITHDRAWN) {
    throw makeError('Student je povukao prijavu.', 400);
  }

  return { prijava, oglas, kompanija };
}

async function reloadCompanyApplication(prijavaId) {
  const updated = await PrijavaNaPraksu.findByPk(prijavaId, {
    include: [
      {
        model: Oglas,
        attributes: ['id', 'naziv', 'status'],
      },
      {
        model: Student,
        attributes: ['id', 'year_of_study', 'fakultetID', 'odsjekID'],
        include: [
          { model: User, attributes: ['ime', 'prezime', 'email'] },
          { model: Fakultet, attributes: ['id', 'naziv'] },
          { model: Odsjek, attributes: ['id', 'naziv'] },
        ],
      },
      {
        model: Dokument,
        attributes: ['id', 'original_name', 'tip_dokumenta', 'mime_path', 'size', 'created_at'],
      },
    ],
  });

  return mapCompanyApplication(updated);
}

async function shortlistApplication(userId, applicationId) {
  const { prijava, oglas, kompanija } = await loadCompanyActionContext(userId, applicationId);

  if (prijava.status === APPLICATION_STATUS.SHORTLISTED) {
    return reloadCompanyApplication(prijava.id);
  }

  if (!canCompanyShortlist(prijava)) {
    if (!canCompanyAct(prijava)) {
      throw makeError('Nije moguce mijenjati prijavu koja je vec zakljucena.', 400);
    }
    throw makeError('Status prijave ne dozvoljava selekciju kandidata.', 400);
  }

  const [updatedCount] = await PrijavaNaPraksu.update(
    {
      status: APPLICATION_STATUS.SHORTLISTED,
      kompanijaStatus: COMPANY_STATUS.SHORTLISTED,
      studentStatus: STUDENT_STATUS.UNAVAILABLE,
      studentOdlucioAt: null,
    },
    {
      where: {
        id: prijava.id,
        status: APPLICATION_STATUS.WAITING_COMPANY,
        koordinatorStatus: COORDINATOR_STATUS.APPROVED,
        kompanijaStatus: COMPANY_STATUS.PENDING,
      },
    }
  );

  if (updatedCount === 1) {
    prijava.status = APPLICATION_STATUS.SHORTLISTED;
    prijava.kompanijaStatus = COMPANY_STATUS.SHORTLISTED;

    const studentId = prijava.Student?.id;
    const studentUserId = prijava.Student?.User?.id;
    const studentEmail = prijava.Student?.User?.email;
    const preferences = studentUserId ? await getOrCreatePreferences(studentUserId) : null;
    const kompanijaNaziv = oglas.Kompanija?.naziv || kompanija.naziv || 'Kompanija';
    const tip = 'PRIJAVA_UZI_KRUG';
    const naslov = 'Uzi krug';
    const poruka = 'Vasa prijava za praksu je azurirana. Oznaceni ste za uzi krug kandidata.';

    if (studentId && canSendInApp(preferences, tip)) {
      createNotification(studentId, prijava.id, tip, naslov, poruka).catch(() => {});
    }

    if (studentEmail && canSendEmail(preferences, tip)) {
      sendPrijavaShortlistedEmail(studentEmail, oglas.naziv, kompanijaNaziv).catch(() => {});
    }
  }

  return reloadCompanyApplication(prijava.id);
}

async function decideApplicationByCompany(userId, applicationId, odluka) {
  const { prijava, oglas, kompanija } = await loadCompanyActionContext(userId, applicationId);

  if (!canCompanyAct(prijava)) {
    throw makeError('Nije moguce mijenjati prijavu koja je vec zakljucena.', 400);
  }

  const approved = odluka === 'odobrena';
  const nextStatus = approved
    ? APPLICATION_STATUS.APPROVED
    : APPLICATION_STATUS.REJECTED_COMPANY;
  const nextCompanyStatus = approved
    ? COMPANY_STATUS.APPROVED
    : COMPANY_STATUS.REJECTED;

  const [updatedCount] = await PrijavaNaPraksu.update(
    {
      status: nextStatus,
      kompanijaStatus: nextCompanyStatus,
      studentStatus: approved ? STUDENT_STATUS.PENDING : STUDENT_STATUS.UNAVAILABLE,
      studentOdlucioAt: null,
    },
    {
      where: {
        id: prijava.id,
        status: { [Op.in]: [APPLICATION_STATUS.WAITING_COMPANY, APPLICATION_STATUS.SHORTLISTED] },
        koordinatorStatus: COORDINATOR_STATUS.APPROVED,
      },
    }
  );

  if (updatedCount === 0) {
    throw makeError('Status prijave ne dozvoljava ovu odluku.', 400);
  }

  prijava.status = nextStatus;
  prijava.kompanijaStatus = nextCompanyStatus;
  prijava.studentStatus = approved ? STUDENT_STATUS.PENDING : STUDENT_STATUS.UNAVAILABLE;
  prijava.studentOdlucioAt = null;

  await notifyStudent({
    prijava,
    tip: approved ? 'PRIJAVA_KOMPANIJA_ODOBRENA' : 'PRIJAVA_KOMPANIJA_ODBIJENA',
    naslov: approved ? 'Praksa odobrena' : 'Odbijeno od kompanije',
    poruka: approved
      ? `Kompanija ${kompanija.naziv} je odobrila vasu prijavu za praksu "${oglas.naziv}".`
      : `Kompanija ${kompanija.naziv} je odbila vasu prijavu za praksu "${oglas.naziv}".`,
    emailStatus: nextStatus,
    oglas,
    kompanija,
  });

  return reloadCompanyApplication(prijava.id);
}

async function approveApplicationByCompany(userId, applicationId) {
  return decideApplicationByCompany(userId, applicationId, 'odobrena');
}

async function rejectApplicationByCompany(userId, applicationId) {
  return decideApplicationByCompany(userId, applicationId, 'odbijena');
}

async function decideApplicationByStudent(userId, applicationId, decision) {
  const student = await resolveStudentForDecision(userId);
  const prijavaId = normalizeId(applicationId, 'Prijava nije pronađena.');
  const accepted = decision === 'accept';
  const nextStudentStatus = accepted ? STUDENT_STATUS.ACCEPTED : STUDENT_STATUS.DECLINED;
  const successMessage = accepted
    ? 'Učešće na praksi je uspješno prihvaćeno.'
    : 'Učešće na praksi je uspješno odbijeno.';
  const alreadyMessage = accepted
    ? 'Učešće na praksi je već prihvaćeno.'
    : 'Učešće na praksi je već odbijeno.';

  return sequelize.transaction(async (transaction) => {
    const prijava = await PrijavaNaPraksu.findByPk(prijavaId, {
      transaction,
      lock: transaction.LOCK.UPDATE,
    });

    if (!prijava) {
      throw makeError('Prijava nije pronađena.', 404);
    }

    if (Number(prijava.studentID) !== Number(student.id)) {
      throw makeError('Nemate pravo odlučivati o ovoj prijavi.', 403);
    }

    const oglas = await Oglas.findByPk(prijava.oglasID, {
      attributes: ['id', 'datumPocetka', 'trajanje'],
      transaction,
    });
    if (!oglas) {
      throw makeError('Oglas nije pronađen.', 404);
    }

    if (prijava.studentStatus === nextStudentStatus) {
      const existingPractice = accepted
        ? await ensurePracticeForApplication(prijava, oglas, { transaction })
        : null;
      return { message: alreadyMessage, application: prijava, practice: existingPractice };
    }

    if (
      prijava.studentStatus === STUDENT_STATUS.ACCEPTED ||
      prijava.studentStatus === STUDENT_STATUS.DECLINED
    ) {
      throw makeError('Odluka o učešću je već evidentirana i nije je moguće promijeniti.', 409);
    }

    if (
      prijava.status !== APPLICATION_STATUS.APPROVED ||
      prijava.koordinatorStatus !== COORDINATOR_STATUS.APPROVED ||
      prijava.kompanijaStatus !== COMPANY_STATUS.APPROVED ||
      prijava.studentStatus !== STUDENT_STATUS.PENDING
    ) {
      throw makeError(
        'Praksu nije moguće prihvatiti ili odbiti jer još nije odobrena od koordinatora i kompanije.',
        400
      );
    }

    let practice = null;
    if (accepted) {
      // Validacija datuma se izvršava prije odluke, pa greška ne ostavlja prijavu potvrđenom bez prakse.
      calculatePracticeDates(oglas.datumPocetka, oglas.trajanje);
      await ensurePracticeForApplication(
        { ...prijava.get({ plain: true }), studentStatus: STUDENT_STATUS.ACCEPTED },
        oglas,
        { transaction }
      );
    }

    await prijava.update(
      {
        studentStatus: nextStudentStatus,
        studentOdlucioAt: new Date(),
      },
      { transaction }
    );

    if (accepted) {
      practice = await Praksa.findOne({ where: { prijavaID: prijava.id }, transaction });
    }

    return { message: successMessage, application: prijava, practice };
  });
}

async function acceptApplicationByStudent(userId, applicationId) {
  const result = await decideApplicationByStudent(userId, applicationId, 'accept');
  if (result.practice) {
    result.practice = await getStudentPracticeById(userId, result.practice.id);
  }
  return result;
}

async function declineApplicationByStudent(userId, applicationId) {
  return decideApplicationByStudent(userId, applicationId, 'decline');
}

async function getApplicationStatistics(userId, { fakultetID, odsjekID, godina, status, oglasID } = {}) {
  const kompanija = await Kompanija.findOne({ where: { userID: userId } });
  if (!kompanija) {
    throw makeError('Kompanija nije pronadjena.', 404);
  }

  const oglasi = await Oglas.findAll({
    where: { kompanijaID: kompanija.id, status: 'AKTIVAN' },
    attributes: ['id', 'naziv', 'status'],
  });

  const oglasiList = oglasi.map((o) => ({ id: o.id, naziv: o.naziv }));

  if (oglasi.length === 0) {
    return {
      summary: { totalApplications: 0, listingsWithApplications: 0 },
      perListing: [],
      byYear: [],
      byOdsjek: [],
      byFakultet: [],
      oglasi: [],
    };
  }

  const oglasIDs = oglasi.map((o) => o.id);
  const oglasInfoMap = {};
  for (const o of oglasi) {
    oglasInfoMap[o.id] = { oglasID: o.id, naziv: o.naziv, oglasStatus: o.status, count: 0 };
  }

  const studentWhere = {};
  if (fakultetID) studentWhere.fakultetID = Number(fakultetID);
  if (odsjekID) studentWhere.odsjekID = Number(odsjekID);
  if (godina) studentWhere.year_of_study = Number(godina);

  const hasStudentFilter = Object.keys(studentWhere).length > 0;

  const oglasIDNum = oglasID ? Number(oglasID) : null;
  const prijaveWhere = {
    oglasID: oglasIDNum && oglasIDs.includes(oglasIDNum) ? oglasIDNum : oglasIDs,
    koordinatorStatus: COORDINATOR_STATUS.APPROVED,
    status: { [Op.ne]: APPLICATION_STATUS.WITHDRAWN },
  };
  const normalizedStatus = normalizeStatusFilter(status);
  if (normalizedStatus) prijaveWhere.status = normalizedStatus;

  const prijave = await PrijavaNaPraksu.findAll({
    where: prijaveWhere,
    attributes: ['id', 'oglasID'],
    include: [
      {
        model: Student,
        attributes: ['id', 'year_of_study', 'odsjekID', 'fakultetID'],
        where: hasStudentFilter ? studentWhere : undefined,
        required: hasStudentFilter,
        include: [
          { model: Odsjek, attributes: ['id', 'naziv'] },
          { model: Fakultet, attributes: ['id', 'naziv'] },
        ],
      },
    ],
  });

  const yearMap = {};
  const odsjekMap = {};
  const fakultetMap = {};

  for (const prijava of prijave) {
    const student = prijava.Student;
    oglasInfoMap[prijava.oglasID].count++;

    if (student?.year_of_study) {
      const y = student.year_of_study;
      yearMap[y] = (yearMap[y] || 0) + 1;
    }

    if (student?.Odsjek && student?.Fakultet) {
      const o = student.Odsjek;
      const f = student.Fakultet;
      if (!odsjekMap[f.id]) {
        odsjekMap[f.id] = { fakultetID: f.id, fakultetNaziv: f.naziv, odsjeci: {} };
      }
      if (!odsjekMap[f.id].odsjeci[o.id]) {
        odsjekMap[f.id].odsjeci[o.id] = { odsjekID: o.id, naziv: o.naziv, count: 0 };
      }
      odsjekMap[f.id].odsjeci[o.id].count++;
    }

    if (student?.Fakultet) {
      const f = student.Fakultet;
      if (!fakultetMap[f.id]) {
        fakultetMap[f.id] = { fakultetID: f.id, naziv: f.naziv, count: 0 };
      }
      fakultetMap[f.id].count++;
    }
  }

  const perListing = Object.values(oglasInfoMap)
    .filter((l) => l.count > 0)
    .sort((a, b) => b.count - a.count);

  const byYear = Object.entries(yearMap)
    .map(([year, count]) => ({ year: Number(year), count }))
    .sort((a, b) => a.year - b.year);

  const byOdsjek = Object.values(odsjekMap)
    .map((f) => ({
      fakultetID: f.fakultetID,
      fakultetNaziv: f.fakultetNaziv,
      odsjeci: Object.values(f.odsjeci).sort((a, b) => b.count - a.count),
    }))
    .sort((a, b) => {
      const totalA = a.odsjeci.reduce((s, o) => s + o.count, 0);
      const totalB = b.odsjeci.reduce((s, o) => s + o.count, 0);
      return totalB - totalA;
    });

  const byFakultet = Object.values(fakultetMap).sort((a, b) => b.count - a.count);

  return {
    summary: {
      totalApplications: prijave.length,
      listingsWithApplications: perListing.length,
    },
    perListing,
    byYear,
    byOdsjek,
    byFakultet,
    oglasi: oglasiList,
  };
}

const WITHDRAWABLE_STATUSES = [
  APPLICATION_STATUS.WAITING_COORDINATOR,
  APPLICATION_STATUS.WAITING_COMPANY,
  APPLICATION_STATUS.SHORTLISTED,
  APPLICATION_STATUS.APPROVED,
  APPLICATION_STATUS.LEGACY_SUBMITTED,
];

async function withdrawApplication(userId, applicationId) {
  const user = await User.findByPk(userId);
  if (!user || user.role !== 'STUDENT') {
    throw makeError('Samo studenti mogu odustati od prijave.', 403);
  }

  const student = await Student.findOne({ where: { userID: user.id } });
  if (!student) {
    throw makeError('Nemate pravo upravljati ovom prijavom.', 403);
  }

  const prijavaId = normalizeId(applicationId, 'Prijava nije pronađena.');

  return sequelize.transaction(async (transaction) => {
    const prijava = await PrijavaNaPraksu.findByPk(prijavaId, {
      transaction,
      lock: transaction.LOCK.UPDATE,
    });

    if (!prijava) {
      throw makeError('Prijava nije pronađena.', 404);
    }

    if (Number(prijava.studentID) !== Number(student.id)) {
      throw makeError('Nemate pravo upravljati ovom prijavom.', 403);
    }

    if (prijava.status === APPLICATION_STATUS.WITHDRAWN) {
      return { message: 'Već ste odustali od ove prijave.', application: prijava };
    }

    if (!WITHDRAWABLE_STATUSES.includes(prijava.status)) {
      throw makeError('Nije moguće odustati od ove prijave.', 400);
    }

    if (prijava.status === APPLICATION_STATUS.APPROVED) {
      const praksa = await Praksa.findOne({ where: { prijavaID: prijava.id }, transaction });
      if (praksa && praksa.datumKraja && new Date(praksa.datumKraja) < new Date()) {
        throw makeError('Nije moguće odustati od prakse koja je već završena.', 400);
      }
    }

    await prijava.update(
      { status: APPLICATION_STATUS.WITHDRAWN, datumOdustajanja: new Date() },
      { transaction }
    );

    const oglas = await Oglas.findByPk(prijava.oglasID, {
      attributes: ['id', 'naziv', 'kompanijaID'],
      include: [{ model: Kompanija, attributes: ['id', 'naziv'], include: [{ model: User, attributes: ['email'] }] }],
    });

    const studentName = `${user.ime || ''} ${user.prezime || ''}`.trim() || 'Student';
    const oglasNaziv = oglas?.naziv || 'praksu';
    const kompanijaId = oglas?.Kompanija?.id;
    const companyEmail = oglas?.Kompanija?.User?.email;
    const tip = 'PRIJAVA_ODUSTAJANJE';
    const naslov = 'Student odustao od prijave';
    const poruka = `Student ${studentName} je odustao/la od prijave na praksu "${oglasNaziv}".`;

    if (kompanijaId) {
      createNotificationForKompanija(kompanijaId, prijava.id, tip, naslov, poruka).catch(() => {});
    }
    if (companyEmail) {
      sendOdustajanjeKompaniji(companyEmail, studentName, oglasNaziv).catch(() => {});
    }

    if (prijava.koordinatorID) {
      const koordinator = await Koordinator.findByPk(prijava.koordinatorID, {
        include: [{ model: User, attributes: ['email'] }],
      });
      createNotificationForKoordinator(
        prijava.koordinatorID, prijava.id, tip, naslov, poruka
      ).catch(() => {});
      const coordEmail = koordinator?.User?.email;
      if (coordEmail) {
        sendOdustajanjeKoordinatoru(coordEmail, studentName, oglasNaziv).catch(() => {});
      }
    }

    return { message: 'Uspješno ste odustali od prijave.', application: prijava };
  });
}

module.exports = {
  createApplication,
  getMyApplications,
  getApplicationStatistics,
  getCompanyApplicationsForListing,
  shortlistApplication,
  approveApplicationByCompany,
  rejectApplicationByCompany,
  acceptApplicationByStudent,
  declineApplicationByStudent,
  withdrawApplication,
};
