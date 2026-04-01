import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const deal = await db.deal.findUnique({
      where: { id },
      include: {
        contact: true,
        company: true,
        tasks: true,
        activities: { orderBy: { createdAt: 'desc' } },
      },
    });

    if (!deal) {
      return NextResponse.json({ error: 'Deal not found' }, { status: 404 });
    }

    return NextResponse.json(deal);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch deal';
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

    const deal = await db.deal.update({
      where: { id },
      data: body,
      include: {
        contact: true,
        company: true,
      },
    });

    return NextResponse.json(deal);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to update deal';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await db.deal.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to delete deal';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
