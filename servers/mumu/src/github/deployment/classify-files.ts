import { SERVICES, type Service } from "../../config";

export type ChangedFile = {
  filename: string;
  previous_filename?: string;
};

export function classifyFiles(files: ChangedFile[]): { services: Service[]; unclassified: boolean } {
  let hasCrewChanges = false;
  let hasPlaygroundChanges = false;
  let unclassified = false;
  let hasLockfile = false;

  for (const file of files) {
    for (const path of [file.filename, file.previous_filename]) {
      if (!path) continue;

      if (path.startsWith("apps/crew/") || path === SERVICES.crew.path) hasCrewChanges = true;
      else if (
        path.startsWith("apps/playground/") ||
        path === SERVICES.playground.path ||
        path === ".github/workflows/build.yml"
      )
        hasPlaygroundChanges = true;
      else if (path.startsWith("packages/ui/") || path.startsWith("packages/constant/")) {
        hasCrewChanges = true;
        hasPlaygroundChanges = true;
      } else if (path === "yarn.lock") hasLockfile = true;
      else unclassified = true;
    }
  }

  if (hasLockfile && !hasCrewChanges && !hasPlaygroundChanges) unclassified = true;

  const services: Service[] = [];
  if (hasCrewChanges) services.push("crew");
  if (hasPlaygroundChanges) services.push("playground");

  return { services, unclassified };
}
