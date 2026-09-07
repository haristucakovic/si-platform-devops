'use strict';

const { Op } = require('sequelize');
const {
    EvaluacijaStudenta,
    EvaluacijaKompanije,
    PrijavaNaPraksu,
    Praksa,
    Student,
    Kompanija,
    Oglas,
    User,
} = require('../../infrastructure/database/models');
const notifService = require('./notifications.service');
const { sendEvaluacijaStudentaEmail} = require('./email.service');

// ── Helper: dohvati kompanijaID iz userID ─────────────────────────────────

async function getKompanijaID(userID) {
    const kompanija = await Kompanija.findOne({ where: { userID }, attributes: ['id'] });
    if (!kompanija) {
        const err = new Error('Kompanija nije pronađena za ovog korisnika.');
        err.status = 403;
        throw err;
    }
    return kompanija.id;
}

// ── Helper: dohvati studentID iz userID ──────────────────────────────────

async function getStudentID(userID) {
    const student = await Student.findOne({ where: { userID }, attributes: ['id'] });
    if (!student) {
        const err = new Error('Student nije pronađen za ovog korisnika.');
        err.status = 403;
        throw err;
    }
    return student.id;
}

// ─── Kompanija evaluira studenta (US 26) ─────────────────────────────────

async function getPendingStudentEvaluations(userID) {
    const kompanijaID = await getKompanijaID(userID);

    const prakse = await Praksa.findAll({
        where: {
            datumKraja: { [Op.lt]: new Date() },
            datumOdustajanja: null,
        },
        include: [{
            model: PrijavaNaPraksu,
            required: true,
            where: {
                status: 'ODOBRENA',
                koordinatorStatus: 'ODOBRENO',
                kompanijaStatus: 'ODOBRENO',
                studentStatus: 'PRIHVACENO',
            },
            include: [
                {
                    model: Oglas,
                    where: { kompanijaID },
                    attributes: ['id', 'naziv'],
                },
                {
                    model: Student,
                    attributes: ['id'],
                    include: [{ model: User, attributes: ['email', 'ime', 'prezime'] }],
                },
            ],
        }],
    });

    if (prakse.length === 0) return [];

    const prijavaIDs = prakse.map(p => p.prijavaID);

    const evaluated = await EvaluacijaStudenta.findAll({
        where: { prijavaID: prijavaIDs },
        attributes: ['prijavaID'],
    });
    const evaluatedIds = new Set(evaluated.map(e => e.prijavaID));

    return prakse
        .filter(p => !evaluatedIds.has(p.prijavaID))
        .map(p => ({
            id: p.prijavaID,
            studentIme: p.PrijavaNaPraksu?.Student?.User?.ime || '',
            studentPrezime: p.PrijavaNaPraksu?.Student?.User?.prezime || '',
            studentEmail: p.PrijavaNaPraksu?.Student?.User?.email || '',
            oglasNaziv: p.PrijavaNaPraksu?.Ogla?.naziv || '',
        }));

}

