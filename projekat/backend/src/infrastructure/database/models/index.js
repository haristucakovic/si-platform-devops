'use strict';

const sequelize = require('../db');
const UserModel = require('./User');
const StudentModel = require('./Student');
const KompanijaModel = require('./Kompanija');
const FakultetModel = require('./Fakultet');
const KoordinatorModel = require('./Koordinator');
const OglasModel = require('./Oglas');
const PrijavaNaPraksuModel = require('./PrijavaNaPraksu');
const PraksaModel = require('./Praksa');
const AktivnostModel = require('./Aktivnost');
const PrisustvoModel = require('./Prisustvo');
const EvaluacijaModel = require('./Evaluacija');
const EvaluacijaStudentaModel = require('./EvaluacijaStudenta');
const EvaluacijaKompanijeModel = require('./EvaluacijaKompanije');
const UgovorModel = require('./Ugovor');
const IzvjestajModel = require('./Izvjestaj');
const OdsjekModel = require('./Odsjek');
const DokumentModel = require('./Dokument');
const OmiljeniOglasModel = require('./OmiljeniOglas');
const SystemSettingModel = require('./SystemSetting');
const NotifikacijaModel = require('./Notifikacija');
const NotificationPreferenceModel = require('./NotificationPreference');
const AuditLogModel = require('./AuditLog');

const User = UserModel(sequelize);
const Student = StudentModel(sequelize);
const Kompanija = KompanijaModel(sequelize);
const Fakultet = FakultetModel(sequelize);
const Koordinator = KoordinatorModel(sequelize);
const Oglas = OglasModel(sequelize);
const PrijavaNaPraksu = PrijavaNaPraksuModel(sequelize);
const Praksa = PraksaModel(sequelize);
const Aktivnost = AktivnostModel(sequelize);
const Prisustvo = PrisustvoModel(sequelize);
const Evaluacija = EvaluacijaModel(sequelize);
const Ugovor = UgovorModel(sequelize);
const Izvjestaj = IzvjestajModel(sequelize);
const Odsjek = OdsjekModel(sequelize);
const Dokument = DokumentModel(sequelize);
const OmiljeniOglas = OmiljeniOglasModel(sequelize);
const SystemSetting = SystemSettingModel(sequelize);
const Notifikacija = NotifikacijaModel(sequelize);
const NotificationPreference = NotificationPreferenceModel(sequelize);
const AuditLog = AuditLogModel(sequelize);
const EvaluacijaStudenta = EvaluacijaStudentaModel(sequelize);
const EvaluacijaKompanije = EvaluacijaKompanijeModel(sequelize);

//relacije
User.hasOne(Student, { foreignKey: 'userID' });
Student.belongsTo(User, { foreignKey: 'userID' });

User.hasOne(Kompanija, { foreignKey: 'userID' });
Kompanija.belongsTo(User, { foreignKey: 'userID' });

User.hasOne(Koordinator, { foreignKey: 'userID' });
Koordinator.belongsTo(User, { foreignKey: 'userID' });

Fakultet.hasMany(Koordinator, { foreignKey: 'fakultetID' });
Koordinator.belongsTo(Fakultet, { foreignKey: 'fakultetID' });

Fakultet.hasMany(Student, { foreignKey: 'fakultetID' });
Student.belongsTo(Fakultet, { foreignKey: 'fakultetID' });

Fakultet.hasMany(Odsjek, { foreignKey: 'fakultetID' });
Odsjek.belongsTo(Fakultet, { foreignKey: 'fakultetID' });

Odsjek.hasMany(Student, { foreignKey: 'odsjekID' });
Student.belongsTo(Odsjek, { foreignKey: 'odsjekID' });

Odsjek.hasMany(Koordinator, { foreignKey: 'odsjekID' });
Koordinator.belongsTo(Odsjek, { foreignKey: 'odsjekID' });

Kompanija.hasMany(Oglas, { foreignKey: 'kompanijaID' });
Oglas.belongsTo(Kompanija, { foreignKey: 'kompanijaID' });

Student.hasMany(PrijavaNaPraksu, { foreignKey: 'studentID' });
PrijavaNaPraksu.belongsTo(Student, { foreignKey: 'studentID' });

