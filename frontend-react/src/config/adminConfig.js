// List of institutional emails that should have admin privileges
export const ADMIN_EMAILS = [
  "jcesperanza@neu.edu.ph"
];

export const isAdminEmail = (email) => {
  return ADMIN_EMAILS.includes(email.toLowerCase());
};