async function submitStudentEvaluation(userID, prijavaID, data) {
    const kompanijaID = await getKompanijaID(userID);

    // Provjeri da prijava postoji, da je APPROVED i da oglas pripada ovoj kompaniji
    // Provjeri da postoji završena praksa za ovu prijavu
    const praksa = await Praksa.findOne({
        where: {
            prijavaID,
            datumKraja: { [Op.lt]: new Date() },
            datumOdustajanja: null,
        },
        include: [{
            model: PrijavaNaPraksu,
            required: true,
            where: {
                status: 'ODOBRENA',
                koordinatorStatus: 'ODOBRENO',
                kompanijaStatus: 'ODOBRENO',
                studentStatus: 'PRIHVACENO',
            },
        }],
    });

    if (!praksa) {
        const err = new Error('Evaluacija je moguća samo nakon završetka prakse.');
        err.status = 400;
        throw err;
    }

    // Provjeri da prijava pripada ovoj kompaniji
    const prijava = await PrijavaNaPraksu.findOne({
        where: { id: prijavaID },
        include: [{ model: Oglas, where: { kompanijaID }, attributes: ['id'] }],
    });

    if (!prijava) {
        const err = new Error('Prijava nije pronađena ili nemate pravo evaluirati ovog studenta.');
        err.status = 403;
        throw err;
    }


    // Sprječava duple evaluacije
    const existing = await EvaluacijaStudenta.findOne({ where: { prijavaID } });
    if (existing) {
        const err = new Error('Evaluacija za ovu prijavu je već poslana.');
        err.status = 409;
        throw err;
    }

    const evaluacija = await EvaluacijaStudenta.create({
        prijavaID,
        tehnickeVjestine: data.tehnickeVjestine,
        komunikacija: data.komunikacija,
        radnaEtika: data.radnaEtika,
        inicijativa: data.inicijativa,
        timskiRad: data.timskiRad,
        ukupnaOcjena: data.ukupnaOcjena,
        komentar: data.komentar || null,
        datumEvaluacije: new Date(),
    });

    try {
        const prijava = await PrijavaNaPraksu.findOne({
            where: { id: prijavaID },
            include: [
                {
                    model: Student,
                    attributes: ['id'],
                    include: [{ model: User, attributes: ['email', 'ime', 'prezime'] }],
                },
                {
                    model: Oglas,
                    as: 'Ogla',
                    attributes: ['naziv'],
                },
            ],
        });

        const student = prijava?.Student;
        const studentUserID = student?.id;
        const studentEmail = student?.User?.email;
        const studentIme = student?.User?.ime || 'Student';
        const oglasNaziv = prijava?.Ogla?.naziv || 'praksu';

        if (studentUserID) {
            await notifService.createNotification(
                studentUserID,
                prijavaID,
                'EVALUACIJA',
                'Kompanija vas je evaluirala',
                `Kompanija je popunila evaluaciju za vašu praksu: ${oglasNaziv}.`
            );
        }

        if (studentEmail) {
            await sendEvaluacijaStudentaEmail(studentEmail, studentIme, oglasNaziv, data.ukupnaOcjena);
        }
    } catch (notifErr) {
        console.error('Greška pri slanju notifikacije/emaila:', notifErr.message);
    }

    return evaluacija;
}

async function getSubmittedStudentEvaluations(userID) {
    const kompanijaID = await getKompanijaID(userID);

    const evaluacije = await EvaluacijaStudenta.findAll({
        include: [{
            model: PrijavaNaPraksu,
            required: true,
            include: [
                {
                    model: Oglas,
                    where: { kompanijaID },
                    attributes: ['id', 'naziv'],
                },
                {
                    model: Student,
                    attributes: ['id'],
                    include: [{ model: User, attributes: ['ime', 'prezime'] }],
                },
            ],
        }],
        order: [['datumEvaluacije', 'DESC']],
    });

    return evaluacije.map(ev => ({
        id: ev.id,
        prijavaID: ev.prijavaID,
        studentIme: ev.PrijavaNaPraksu?.Student?.User?.ime || '',
        studentPrezime: ev.PrijavaNaPraksu?.Student?.User?.prezime || '',
        oglasNaziv: ev.PrijavaNaPraksu?.Ogla?.naziv || '',
        tehnickeVjestine: ev.tehnickeVjestine,
        komunikacija: ev.komunikacija,
        radnaEtika: ev.radnaEtika,
        inicijativa: ev.inicijativa,
        timskiRad: ev.timskiRad,
        ukupnaOcjena: ev.ukupnaOcjena,
        komentar: ev.komentar,
        datumEvaluacije: ev.datumEvaluacije,
    }));
}

// ─── Student evaluira kompaniju (US 27) ──────────────────────────────────

