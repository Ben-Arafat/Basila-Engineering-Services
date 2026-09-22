export const ADMIN_UIDS = [
  "tjoY9a9YqGQ8aU0Zbayc0OO93pp1",
  "WkUOa7wBFcfNtV0DGplD5OCgj7v1",
];

export const isAdmin = (user) => {
  return Boolean(user && ADMIN_UIDS.includes(user.uid));
};