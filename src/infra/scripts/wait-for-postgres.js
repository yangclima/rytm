import { exec } from 'node:child_process';

import { config } from 'dotenv';
config({
  path: '.env.development',
});

function checkPostgres() {
  exec(
    `docker exec localDB pg_isready --host ${process.env.POSTGRES_HOST}`,
    handleReturn,
  );

  function handleReturn(error, stdout) {
    if (stdout.search('accepting connections') === -1) {
      process.stdout.write('.');
      checkPostgres();
      return;
    }

    console.log('\n🟢 Postgres is ready\n');
  }
}

process.stdout.write('🔴 Awaiting for postgres');
checkPostgres();
