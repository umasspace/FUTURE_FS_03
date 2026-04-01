import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { seedDatabase } from '../../../../../prisma/seed';

const ADMIN_EMAIL = 'admin@umascrm.com';
const ADMIN_PASSWORD = 'admin123';
const ADMIN_NAME = 'Admin';

async function ensureDatabaseReady() {
  try {
    const userCount = await db.user.count();
    if (userCount === 0) {
      await seedDatabase();
      console.log('Database seeded on first access');
    }
  } catch (err) {
    console.error('Failed to seed database:', err);
    // Fallback: just create admin user
    try {
      const existing = await db.user.findUnique({ where: { email: ADMIN_EMAIL } });
      if (!existing) {
        await db.user.create({
          data: {
            name: ADMIN_NAME,
            email: ADMIN_EMAIL,
            password: ADMIN_PASSWORD,
            role: 'admin',
          },
        });
        console.log('Created default admin user (fallback)');
      }
    } catch (err2) {
      console.error('Failed to create admin user:', err2);
    }
  }
}

let dbChecked = false;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    if (!dbChecked) {
      await ensureDatabaseReady();
      dbChecked = true;
    }

    const user = await db.user.findUnique({
      where: { email },
    });

    if (!user || user.password !== password) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Login failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
