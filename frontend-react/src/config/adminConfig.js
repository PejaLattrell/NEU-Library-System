// List of institutional emails that should have admin privileges
export const ADMIN_EMAILS = [
  "library.admin@neu.edu.ph",
  "pejalattrell.escares@neu.edu.ph"
];

export const isAdminEmail = (email) => {
  return ADMIN_EMAILS.includes(email.toLowerCase());
};
