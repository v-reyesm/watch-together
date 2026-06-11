export function buildInviteUrl(token: string, origin = window.location.origin) {
  return `${origin}/invites/${token}`;
}

export function buildInviteMailtoHref(
  listName: string,
  inviteUrl: string,
  recipientEmail = "",
) {
  const subject = `Te invito a "${listName}" en WatchTogether`;
  const body = [
    "Hola,",
    "",
    `Te comparto este enlace para unirte a la lista "${listName}" en WatchTogether:`,
    inviteUrl,
    "",
    "Nos vemos en la lista.",
  ].join("\n");

  // Encode the address so "?"/"&" or spaces cannot inject extra mailto
  // fields, but keep "@" readable: encoding it as %40 breaks some clients.
  const recipient = encodeURIComponent(recipientEmail.trim()).replace(
    /%40/g,
    "@",
  );
  return `mailto:${recipient}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

export async function copyInviteText(value: string) {
  const clipboard = navigator.clipboard?.writeText;
  if (!clipboard) {
    return false;
  }

  try {
    await clipboard.call(navigator.clipboard, value);
    return true;
  } catch {
    return false;
  }
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