async function getPendingCompanyEvaluations(userID) {
    const studentID = await getStudentID(userID);

    // Nađi završene prakse ovog studenta
    const prakse = await Praksa.findAll({
        where: {
            datumKraja: { [Op.lt]: new Date() },
        },
        include: [{
            model: PrijavaNaPraksu,
            required: true,
            where: {
                studentID,
                status: 'ODOBRENA',
                koordinatorStatus: 'ODOBRENO',
                kompanijaStatus: 'ODOBRENO',
                studentStatus: 'PRIHVACENO',
            },
            include: [{
                model: Oglas,
                attributes: ['id', 'naziv'],
                include: [{ model: Kompanija, attributes: ['id', 'naziv'] }],
            }],
        }],
    });

    if (prakse.length === 0) return [];

    const prijavaIDs = prakse.map(p => p.prijavaID);

    const evaluated = await EvaluacijaKompanije.findAll({
        where: { prijavaID: prijavaIDs },
        attributes: ['prijavaID'],
    });
    const evaluatedIds = new Set(evaluated.map(e => e.prijavaID));

    return prakse
        .filter(p => !evaluatedIds.has(p.prijavaID))
        .map(p => ({
            id: p.prijavaID,
            kompanijaNaziv: p.PrijavaNaPraksu?.Ogla?.Kompanija?.naziv || '',
            oglasNaziv: p.PrijavaNaPraksu?.Ogla?.naziv || '',
        }));
}


async function submitCompanyEvaluation(userID, prijavaID, data) {
    const studentID = await getStudentID(userID);

    // Provjeri završenu praksu
    const praksa = await Praksa.findOne({
        where: {
            prijavaID,
            datumKraja: { [Op.lt]: new Date() },
            datumOdustajanja: null,
        },
        include: [{
            model: PrijavaNaPraksu,
            required: true,
            where: {
                status: 'ODOBRENA',
                koordinatorStatus: 'ODOBRENO',
                kompanijaStatus: 'ODOBRENO',
                studentStatus: 'PRIHVACENO',
            },
        }],
    });

    if (!praksa) {
        const err = new Error('Evaluacija je moguća samo nakon završetka prakse.');
        err.status = 400;
        throw err;
    }

    const existing = await EvaluacijaKompanije.findOne({ where: { prijavaID } });
    if (existing) {
        const err = new Error('Evaluacija za ovu prijavu je već poslana.');
        err.status = 409;
        throw err;
    }

    const evaluacija = await EvaluacijaKompanije.create({
        prijavaID,
        organizacija: data.organizacija,
        mentorstvo: data.mentorstvo,
        radnoOkruzenje: data.radnoOkruzenje,
        relevantnoPosla: data.relevantnoPosla,
        preporukaKompanija: data.preporukaKompanija,
        ukupnaOcjena: data.ukupnaOcjena,
        komentar: data.komentar || null,
        datumEvaluacije: new Date(),
    });

    try {
        const prijavaZaNotif = await PrijavaNaPraksu.findOne({
            where: { id: prijavaID },
            include: [
                {
                    model: Oglas,
                    attributes: ['naziv', 'kompanijaID'],
                },
                {
                    model: Student,
                    attributes: ['id'],
                    include: [{ model: User, attributes: ['ime', 'prezime'] }],
                },
            ],
        });

        const kompanijaID = prijavaZaNotif?.Ogla?.kompanijaID;
        const oglasNaziv = prijavaZaNotif?.Ogla?.naziv || 'praksu';
        const studentIme = prijavaZaNotif?.Student?.User?.ime || '';
        const studentPrezime = prijavaZaNotif?.Student?.User?.prezime || '';
        const studentImePrezime = [studentIme, studentPrezime].filter(Boolean).join(' ') || 'Student';

        if (kompanijaID) {
            await notifService.createNotificationForKompanija(
                kompanijaID,
                prijavaID,
                'EVALUACIJA',
                'Student vas je evaluirao',
                `${studentImePrezime} je popunio/la evaluaciju za praksu: ${oglasNaziv}.`
            );
        }
    } catch (notifErr) {
        console.error('Greška pri slanju notifikacije kompaniji:', notifErr.message);
    }

    return evaluacija;
}

