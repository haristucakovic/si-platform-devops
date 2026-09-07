export const APPLICATION_STATUS = {
  WAITING_COORDINATOR: 'CEKA_KOORDINATORA',
  WAITING_COMPANY: 'CEKA_KOMPANIJU',
  SHORTLISTED: 'U_RAZMATRANJU',
  APPROVED: 'ODOBRENA',
  REJECTED_COORDINATOR: 'ODBIJENA_KOORDINATOR',
  REJECTED_COMPANY: 'ODBIJENA_KOMPANIJA',
  WITHDRAWN: 'ODUSTAO',
  LEGACY_SUBMITTED: 'PODNESENA',
  LEGACY_REJECTED: 'ODBIJENA',
};

export const STUDENT_STATUS = {
  UNAVAILABLE: 'NIJE_DOSTUPNO',
  PENDING: 'NA_CEKANJU',
  ACCEPTED: 'PRIHVACENO',
  DECLINED: 'ODBIJENO',
};

export const STUDENT_STATUS_LABELS = {
  [STUDENT_STATUS.UNAVAILABLE]: 'Nije dostupno',
  [STUDENT_STATUS.PENDING]: 'Čeka odluku studenta',
  [STUDENT_STATUS.ACCEPTED]: 'Student prihvatio praksu',
  [STUDENT_STATUS.DECLINED]: 'Student odbio praksu',
};

export const APPLICATION_STATUS_LABELS = {
  [APPLICATION_STATUS.WAITING_COORDINATOR]: 'Čeka odobrenje koordinatora',
  [APPLICATION_STATUS.WAITING_COMPANY]: 'Čeka odgovor kompanije',
  [APPLICATION_STATUS.SHORTLISTED]: 'Uži krug',
  [APPLICATION_STATUS.APPROVED]: 'Praksa odobrena',
  [APPLICATION_STATUS.REJECTED_COORDINATOR]: 'Odbijeno od koordinatora',
  [APPLICATION_STATUS.REJECTED_COMPANY]: 'Odbijeno od kompanije',
  [APPLICATION_STATUS.WITHDRAWN]: 'Odustao',
  [APPLICATION_STATUS.LEGACY_SUBMITTED]: 'Čeka odobrenje koordinatora',
  [APPLICATION_STATUS.LEGACY_REJECTED]: 'Odbijeno',
};

export const ACTIVE_APPLICATION_STATUSES = [
  APPLICATION_STATUS.WAITING_COORDINATOR,
  APPLICATION_STATUS.WAITING_COMPANY,
  APPLICATION_STATUS.SHORTLISTED,
  APPLICATION_STATUS.LEGACY_SUBMITTED,
];

export function applicationStatusLabel(status) {
  return APPLICATION_STATUS_LABELS[status] || status || 'Čeka odobrenje koordinatora';
}

export function applicationStatusTone(status) {
  if (status === APPLICATION_STATUS.APPROVED) return 'success';
  if (
    status === APPLICATION_STATUS.REJECTED_COORDINATOR ||
    status === APPLICATION_STATUS.REJECTED_COMPANY ||
    status === APPLICATION_STATUS.LEGACY_REJECTED ||
    status === APPLICATION_STATUS.WITHDRAWN
  ) return 'error';
  return 'info';
}

export function studentDecisionLabel(status) {
  return STUDENT_STATUS_LABELS[status] || STUDENT_STATUS_LABELS[STUDENT_STATUS.UNAVAILABLE];
}

export function isStudentDecisionPending(application) {
  return (
    application?.status === APPLICATION_STATUS.APPROVED &&
    application?.koordinatorStatus === 'ODOBRENO' &&
    application?.kompanijaStatus === 'ODOBRENO' &&
    application?.studentStatus === STUDENT_STATUS.PENDING
  );
}

export function studentApplicationStatusLabel(application) {
  if (application?.status !== APPLICATION_STATUS.APPROVED) {
    return applicationStatusLabel(application?.status);
  }

  switch (application?.studentStatus) {
    case STUDENT_STATUS.PENDING:
      return 'Odobrena praksa - čeka vašu odluku';
    case STUDENT_STATUS.ACCEPTED:
      return 'Prihvatili ste praksu';
    case STUDENT_STATUS.DECLINED:
      return 'Odbili ste praksu';
    default:
      return applicationStatusLabel(application.status);
  }
}

export function studentApplicationStatusTone(application) {
  if (application?.status === APPLICATION_STATUS.APPROVED) {
    if (application.studentStatus === STUDENT_STATUS.PENDING) return 'info';
    if (application.studentStatus === STUDENT_STATUS.DECLINED) return 'error';
  }

  return applicationStatusTone(application?.status);
}

export function isActiveApplicationStatus(status) {
  return ACTIVE_APPLICATION_STATUSES.includes(status);
}

export function applicationStageSteps(application) {
  const status = application?.status;
  const coordinatorRejected =
    status === APPLICATION_STATUS.REJECTED_COORDINATOR ||
    status === APPLICATION_STATUS.LEGACY_REJECTED;
  const companyRejected = status === APPLICATION_STATUS.REJECTED_COMPANY;
  const companyReached = [
    APPLICATION_STATUS.WAITING_COMPANY,
    APPLICATION_STATUS.SHORTLISTED,
    APPLICATION_STATUS.APPROVED,
    APPLICATION_STATUS.REJECTED_COMPANY,
  ].includes(status);
  const finalReached = [
    APPLICATION_STATUS.APPROVED,
    APPLICATION_STATUS.REJECTED_COORDINATOR,
    APPLICATION_STATUS.REJECTED_COMPANY,
    APPLICATION_STATUS.LEGACY_REJECTED,
    APPLICATION_STATUS.WITHDRAWN,
  ].includes(status);
  const studentDecisionState = application?.studentStatus === STUDENT_STATUS.ACCEPTED
    ? 'complete'
    : application?.studentStatus === STUDENT_STATUS.DECLINED
      ? 'error'
      : 'current';

  return [
    { label: 'Prijava podnesena', state: 'complete' },
    {
      label: 'Koordinator',
      state: coordinatorRejected ? 'error' : status === APPLICATION_STATUS.WITHDRAWN ? 'pending' : companyReached || finalReached ? 'complete' : 'current',
    },
    {
      label: 'Kompanija',
      state: coordinatorRejected
        ? 'pending'
        : companyRejected
          ? 'error'
          : status === APPLICATION_STATUS.APPROVED
            ? 'complete'
            : companyReached
              ? 'current'
              : 'pending',
    },
    {
      label: status === APPLICATION_STATUS.APPROVED ? 'Odluka studenta' : 'Konačan ishod',
      state: status === APPLICATION_STATUS.APPROVED
        ? studentDecisionState
        : finalReached
          ? (coordinatorRejected || companyRejected || status === APPLICATION_STATUS.WITHDRAWN ? 'error' : 'complete')
          : 'pending',
    },
  ];
}
