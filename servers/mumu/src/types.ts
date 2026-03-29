export type AdminUser = {
  github: string;
  slack: string;
};

export type RepositoryConfig = {
  repo: string;
  admins: AdminUser[];
};

export type Config = {
  admins: AdminUser[];
  repos: string[];
};
