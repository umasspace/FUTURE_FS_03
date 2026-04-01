import { NextResponse } from 'next/server';
import { seedDatabase } from '../../../../prisma/seed';

export async function POST() {
  try {
    await seedDatabase();
    return NextResponse.json({ success: true, message: 'Database seeded successfully' });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to seed database';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET() {
  return POST();
}
