import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const contact = await db.contact.findUnique({
      where: { id },
      include: {
        company: true,
        deals: { include: { company: true } },
        tasks: true,
        activities: { orderBy: { createdAt: 'desc' } },
      },
    });

    if (!contact) {
      return NextResponse.json({ error: 'Contact not found' }, { status: 404 });
    }

    return NextResponse.json(contact);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch contact';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const contact = await db.contact.update({
      where: { id },
      data: body,
      include: { company: true },
    });

    return NextResponse.json(contact);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to update contact';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await db.contact.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to delete contact';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
