import { resolveApiBase } from "@/lib/api-base";

function filenameFromDisposition(header: string | null): string | null {
  if (!header) return null;
  const utf8 = header.match(/filename\*=UTF-8''([^;]+)/i);
  if (utf8?.[1]) {
    try {
      return decodeURIComponent(utf8[1]);
    } catch {
      /* ignore */
    }
  }
  const plain = header.match(/filename="([^"]+)"/i);
  return plain?.[1] ?? null;
}

export async function downloadAdminFile(
  path: string,
  token: string,
): Promise<{ filename: string; total?: number }> {
  const res = await fetch(`${resolveApiBase()}${path}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    const text = await res.text();
    let message = `Erro ${res.status}`;
    try {
      const err = JSON.parse(text) as { error?: string };
      if (err.error) message = err.error;
    } catch {
      if (text.trim()) message = text.slice(0, 200);
    }
    throw new Error(message);
  }

  const blob = await res.blob();
  const totalHeader = res.headers.get("X-Export-Total");
  const total = totalHeader ? Number(totalHeader) : undefined;

  const filename =
    filenameFromDisposition(res.headers.get("Content-Disposition")) ??
    `export-${new Date().toISOString().slice(0, 10)}.csv`;

  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.rel = "noopener";
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);

  return { filename, total: Number.isFinite(total) ? total : undefined };
}
