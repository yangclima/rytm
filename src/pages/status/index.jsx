'use client';

import { DatabaseStatusCard } from 'components/StatusCards';
import useSWR from 'swr';

async function fetchStatus(key) {
  const response = await fetch(key);
  const responBody = await response.json();
  return responBody;
}

export default function StatusPage() {
  const { data: statusData, isLoading } = useSWR(
    '/api/v1/status',
    fetchStatus,
    { refreshInterval: 5000 },
  );

  return isLoading ? (
    'loading...'
  ) : (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-400 to-pink-400 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-xl">R</span>
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Rytm
            </h1>
          </div>
          <p className="text-white/60 text-lg">
            Monitor de Status da Aplicação
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8 py-10">
          <DatabaseStatusCard
            version={statusData.dependencies.database.version}
            maxConnections={statusData.dependencies.database.max_connections}
            openedConnections={
              statusData.dependencies.database.opened_connections
            }
          />
        </div>

        <div className="text-center text-white/50 text-sm">
          <>
            Última atualização:{' '}
            {new Date(statusData.updated_at).toLocaleString('pt-br')}
            <br />
            <span className="text-xs">Auto-atualização a cada 5 segundos</span>
          </>
        </div>
      </div>
    </div>
  );
}
