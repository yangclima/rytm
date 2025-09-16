import { NextResponse } from 'next/server';
import migrator from 'models/migrator';

export async function GET() {
  const pendingMigrations = await migrator.listPendingMigrations();

  return NextResponse.json(
    { pending_migrations: pendingMigrations },
    { status: 200 },
  );
}

export async function POST() {
  const migratedMigrations = await migrator.runPendingMigrations();

  return NextResponse.json(
    { migrated_migrations: migratedMigrations },
    { status: migratedMigrations.length > 0 ? 201 : 200 },
  );
}
