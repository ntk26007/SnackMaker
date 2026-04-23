import { useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_PUBLIC_SUPABASE_URL,
  import.meta.env.VITE_PUBLIC_SUPABASE_ANON_KEY
);

interface AuthModalProps {
  mode: 'login' | 'signup';
  onClose: () => void;
  onSwitchMode: (mode: 'login' | 'signup') => void;
}

export default function AuthModal({ mode, onClose, onSwitchMode }: AuthModalProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      if (mode === 'signup') {
        if (password !== confirmPassword) {
          setError('Las contraseñas no coinciden');
          setLoading(false);
          return;
        }

        if (password.length < 6) {
          setError('La contraseña debe tener al menos 6 caracteres');
          setLoading(false);
          return;
        }

        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin,
          }
        });

        if (error) {
          setError(error.message);
        } else {
          // Check if email confirmation is required
          if (data.user && !data.session) {
            setSuccess('¡Cuenta creada! Por favor revisa tu email para confirmar tu cuenta antes de iniciar sesión.');
          } else {
            setSuccess('¡Cuenta creada e iniciada sesión exitosamente!');
          }
          setTimeout(() => {
            onClose();
            window.location.reload();
          }, 2000);
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          if (error.message.includes('Email not confirmed')) {
            setError('Debes confirmar tu email antes de iniciar sesión. Revisa tu bandeja de entrada.');
          } else if (error.message.includes('Invalid login credentials')) {
            setError('Email o contraseña incorrectos. Verifica tus datos.');
          } else {
            setError('Error al iniciar sesión: ' + error.message);
          }
        } else {
          setSuccess('¡Inicio de sesión exitoso!');
          setTimeout(() => {
            onClose();
            window.location.reload();
          }, 1000);
        }
      }
    } catch (err) {
      setError('Ocurrió un error inesperado');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-yellow-400 via-pink-400 to-blue-400 p-6 text-white text-center relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors cursor-pointer"
          >
            <i className="ri-close-line text-white"></i>
          </button>
          <h2 className="text-2xl font-bold mb-2">
            {mode === 'login' ? 'Iniciar Sesión' : 'Crear Cuenta'}
          </h2>
          <p className="text-white/90">
            {mode === 'login' 
              ? 'Accede a tu cuenta de SnackMaker' 
              : 'Únete a la comunidad de SnackMaker'
            }
          </p>
        </div>

        {/* Form */}
        <div className="p-8">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
              <p className="text-red-600 text-sm flex items-center">
                <i className="ri-error-warning-line mr-2"></i>
                {error}
              </p>
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
              <p className="text-green-600 text-sm flex items-center">
                <i className="ri-check-line mr-2"></i>
                {success}
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <i className="ri-mail-line mr-2"></i>
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@email.com"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <i className="ri-lock-line mr-2"></i>
                Contraseña
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all"
                required
              />
            </div>

            {mode === 'signup' && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <i className="ri-lock-line mr-2"></i>
                  Confirmar Contraseña
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all"
                  required
                />
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-pink-500 to-pink-600 text-white py-3 rounded-xl font-semibold hover:from-pink-600 hover:to-pink-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
            >
              {loading ? (
                <i className="ri-loader-4-line animate-spin mr-2"></i>
              ) : mode === 'login' ? (
                <i className="ri-login-circle-line mr-2"></i>
              ) : (
                <i className="ri-user-add-line mr-2"></i>
              )}
              {loading 
                ? 'Procesando...' 
                : mode === 'login' 
                  ? 'Iniciar Sesión' 
                  : 'Crear Cuenta'
              }
            </button>
          </form>

          {/* Switch Mode */}
          <div className="mt-6 text-center">
            <p className="text-gray-600">
              {mode === 'login' ? '¿No tienes cuenta?' : '¿Ya tienes cuenta?'}
            </p>
            <button
              onClick={() => onSwitchMode(mode === 'login' ? 'signup' : 'login')}
              className="text-pink-600 font-semibold hover:text-pink-700 transition-colors cursor-pointer mt-1"
            >
              {mode === 'login' ? 'Crear cuenta nueva' : 'Iniciar sesión'}
            </button>
          </div>

          {/* Features */}
          <div className="mt-8 bg-gradient-to-r from-yellow-50 via-pink-50 to-blue-50 rounded-2xl p-4">
            <h4 className="font-semibold text-gray-800 mb-3 text-center">
              <i className="ri-star-line text-yellow-500 mr-2"></i>
              Con tu cuenta podrás:
            </h4>
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex items-center">
                <i className="ri-check-line text-green-500 mr-2"></i>
                Guardar automáticamente tus snacks comprados
              </div>
              <div className="flex items-center">
                <i className="ri-check-line text-green-500 mr-2"></i>
                Ver estadísticas de tus ingredientes favoritos
              </div>
              <div className="flex items-center">
                <i className="ri-check-line text-green-500 mr-2"></i>
                Acceder a tu historial completo de compras
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
