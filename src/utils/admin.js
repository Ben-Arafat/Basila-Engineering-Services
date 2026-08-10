export const ADMIN_UID = "tjoY9a9YqGQ8aU0Zbayc0OO93pp1";

export const isAdmin = (user) => {
  return Boolean(user && user.uid === ADMIN_UID);
};