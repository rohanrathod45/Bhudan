/**
 * Role definitions and per-role capabilities.
 * Order (lowest -> highest): viewer, field_officer, analyst,
 * disaster_authority, admin.
 */
const ROLES = {
  VIEWER: 'viewer',
  FIELD_OFFICER: 'field_officer',
  ANALYST: 'analyst',
  DISASTER_AUTHORITY: 'disaster_authority',
  ADMIN: 'admin',
};

const ROLE_LEVEL = {
  [ROLES.VIEWER]: 1,
  [ROLES.FIELD_OFFICER]: 2,
  [ROLES.ANALYST]: 3,
  [ROLES.DISASTER_AUTHORITY]: 4,
  [ROLES.ADMIN]: 5,
};

const ROLE_LABELS = {
  [ROLES.VIEWER]: 'Viewer',
  [ROLES.FIELD_OFFICER]: 'Field Officer',
  [ROLES.ANALYST]: 'Analyst',
  [ROLES.DISASTER_AUTHORITY]: 'Disaster Management Authority',
  [ROLES.ADMIN]: 'Admin',
};

/**
 * Capability flags: which roles may view/write data and run analyses.
 * Write actions (creating habitations, safe sites, relocation plans)
 * require at least ANALYST. User administration requires ADMIN.
 */
const CAN = {
  VIEW_DASHBOARD: [ROLES.VIEWER, ROLES.FIELD_OFFICER, ROLES.ANALYST, ROLES.DISASTER_AUTHORITY, ROLES.ADMIN],
  VIEW_RED_ZONES: [ROLES.VIEWER, ROLES.FIELD_OFFICER, ROLES.ANALYST, ROLES.DISASTER_AUTHORITY, ROLES.ADMIN],
  RUN_ANALYSIS: [ROLES.ANALYST, ROLES.DISASTER_AUTHORITY, ROLES.ADMIN],
  MANAGE_DATA: [ROLES.ANALYST, ROLES.DISASTER_AUTHORITY, ROLES.ADMIN],
  APPROVE_RELOCATION: [ROLES.DISASTER_AUTHORITY, ROLES.ADMIN],
  MANAGE_USERS: [ROLES.ADMIN],
};

const ROLES_API = {
  admin: 'admin',
  disaster_authority: 'disaster_authority',
  analyst: 'analyst',
  field_officer: 'field_officer',
  viewer: 'viewer',
};

module.exports = { ROLES, ROLE_LEVEL, ROLE_LABELS, CAN, ROLES_API };