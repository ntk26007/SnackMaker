import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import Hero from './components/Hero';
import SnackCreator from './components/SnackCreator';
import PopularSnacks from './components/PopularSnacks';
import Footer from './components/Footer';
import AuthModal from '../../components/feature/AuthModal';
import { Link } from 'react-router-dom';
import Cart from '@/components/feature/Cart';
import InstallBanner from '../../components/feature/InstallBanner';

const supabase = createClient(
  import.meta.env.VITE_PUBLIC_SUPABASE_URL,
  import.meta.env.VITE_PUBLIC_SUPABASE_ANON_KEY
);

export default function HomePage() {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setLoading(false);
    };

    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleAuthClick = (mode: 'login' | 'signup') => {
    setAuthMode(mode);
    setShowAuthModal(true);
    setMenuOpen(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setMenuOpen(false);
  };

  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">

            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 flex items-center justify-center flex-shrink-0">
                <img
                  src="https://storage.readdy-site.link/project_files/62d206f0-feda-4a4d-a808-b79c7e6567c9/2d3f1ad2-3f9f-4832-8cbd-7d6bf3ffa4f7_Captura_de_pantalla_2026-04-15_154827-removebg-preview.png?v=5d39c16b6d3eb4cf95e6c5ae3eeb12d6"
                  alt="SnackMaker logo"
                  className="w-full h-full object-contain"
                />
              </div>
              <h1 className="text-xl font-bold text-gray-800" style={{ fontFamily: '"Pacifico", serif' }}>
                SnackMaker
              </h1>
            </div>

            {/* Enlaces escritorio */}
            <div className="hidden md:flex items-center space-x-6">
              <Link to="/" className="text-gray-600 hover:text-pink-600 transition-colors">Crear</Link>
              <Link to="/inventory" className="text-gray-600 hover:text-pink-600 transition-colors">Inventario y compras</Link>

              {/* ← Icono carrito: solo aparece si hay artículos, navega a /crear */}
              <Cart />

              {loading ? (
                <div className="animate-pulse bg-gray-200 h-8 w-20 rounded"></div>
              ) : user ? (
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-600">¡Hola, {user.email?.split('@')[0]}!</span>
                  <button onClick={handleLogout} className="bg-gray-100 text-gray-700 px-4 py-2 rounded-full hover:bg-gray-200 transition-all whitespace-nowrap">
                    <i className="ri-logout-circle-line mr-1"></i>Cerrar Sesión
                  </button>
                </div>
              ) : (
                <>
                  <button onClick={() => handleAuthClick('login')} className="text-gray-600 hover:text-pink-600 transition-colors">
                    Iniciar Sesión
                  </button>
                  <button onClick={() => handleAuthClick('signup')} className="bg-gradient-to-r from-pink-500 to-pink-600 text-white px-4 py-2 rounded-full hover:from-pink-600 hover:to-pink-700 transition-all whitespace-nowrap">
                    Registrarse
                  </button>
                </>
              )}
            </div>

            {/* Móvil: carrito + hamburguesa */}
            <div className="md:hidden flex items-center gap-2">
              <Cart />
              <button
                className="flex items-center justify-center w-10 h-10 text-gray-700"
                onClick={() => setMenuOpen(!menuOpen)}
              >
                <i className={`text-2xl ${menuOpen ? 'ri-close-line' : 'ri-menu-line'}`}></i>
              </button>
            </div>
          </div>
        </div>

        {/* Menú móvil desplegable */}
        {menuOpen && (
          <div className="md:hidden bg-white border-t border-gray-100 px-4 py-4 flex flex-col gap-4">
            <Link to="/" onClick={() => setMenuOpen(false)} className="text-gray-700 hover:text-pink-600 transition-colors py-2 border-b border-gray-100">
              Crear
            </Link>
            <Link to="/inventory" onClick={() => setMenuOpen(false)} className="text-gray-700 hover:text-pink-600 transition-colors py-2 border-b border-gray-100">
              Inventario y compras
            </Link>
            {loading ? (
              <div className="animate-pulse bg-gray-200 h-8 w-full rounded"></div>
            ) : user ? (
              <div className="flex flex-col gap-2">
                <span className="text-sm text-gray-600">¡Hola, {user.email?.split('@')[0]}!</span>
                <button onClick={handleLogout} className="bg-gray-100 text-gray-700 px-4 py-2 rounded-full hover:bg-gray-200 transition-all text-left">
                  <i className="ri-logout-circle-line mr-1"></i>Cerrar Sesión
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                <button onClick={() => handleAuthClick('login')} className="text-gray-700 hover:text-pink-600 transition-colors py-2 text-left">
                  Iniciar Sesión
                </button>
                <button onClick={() => handleAuthClick('signup')} className="bg-gradient-to-r from-pink-500 to-pink-600 text-white px-4 py-2 rounded-full hover:from-pink-600 hover:to-pink-700 transition-all text-center">
                  Registrarse
                </button>
              </div>
            )}
          </div>
        )}
      </nav>

      <Hero />
      <div id="snack-creator">
        <SnackCreator />
      </div>
      <PopularSnacks />
      <Footer />

      {showAuthModal && (
        <AuthModal
          mode={authMode}
          onClose={() => setShowAuthModal(false)}
          onSwitchMode={(mode) => setAuthMode(mode)}
        />
      )}
      <InstallBanner /> 
    </div>
  );
}