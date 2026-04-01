import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = request.nextUrl;
    const query = searchParams.get('q') || '';

    if (!query.trim()) {
      return NextResponse.json({ contacts: [], companies: [], deals: [], tasks: [] });
    }

    const [contacts, companies, deals, tasks] = await Promise.all([
      db.contact.findMany({
        where: {
          OR: [
            { firstName: { contains: query } },
            { lastName: { contains: query } },
            { email: { contains: query } },
            { jobTitle: { contains: query } },
          ],
        },
        include: { company: true },
        take: 5,
      }),
      db.company.findMany({
        where: {
          OR: [
            { name: { contains: query } },
            { industry: { contains: query } },
            { website: { contains: query } },
          ],
        },
        include: { _count: { select: { contacts: true, deals: true } } },
        take: 5,
      }),
      db.deal.findMany({
        where: {
          OR: [
            { title: { contains: query } },
            { description: { contains: query } },
          ],
        },
        include: { contact: true, company: true },
        take: 5,
      }),
      db.task.findMany({
        where: {
          OR: [
            { title: { contains: query } },
            { description: { contains: query } },
          ],
        },
        include: { contact: true, deal: true },
        take: 5,
      }),
    ]);

    return NextResponse.json({ contacts, companies, deals, tasks });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Search failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
