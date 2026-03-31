export type Member = {
  name: string;
  slack: string;
};

export type Developer = Member & {
  github: string;
};

export type FrontendConfig = {
  admins: Developer[];
  repos: string[];
};

export type DesignConfig = {
  admins: Member[];
};

export type Config = {
  frontend: FrontendConfig;
  design: DesignConfig;
};
