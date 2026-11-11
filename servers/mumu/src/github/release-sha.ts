import { SERVICES, type Service } from "../config";

export function releaseSha(service: Service, title: string): string | undefined {
  const match = title.match(/^(Crew|Playground) production · ([a-fA-F0-9]{40})$/);

  if (match?.[1] !== SERVICES[service].name) return undefined;

  return match[2].toLowerCase();
}
