import migrator from 'models/migrator';

async function GET() {
  const pendingMigrations = await migrator.listPendingMigrations();

  return { pending_migrations: pendingMigrations };
}

async function POST() {
  const migratedMigrations = await migrator.runPendingMigrations();

  return { migrated_migrations: migratedMigrations };
}

async function migrationsRouter(req, res) {
  if (req.method === 'GET') {
    const pendingMigrations = await GET();
    return res.status(200).json(pendingMigrations);
  }

  if (req.method === 'POST') {
    const migratedMigrations = await POST();
    return res.status(200).json(migratedMigrations);
  }
}

export default migrationsRouter;
