import { useRouter } from 'next/router';
import React, { useState, useEffect } from 'react';

const AccountActivationPage = () => {
  // 'loading', 'success', 'error', 'expired', 'already-activated'
  const [activationState, setActivationState] = useState('loading');
  const [errorMessage, setErrorMessage] = useState('');
  const [userInfo, setUserInfo] = useState({});

  const router = useRouter();
  const token = router.query.token;

  useEffect(() => {
    if (!token) return;

    const activateAccount = async () => {
      try {
        const response = await fetch('/api/v1/activation', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
        });
        let responseBody;

        switch (response.status) {
          case 200:
            responseBody = await response.json();
            setActivationState('success');
            setUserInfo((prev) => {
              return { ...prev, ...responseBody };
            });
            break;
          case 409:
            setActivationState('already-activated');
            break;
          case 401:
            responseBody = await response.json();
            setActivationState('expired');
            setErrorMessage(responseBody.error.message);
            break;
          default:
            responseBody = await response.json();
            setActivationState('error');
            setErrorMessage(responseBody.error.message);
        }
      } catch (err) {
        console.error(err);
        setActivationState('error');
        setErrorMessage(
          'Erro interno do servidor. Tente novamente mais tarde.',
        );
      }
    };

    activateAccount();
  }, [token, router]);

  const LoadingState = () => (
    <div className="text-center">
      <div className="relative mb-8">
        <div className="w-16 h-16 mx-auto relative">
          <div className="absolute inset-0 border-4 border-white/20 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-transparent border-t-purple-400 border-r-purple-400 rounded-full animate-spin"></div>
        </div>
      </div>
      <h2 className="text-2xl font-bold text-white mb-4">
        Ativando sua conta...
      </h2>
      <p className="text-white/70 mb-6">
        Aguarde enquanto verificamos seu token de ativação
      </p>
      <div className="flex items-center justify-center gap-2 mt-4">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="w-2 h-2 bg-purple-400 rounded-full"
            style={{
              animation: `pulse 1.4s ease-in-out ${i * 0.16}s infinite`,
            }}
          ></div>
        ))}
      </div>
      <style jsx>{`
        @keyframes pulse {
          0%,
          80%,
          100% {
            transform: scale(0.8);
            opacity: 0.5;
          }
          40% {
            transform: scale(1.2);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );

  const SuccessState = () => (
    <div className="text-center">
      <div className="w-24 h-24 bg-gradient-to-r from-green-400 to-green-500 rounded-full flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-green-500/30">
        <svg
          className="w-12 h-12 text-white"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={3}
            d="M5 13l4 4L19 7"
          />
        </svg>
      </div>

      <h2 className="text-3xl font-bold text-white mb-4">
        🎉 Conta Ativada com Sucesso!
      </h2>
      <p className="text-white/80 text-lg mb-8">
        Parabéns <span className={'font-bold'}>{userInfo.username}</span>! Sua
        conta foi ativada e você já pode começar a usar o Rytm.
      </p>

      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <button
          onClick={() => (window.location.href = '/login')}
          className="px-8 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 rounded-xl font-semibold transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-purple-500/25"
        >
          Fazer Login
        </button>
      </div>
    </div>
  );

  const ErrorState = () => (
    <div className="text-left">
      <div className="w-24 h-24 bg-gradient-to-r from-red-400 to-red-500 rounded-full flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-red-500/30">
        <svg
          className="w-12 h-12 text-white"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={3}
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </div>

      <h2 className="text-3xl font-bold text-white mb-4 text-center">
        ❌ Falha na Ativação
      </h2>
      <p className="text-white/80 text-lg mb-6 text-center">
        Não foi possível ativar sua conta. Verifique as informações abaixo.
      </p>

      <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6 mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 bg-red-500/20 rounded-lg flex items-center justify-center">
            <svg
              className="w-4 h-4 text-red-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <div>
            <p className="text-red-400 font-medium">Erro de Ativação</p>
            <p className="text-red-300/80 text-sm">{errorMessage}</p>
          </div>
        </div>
      </div>
    </div>
  );

  const ExpiredState = () => (
    <div className="text-center">
      <div className="w-24 h-24 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-yellow-500/30">
        <svg
          className="w-12 h-12 text-white"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </div>

      <h2 className="text-3xl font-bold text-white mb-4">⏰ Link Expirado</h2>
      <p className="text-white/80 text-lg mb-6">
        Por motivos de segurança um novo email de ativação foi enviado.
      </p>

      <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-2xl p-6 mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 bg-yellow-500/20 rounded-lg flex items-center justify-center">
            <svg
              className="w-4 h-4 text-yellow-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <div>
            <p className="text-yellow-400 font-medium">
              Links de ativação são válidos por 15 minutos
            </p>
            <p className="text-yellow-300/80 text-sm">
              Por segurança, um novo link será enviado
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  const AlreadyActivatedState = () => (
    <div className="text-center">
      <div className="w-24 h-24 bg-gradient-to-r from-blue-400 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-blue-500/30">
        <svg
          className="w-12 h-12 text-white"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </div>

      <h2 className="text-3xl font-bold text-white mb-4">
        ✅ Conta Já Ativada
      </h2>
      <p className="text-white/80 text-lg mb-6">
        Sua conta já foi ativada anteriormente e está pronta para uso!
      </p>

      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <button
          onClick={() => (window.location.href = '/login')}
          className="px-8 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 rounded-xl font-semibold transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-purple-500/25"
        >
          Fazer Login
        </button>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activationState) {
      case 'loading':
        return <LoadingState />;
      case 'success':
        return <SuccessState />;
      case 'already-activated':
        return <AlreadyActivatedState />;
      case 'error':
        return <ErrorState />;
      case 'expired':
        return <ExpiredState />;
      default:
        return <LoadingState />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-400 to-pink-400 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-xl">R</span>
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Rytm
            </h1>
          </div>
          <p className="text-white/60 text-lg">Ativação de Conta</p>
        </div>

        {/* Main Content */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 sm:p-12 shadow-2xl">
          {renderContent()}
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-white/30 text-xs">
            © 2024 Rytm. Small steps, big patterns.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AccountActivationPage;
