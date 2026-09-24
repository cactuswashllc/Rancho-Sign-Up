import { getCurrentOrganizer } from "@/lib/auth";
import { toCsv } from "@/lib/csv";
import { toDateInputValue } from "@/lib/dates";
import { getEventForOrganizer } from "@/lib/events";
import { slugify } from "@/lib/slug";

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  if (!(await getCurrentOrganizer())) return new Response("Unauthorized", { status: 401 });
  const event = await getEventForOrganizer((await ctx.params).id);
  if (!event) return new Response("Not found", { status: 404 });

  const rows: (string | number)[][] = [
    ["Parent name", "Parent email", "Student name", "Grade", "Item", "Quantity", "Signed up"],
  ];
  for (const s of event.signups)
    for (const l of s.items)
      rows.push([
        s.parentName,
        s.parentEmail,
        s.studentName,
        s.grade,
        l.item.name,
        l.quantity,
        s.createdAt.toISOString(),
      ]);

  const filename = `${slugify(event.title)}-${toDateInputValue(event.eventDate)}-signups.csv`;
  return new Response("﻿" + toCsv(rows), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
