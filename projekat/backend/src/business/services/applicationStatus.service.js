'use strict';

const { Op, cast, col, where } = require('sequelize');

const APPLICATION_STATUS = {
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

const COORDINATOR_STATUS = {
  PENDING: 'NA_CEKANJU',
  APPROVED: 'ODOBRENO',
  REJECTED: 'ODBIJENO',
};

const COMPANY_STATUS = {
  UNAVAILABLE: 'NIJE_DOSTUPNO',
  PENDING: 'NA_CEKANJU',
  SHORTLISTED: 'U_RAZMATRANJU',
  APPROVED: 'ODOBRENO',
  REJECTED: 'ODBIJENO',
};

const STUDENT_STATUS = {
  UNAVAILABLE: 'NIJE_DOSTUPNO',
  PENDING: 'NA_CEKANJU',
  ACCEPTED: 'PRIHVACENO',
  DECLINED: 'ODBIJENO',
};

const COORDINATOR_PENDING_STATUSES = [
  APPLICATION_STATUS.WAITING_COORDINATOR,
  APPLICATION_STATUS.LEGACY_SUBMITTED,
];

const ACTIVE_APPLICATION_STATUSES = [
  APPLICATION_STATUS.WAITING_COORDINATOR,
  APPLICATION_STATUS.WAITING_COMPANY,
  APPLICATION_STATUS.SHORTLISTED,
  APPLICATION_STATUS.LEGACY_SUBMITTED,
];

const COMPANY_ACTIONABLE_STATUSES = [
  APPLICATION_STATUS.WAITING_COMPANY,
  APPLICATION_STATUS.SHORTLISTED,
];

const COMPANY_BLOCKING_STATUSES = [
  APPLICATION_STATUS.WAITING_COMPANY,
  APPLICATION_STATUS.SHORTLISTED,
  APPLICATION_STATUS.APPROVED,
];

const STUDENT_BLOCKING_STATUSES = [
  ...ACTIVE_APPLICATION_STATUSES,
  APPLICATION_STATUS.APPROVED,
];

const FINAL_REJECTED_STATUSES = [
  APPLICATION_STATUS.REJECTED_COORDINATOR,
  APPLICATION_STATUS.REJECTED_COMPANY,
  APPLICATION_STATUS.LEGACY_REJECTED,
];

function normalizeStatusFilter(status) {
  if (!status) return null;

  switch (status) {
    case APPLICATION_STATUS.LEGACY_SUBMITTED:
      return APPLICATION_STATUS.WAITING_COORDINATOR;
    case APPLICATION_STATUS.LEGACY_REJECTED:
      return {
        [Op.in]: [
          APPLICATION_STATUS.REJECTED_COORDINATOR,
          APPLICATION_STATUS.REJECTED_COMPANY,
        ],
      };
    default:
      return status;
  }
}

function isCoordinatorPending(prijava) {
  return COORDINATOR_PENDING_STATUSES.includes(prijava?.status);
}

function isCoordinatorApproved(prijava) {
  return prijava?.koordinatorStatus === COORDINATOR_STATUS.APPROVED;
}

function canCompanyAct(prijava) {
  return (
    isCoordinatorApproved(prijava) &&
    COMPANY_ACTIONABLE_STATUSES.includes(prijava?.status)
  );
}

function canCompanyShortlist(prijava) {
  return (
    isCoordinatorApproved(prijava) &&
    prijava?.status === APPLICATION_STATUS.WAITING_COMPANY &&
    prijava?.kompanijaStatus === COMPANY_STATUS.PENDING
  );
}

async function backfillApplicationStatuses(PrijavaNaPraksu) {
  await PrijavaNaPraksu.update(
    {
      status: APPLICATION_STATUS.WAITING_COORDINATOR,
      koordinatorStatus: COORDINATOR_STATUS.PENDING,
      kompanijaStatus: COMPANY_STATUS.UNAVAILABLE,
    },
    {
      where: {
        status: APPLICATION_STATUS.LEGACY_SUBMITTED,
      },
    }
  );

  await PrijavaNaPraksu.update(
    {
      status: APPLICATION_STATUS.WAITING_COMPANY,
      koordinatorStatus: COORDINATOR_STATUS.APPROVED,
      kompanijaStatus: COMPANY_STATUS.PENDING,
    },
    {
      where: {
        status: APPLICATION_STATUS.APPROVED,
        [Op.or]: [
          { kompanijaStatus: null },
          { kompanijaStatus: { [Op.ne]: COMPANY_STATUS.APPROVED } },
        ],
      },
    }
  );

  await PrijavaNaPraksu.update(
    {
      koordinatorStatus: COORDINATOR_STATUS.APPROVED,
      kompanijaStatus: COMPANY_STATUS.SHORTLISTED,
    },
    {
      where: {
        status: APPLICATION_STATUS.SHORTLISTED,
      },
    }
  );

  await PrijavaNaPraksu.update(
    {
      status: APPLICATION_STATUS.REJECTED_COORDINATOR,
      koordinatorStatus: COORDINATOR_STATUS.REJECTED,
      kompanijaStatus: COMPANY_STATUS.UNAVAILABLE,
    },
    {
      where: {
        status: APPLICATION_STATUS.LEGACY_REJECTED,
      },
    }
  );
}

async function backfillStudentStatuses(PrijavaNaPraksu) {
  const blankStatus = where(cast(col('studentStatus'), 'TEXT'), '');

  await PrijavaNaPraksu.update(
    {
      studentStatus: STUDENT_STATUS.PENDING,
    },
    {
      where: {
        status: APPLICATION_STATUS.APPROVED,
        koordinatorStatus: COORDINATOR_STATUS.APPROVED,
        kompanijaStatus: COMPANY_STATUS.APPROVED,
        [Op.or]: [
          { studentStatus: null },
          { studentStatus: STUDENT_STATUS.UNAVAILABLE },
          blankStatus,
        ],
      },
    }
  );

  await PrijavaNaPraksu.update(
    {
      studentStatus: STUDENT_STATUS.UNAVAILABLE,
    },
    {
      where: {
        [Op.or]: [
          { studentStatus: null },
          blankStatus,
        ],
      },
    }
  );
}

module.exports = {
  APPLICATION_STATUS,
  COORDINATOR_STATUS,
  COMPANY_STATUS,
  STUDENT_STATUS,
  ACTIVE_APPLICATION_STATUSES,
  COMPANY_ACTIONABLE_STATUSES,
  COMPANY_BLOCKING_STATUSES,
  COORDINATOR_PENDING_STATUSES,
  FINAL_REJECTED_STATUSES,
  STUDENT_BLOCKING_STATUSES,
  backfillApplicationStatuses,
  backfillStudentStatuses,
  canCompanyAct,
  canCompanyShortlist,
  isCoordinatorApproved,
  isCoordinatorPending,
  normalizeStatusFilter,
};