Oglas.hasMany(PrijavaNaPraksu, { foreignKey: 'oglasID' });
PrijavaNaPraksu.belongsTo(Oglas, { foreignKey: 'oglasID' });

Koordinator.hasMany(PrijavaNaPraksu, { foreignKey: 'koordinatorID' });
PrijavaNaPraksu.belongsTo(Koordinator, { foreignKey: 'koordinatorID' });

PrijavaNaPraksu.hasOne(Praksa, { foreignKey: 'prijavaID' });
Praksa.belongsTo(PrijavaNaPraksu, { foreignKey: 'prijavaID' });

Praksa.hasMany(Aktivnost, { foreignKey: 'praksaID' });
Aktivnost.belongsTo(Praksa, { foreignKey: 'praksaID' });


Praksa.hasMany(Prisustvo, { foreignKey: 'praksaID' });
Prisustvo.belongsTo(Praksa, { foreignKey: 'praksaID' });

Praksa.hasMany(Evaluacija, { foreignKey: 'praksaID' });
Evaluacija.belongsTo(Praksa, { foreignKey: 'praksaID' });

Praksa.hasOne(Ugovor, { foreignKey: 'praksaID' });
Ugovor.belongsTo(Praksa, { foreignKey: 'praksaID' });

Praksa.hasMany(Izvjestaj, { foreignKey: 'praksaID' });
Izvjestaj.belongsTo(Praksa, { foreignKey: 'praksaID' });

Koordinator.hasMany(Izvjestaj, { foreignKey: 'koordinatorID' });
Izvjestaj.belongsTo(Koordinator, { foreignKey: 'koordinatorID' });

Student.hasMany(Dokument, { foreignKey: 'student_id' });
Dokument.belongsTo(Student, { foreignKey: 'student_id' });

Oglas.hasMany(Dokument, { foreignKey: 'oglas_id' });
Dokument.belongsTo(Oglas, { foreignKey: 'oglas_id' });

PrijavaNaPraksu.hasMany(Dokument, { foreignKey: 'prijava_id' });
Dokument.belongsTo(PrijavaNaPraksu, { foreignKey: 'prijava_id' });

Student.hasMany(OmiljeniOglas, { foreignKey: 'studentID' });
OmiljeniOglas.belongsTo(Student, { foreignKey: 'studentID' });

Oglas.hasMany(OmiljeniOglas, { foreignKey: 'oglasID' });
OmiljeniOglas.belongsTo(Oglas, { foreignKey: 'oglasID' });

Student.hasMany(Notifikacija, { foreignKey: 'student_id' });
Notifikacija.belongsTo(Student, { foreignKey: 'student_id' });

PrijavaNaPraksu.hasMany(Notifikacija, { foreignKey: 'prijava_id' });
Notifikacija.belongsTo(PrijavaNaPraksu, { foreignKey: 'prijava_id' });

Student.hasOne(NotificationPreference, { foreignKey: 'student_id' });
NotificationPreference.belongsTo(Student, { foreignKey: 'student_id' });

User.hasMany(AuditLog, { foreignKey: 'userID', constraints: false });
AuditLog.belongsTo(User, { foreignKey: 'userID', constraints: false });

PrijavaNaPraksu.hasOne(EvaluacijaStudenta, { foreignKey: 'prijavaID' });
EvaluacijaStudenta.belongsTo(PrijavaNaPraksu, { foreignKey: 'prijavaID' });

PrijavaNaPraksu.hasOne(EvaluacijaKompanije, { foreignKey: 'prijavaID' });
EvaluacijaKompanije.belongsTo(PrijavaNaPraksu, { foreignKey: 'prijavaID' });



//eksport
module.exports = { sequelize, User, Student, Kompanija, Fakultet, Koordinator, Odsjek, Oglas, PrijavaNaPraksu, Praksa,
     Aktivnost, Prisustvo, Evaluacija, Ugovor, Izvjestaj, Dokument, OmiljeniOglas, Notifikacija, SystemSetting, NotificationPreference, AuditLog, EvaluacijaStudenta, EvaluacijaKompanije};
