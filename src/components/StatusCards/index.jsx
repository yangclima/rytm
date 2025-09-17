export function DatabaseStatusCard({
  version,
  maxConnections,
  openedConnections,
}) {
  return (
    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 shadow-2xl hover:bg-white/10 hover:border-white/20 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-purple-500/20">
      <h3 className="text-lg sm:text-xl font-semibold text-white/90 mb-2 leading-tight ">
        {'Database'}
      </h3>

      <p className="text-sm text-white/60">
        <span className="font-bold text-white/70">{'Versão: '}</span>
        {version}
      </p>
      <p className="text-sm text-white/60">
        <span className="font-bold text-white/70">
          {'Máximo de conexões: '}
        </span>
        {maxConnections}
      </p>
      <p className="text-sm text-white/60">
        <span className="font-bold text-white/70">{'Conexões abertas: '}</span>
        {openedConnections}
      </p>
    </div>
  );
}
