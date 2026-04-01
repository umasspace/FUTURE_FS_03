import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import type { Prisma } from '@prisma/client';

export async function GET(request: Request) {
  try {
    const { searchParams } = request.nextUrl;
    const stage = searchParams.get('stage') || '';

    const where: Prisma.DealWhereInput = {};

    if (stage) {
      where.stage = stage;
    }

    const deals = await db.deal.findMany({
      where,
      include: {
        contact: true,
        company: true,
        tasks: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(deals);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch deals';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const deal = await db.deal.create({
      data: body,
      include: {
        contact: true,
        company: true,
      },
    });
    return NextResponse.json(deal, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to create deal';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