// Vraća sve evaluacije koje je student poslao — koristi se i za
// punjenje `evaluatedAppIds` seta u StudentDashboard pri loadu
async function getStudentSubmittedCompanyEvaluations(userID) {
    const studentID = await getStudentID(userID);

    const evaluacije = await EvaluacijaKompanije.findAll({
        include: [{
            model: PrijavaNaPraksu,
            required: true,
            where: { studentID },
            include: [{
                model: Oglas,
                attributes: ['id', 'naziv'],
                include: [{
                    model: Kompanija,
                    attributes: ['id', 'naziv'],
                }],
            }],
        }],
        order: [['datumEvaluacije', 'DESC']],
    });

    return evaluacije.map(ev => ({
        id: ev.id,
        // applicationId = prijavaID, koristi se u frontendu za Set
        applicationId: ev.prijavaID,
        prijavaID: ev.prijavaID,
        kompanijaNaziv: ev.PrijavaNaPraksu?.Ogla?.Kompanija?.naziv || '',
        oglasNaziv: ev.PrijavaNaPraksu?.Ogla?.naziv || '',
        organizacija: ev.organizacija,
        mentorstvo: ev.mentorstvo,
        radnoOkruzenje: ev.radnoOkruzenje,
        relevantnoPosla: ev.relevantnoPosla,
        preporukaKompanija: ev.preporukaKompanija,
        ukupnaOcjena: ev.ukupnaOcjena,
        komentar: ev.komentar,
        datumEvaluacije: ev.datumEvaluacije,
    }));
}

async function getStudentReceivedEvaluations(userID) {
    const studentID = await getStudentID(userID);

    const prijave = await PrijavaNaPraksu.findAll({
        where: { studentID },
        attributes: ['id'],
    });

    if (prijave.length === 0) return [];

    const evaluacije = await EvaluacijaStudenta.findAll({
        where: { prijavaID: prijave.map(p => p.id) },
        include: [{
            model: PrijavaNaPraksu,
            required: true,
            include: [{
                model: Oglas,
                as: 'Ogla',
                attributes: ['id', 'naziv'],
                include: [{
                    model: Kompanija,
                    attributes: ['id', 'naziv'],
                }],
            }],
        }],
        order: [['datumEvaluacije', 'DESC']],
    });

    return evaluacije.map(ev => ({
        id: ev.id,
        prijavaID: ev.prijavaID,
        kompanijaNaziv: ev.PrijavaNaPraksu?.Ogla?.Kompanija?.naziv || '',
        oglasNaziv: ev.PrijavaNaPraksu?.Ogla?.naziv || '',
        tehnickeVjestine: ev.tehnickeVjestine,
        komunikacija: ev.komunikacija,
        radnaEtika: ev.radnaEtika,
        inicijativa: ev.inicijativa,
        timskiRad: ev.timskiRad,
        ukupnaOcjena: ev.ukupnaOcjena,
        komentar: ev.komentar,
        datumEvaluacije: ev.datumEvaluacije,
    }));
}

async function getCompanyReceivedEvaluations(userID) {
    const kompanijaID = await getKompanijaID(userID);

    const evaluacije = await EvaluacijaKompanije.findAll({
        include: [{
            model: PrijavaNaPraksu,
            required: true,
            include: [{
                model: Oglas,
                where: { kompanijaID },
                attributes: ['id', 'naziv'],
                include: [{ model: Kompanija, attributes: ['id', 'naziv'] }],
            }, {
                model: Student,
                attributes: ['id'],
                include: [{ model: User, attributes: ['ime', 'prezime'] }],
            }],
        }],
        order: [['datumEvaluacije', 'DESC']],
    });

    return evaluacije.map(ev => ({
        id: ev.id,
        prijavaID: ev.prijavaID,
        studentIme: ev.PrijavaNaPraksu?.Student?.User?.ime || '',
        studentPrezime: ev.PrijavaNaPraksu?.Student?.User?.prezime || '',
        oglasNaziv: ev.PrijavaNaPraksu?.Oglas?.naziv || '',
        organizacija: ev.organizacija,
        mentorstvo: ev.mentorstvo,
        radnoOkruzenje: ev.radnoOkruzenje,
        relevantnoPosla: ev.relevantnoPosla,
        preporukaKompanija: ev.preporukaKompanija,
        ukupnaOcjena: ev.ukupnaOcjena,
        komentar: ev.komentar,
        datumEvaluacije: ev.datumEvaluacije,
    }));
}

module.exports = {
    getPendingStudentEvaluations,
    submitStudentEvaluation,
    getSubmittedStudentEvaluations,
    getPendingCompanyEvaluations,
    submitCompanyEvaluation,
    getStudentSubmittedCompanyEvaluations,
    getStudentReceivedEvaluations,
    getCompanyReceivedEvaluations,
};