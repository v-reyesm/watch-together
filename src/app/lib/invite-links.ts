export function buildInviteUrl(token: string, origin = window.location.origin) {
  return `${origin}/invites/${token}`;
}

export function buildInviteMailtoHref(listName: string, inviteUrl: string) {
  const subject = `Te invito a "${listName}" en WatchTogether`;
  const body = [
    "Hola,",
    "",
    `Te comparto este enlace para unirte a la lista "${listName}" en WatchTogether:`,
    inviteUrl,
    "",
    "Nos vemos en la lista.",
  ].join("\n");

  return `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

export function inviteStatusLabel(status: "active" | "expired" | "revoked" | "used") {
  switch (status) {
    case "active":
      return "Activa";
    case "expired":
      return "Expirada";
    case "revoked":
      return "Revocada";
    case "used":
      return "Usada";
    default:
      return status;
  }
}

export function formatInviteDate(value: string) {
  return new Intl.DateTimeFormat("es-CL", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}
