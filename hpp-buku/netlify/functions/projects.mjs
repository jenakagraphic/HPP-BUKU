import { getStore } from "@netlify/blobs";

export const config = { path: "/api/projects" };

const json = (data, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });

export default async (req) => {
  const store = getStore("projects");
  const url = new URL(req.url);

  if (req.method === "GET") {
    const { blobs } = await store.list();
    const items = await Promise.all(blobs.map((b) => store.get(b.key, { type: "json" })));
    items.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
    return json(items.filter(Boolean));
  }

  if (req.method === "POST") {
    const d = await req.json();
    const num = (v) => Math.max(0, Number(v) || 0);
    const item = {
      id: d.id || crypto.randomUUID(),
      judul: String(d.judul || "Tanpa judul").slice(0, 200),
      cetak: num(d.cetak),
      editor: num(d.editor),
      layouter: num(d.layouter),
      cover: num(d.cover),
      oplah: num(d.oplah),
      margin: num(d.margin),
      updatedAt: Date.now(),
    };
    await store.setJSON(item.id, item);
    return json(item);
  }

  if (req.method === "DELETE") {
    const id = url.searchParams.get("id");
    if (!id) return json({ error: "id wajib" }, 400);
    await store.delete(id);
    return json({ ok: true });
  }

  return json({ error: "Method tidak didukung" }, 405);
};
