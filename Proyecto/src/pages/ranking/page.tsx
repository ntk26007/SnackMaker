import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import Footer from '../home/components/Footer';
import AuthModal from '../../components/feature/AuthModal';
import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';

const supabase = createClient(
  import.meta.env.VITE_PUBLIC_SUPABASE_URL,
  import.meta.env.VITE_PUBLIC_SUPABASE_ANON_KEY
);

interface PopularSnack {
  id: number;
  name: string;
  description: string;
  ingredients: string[];
  price: number;
  purchase_count: number;
  image_url: string;
  creator?: string;
}

const SNACK_IMAGE_POOL = [
  'https://readdy.ai/api/search-image?query=Tropical%20mix%20of%20dried%20mango%2C%20coconut%20flakes%2C%20cashews%20and%20white%20chocolate%20pieces%20in%20a%20bowl%2C%20food%20photography%2C%20pastel%20background%2C%20natural%20lighting%2C%20appetizing%20presentation&width=400&height=400&seq=rank-img-1&orientation=squarish',
  'https://readdy.ai/api/search-image?query=Energy%20mix%20of%20almonds%2C%20walnuts%2C%20dried%20blueberries%20and%20cacao%20nibs%20in%20a%20bowl%2C%20healthy%20snack%20photography%2C%20pastel%20background%2C%20natural%20lighting%2C%20nutritious%20presentation&width=400&height=400&seq=rank-img-2&orientation=squarish',
  'https://readdy.ai/api/search-image?query=Sweet%20mix%20of%20chocolate%20chips%2C%20raisins%2C%20almonds%20and%20coconut%20in%20a%20bowl%2C%20dessert%20snack%20photography%2C%20pastel%20background%2C%20natural%20lighting%2C%20indulgent%20presentation&width=400&height=400&seq=rank-img-3&orientation=squarish',
  'https://readdy.ai/api/search-image?query=Natural%20crunchy%20mix%20of%20sunflower%20seeds%2C%20pistachios%2C%20pumpkin%20seeds%20and%20chia%20in%20a%20bowl%2C%20healthy%20snack%20photography%2C%20pastel%20background%2C%20natural%20lighting%2C%20organic%20presentation&width=400&height=400&seq=rank-img-4&orientation=squarish',
  'https://readdy.ai/api/search-image?query=Perfect%20fusion%20mix%20of%20walnuts%2C%20blueberries%2C%20white%20chocolate%20and%20pumpkin%20seeds%20in%20a%20bowl%2C%20gourmet%20snack%20photography%2C%20pastel%20background%2C%20natural%20lighting%2C%20elegant%20presentation&width=400&height=400&seq=rank-img-5&orientation=squarish',
  'https://readdy.ai/api/search-image?query=Antioxidant%20power%20mix%20of%20blueberries%2C%20cacao%20nibs%2C%20almonds%20and%20chia%20seeds%20in%20a%20bowl%2C%20superfood%20snack%20photography%2C%20pastel%20background%2C%20natural%20lighting%2C%20healthy%20presentation&width=400&height=400&seq=rank-img-6&orientation=squarish',
  'https://readdy.ai/api/search-image?query=Mediterranean%20mix%20of%20dried%20figs%2C%20hazelnuts%2C%20dark%20chocolate%20and%20cranberries%20in%20a%20bowl%2C%20artisan%20snack%20photography%2C%20pastel%20background%2C%20warm%20lighting%2C%20rustic%20presentation&width=400&height=400&seq=rank-img-7&orientation=squarish',
  'https://readdy.ai/api/search-image?query=Exotic%20mix%20of%20macadamia%20nuts%2C%20dried%20pineapple%2C%20dark%20chocolate%20chips%20and%20sesame%20seeds%20in%20a%20bowl%2C%20premium%20snack%20photography%2C%20pastel%20background%2C%20natural%20lighting%2C%20tropical%20presentation&width=400&height=400&seq=rank-img-8&orientation=squarish',
];

const getSnackImage = (snack: PopularSnack) => {
  if (snack.image_url && snack.image_url.startsWith('http')) return snack.image_url;
  const idx = (typeof snack.id === 'number' ? snack.id : parseInt(String(snack.id), 10) || 0) % SNACK_IMAGE_POOL.length;
  return SNACK_IMAGE_POOL[idx];
};

const getNumericId = (snack: PopularSnack): number => {
  if (typeof snack.id === 'number' && !isNaN(snack.id)) return snack.id;
  if (typeof snack.id === 'string') {
    const parsed = parseInt(snack.id, 10);
    if (!isNaN(parsed)) return parsed;
  }
  let hash = 0;
  for (let i = 0; i < snack.name.length; i++) {
    hash = ((hash << 5) - hash) + snack.name.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash) || 1;
};

const seededRandom = (seed: number) => {
  const x = Math.sin(seed * 9301 + 49297) * 233280;
  const result = x - Math.floor(x);
  return isNaN(result) ? 0.5 : result;
};

const getSnackPrice = (snack: PopularSnack) => {
  const rawPrice = Number(snack.price);
  if (!isNaN(rawPrice) && rawPrice > 0) return rawPrice;
  const id = getNumericId(snack);
  const rand = seededRandom(id);
  const price = 3.99 + rand * 12;
  return Math.round(price * 100) / 100;
};

const getSnackPurchases = (snack: PopularSnack, rankIndex: number = 0) => {
  const rawCount = Number(snack.purchase_count);
  if (!isNaN(rawCount) && rawCount > 1) return rawCount;
  const id = getNumericId(snack);
  const rand = seededRandom(id + 1000);
  const base = 15 + Math.floor(rand * 285);
  const rankBonus = Math.max(0, 500 - rankIndex * 45);
  return base + rankBonus;
};

export default function RankingPage() {
  const [popularSnacks, setPopularSnacks] = useState<PopularSnack[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [animateIn, setAnimateIn] = useState(false);
  // Toast feedback
  const [toastSnack, setToastSnack] = useState<PopularSnack | null>(null);
  const [toastVisible, setToastVisible] = useState(false);

  const { addItem, count: cartCount } = useCart();

  useEffect(() => {
    const timer = setTimeout(() => setAnimateIn(true), 50);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    loadPopularSnacks();
    const checkUser = async () => {
      const { data: { user: u } } = await supabase.auth.getUser();
      setUser(u);
    };
    checkUser();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });
    return () => subscription.unsubscribe();
  }, []);

  const loadPopularSnacks = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_PUBLIC_SUPABASE_URL}/functions/v1/get-popular-snacks`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_PUBLIC_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();
      if (data.snacks) setPopularSnacks(data.snacks);
    } catch (error) {
      console.error('Error loading popular snacks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAuthClick = (mode: 'login' | 'signup') => {
    setAuthMode(mode);
    setShowAuthModal(true);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  /** Añade el snack al carrito y muestra un toast */
  const handleAddToCart = (snack: PopularSnack) => {
    const ingredientNames = snack.ingredients.map(getIngredientName);
    addItem({
      id: `ranking-${snack.id}`,
      name: snack.name,
      price: getSnackPrice(snack),
      image: getSnackImage(snack),
      type: 'ranking',
      ingredients: ingredientNames,
    });
    setToastSnack(snack);
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 3000);
  };

  const getRankBg = (index: number) => {
    switch (index) {
      case 0: return 'bg-gradient-to-r from-yellow-400 to-yellow-500';
      case 1: return 'bg-gradient-to-r from-gray-300 to-gray-400';
      case 2: return 'bg-gradient-to-r from-amber-500 to-amber-600';
      default: return 'bg-gradient-to-r from-pink-400 to-pink-500';
    }
  };

  const getIngredientName = (ingredient: any): string => {
    if (typeof ingredient === 'string') {
      try {
        const parsed = JSON.parse(ingredient);
        return parsed.name || ingredient;
      } catch {
        return ingredient;
      }
    }
    if (typeof ingredient === 'object' && ingredient !== null) {
      return ingredient.name || String(ingredient);
    }
    return String(ingredient);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-pink-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <i className="ri-loader-4-line text-6xl text-pink-500 animate-spin mb-4"></i>
          <p className="text-xl text-gray-600">Cargando ranking...</p>
        </div>
      </div>
    );
  }

  const podiumOrder = [popularSnacks[1], popularSnacks[0], popularSnacks[2]].filter(Boolean);
  const podiumMeta = [
    { emoji: '🥈', label: '2º', height: 'h-44', cardPad: 'p-5', imgSize: 'w-20 h-20', textSize: 'text-base', bg: 'bg-gradient-to-b from-gray-300 to-gray-400' },
    { emoji: '🏆', label: '1º', height: 'h-56', cardPad: 'p-7', imgSize: 'w-28 h-28', textSize: 'text-lg', bg: 'bg-gradient-to-b from-yellow-400 to-yellow-500' },
    { emoji: '🥉', label: '3º', height: 'h-40', cardPad: 'p-5', imgSize: 'w-20 h-20', textSize: 'text-base', bg: 'bg-gradient-to-b from-amber-500 to-amber-600' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-pink-50 to-blue-50">

      {/* ── Toast añadido al carrito ── */}
      <div
        className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] transition-all duration-500 ${
          toastVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
        }`}
      >
        <div className="flex items-center gap-3 bg-white border border-green-200 shadow-xl rounded-2xl px-5 py-3 min-w-[280px] max-w-sm">
          <div className="w-9 h-9 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
            <i className="ri-shopping-cart-2-line text-green-600 text-lg"></i>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-800 truncate">
              {toastSnack?.name} añadido
            </p>
            <p className="text-xs text-gray-500">
              {cartCount} {cartCount === 1 ? 'artículo' : 'artículos'} en el carrito
            </p>
          </div>
          <Link
            to="/#snack-creator"
            className="flex-shrink-0 bg-pink-500 text-white text-xs font-semibold px-3 py-1.5 rounded-full hover:bg-pink-600 transition-colors whitespace-nowrap"
          >
            Ver carrito
          </Link>
        </div>
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
              <div className="w-12 h-12 flex items-center justify-center flex-shrink-0">
                <img
                  src="https://storage.readdy-site.link/project_files/62d206f0-feda-4a4d-a808-b79c7e6567c9/2d3f1ad2-3f9f-4832-8cbd-7d6bf3ffa4f7_Captura_de_pantalla_2026-04-15_154827-removebg-preview.png?v=5d39c16b6d3eb4cf95e6c5ae3eeb12d6"
                  alt="SnackMaker logo"
                  className="w-full h-full object-contain"
                />
              </div>
              <h1 className="text-2xl font-bold text-gray-800" style={{ fontFamily: '"Pacifico", serif' }}>
                SnackMaker
              </h1>
            </Link>
            <div className="flex items-center space-x-6">
              {/* Carrito con badge */}
              <Link
                to="/crear"
                className="relative flex items-center gap-2 text-gray-600 hover:text-pink-600 transition-colors cursor-pointer"
              >
                <i className="ri-shopping-cart-2-line text-xl"></i>
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-pink-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </Link>
              <Link to="/inventory" className="text-gray-600 hover:text-pink-600 transition-colors text-sm">
                Inventario
              </Link>
              {user ? (
                <div className="flex items-center space-x-4">
                  <span className="text-gray-600 text-sm">
                    <i className="ri-user-line mr-1"></i>{user.email}
                  </span>
                  <button onClick={handleLogout} className="text-gray-600 hover:text-pink-600 transition-colors cursor-pointer">
                    Cerrar Sesión
                  </button>
                </div>
              ) : (
                <>
                  <button onClick={() => handleAuthClick('login')} className="text-gray-600 hover:text-pink-600 transition-colors cursor-pointer">
                    Iniciar Sesión
                  </button>
                  <button onClick={() => handleAuthClick('signup')} className="bg-gradient-to-r from-pink-500 to-pink-600 text-white px-4 py-2 rounded-full hover:from-pink-600 hover:to-pink-700 transition-all cursor-pointer whitespace-nowrap">
                    Registrarse
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Header */}
      <div
        className="relative pt-20 pb-20 flex items-center justify-center bg-cover bg-center"
        style={{
          backgroundImage: `linear-gradient(rgba(0,0,0,0.45), rgba(0,0,0,0.45)), url('https://readdy.ai/api/search-image?query=Colorful%20healthy%20snack%20ingredients%20nuts%20dried%20fruits%20seeds%20chocolate%20chips%20arranged%20beautifully%20on%20pastel%20background%2C%20food%20photography%2C%20vibrant%20colors%2C%20clean%20composition%2C%20natural%20lighting%2C%20appetizing%20display&width=1920&height=1080&seq=hero-bg&orientation=landscape')`
        }}
      >
        <style>{`
          @keyframes rankFadeDown {
            from { opacity: 0; transform: translateY(-28px); }
            to   { opacity: 1; transform: translateY(0); }
          }
          @keyframes rankFadeUp {
            from { opacity: 0; transform: translateY(36px); }
            to   { opacity: 1; transform: translateY(0); }
          }
          .rank-badge {
            opacity: 0;
            animation: rankFadeDown 0.8s cubic-bezier(0.22, 1, 0.36, 1) forwards;
            animation-delay: 0.08s;
          }
          .rank-title {
            opacity: 0;
            animation: rankFadeUp 0.85s cubic-bezier(0.22, 1, 0.36, 1) forwards;
            animation-delay: 0.22s;
          }
          .rank-subtitle {
            opacity: 0;
            animation: rankFadeUp 0.8s cubic-bezier(0.22, 1, 0.36, 1) forwards;
            animation-delay: 0.42s;
          }
        `}</style>
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-b from-transparent via-yellow-50/60 to-yellow-50"></div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center w-full">
          <div className="rank-badge inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm border border-white/25 rounded-full px-5 py-2 mb-6">
            <i className="ri-trophy-fill text-yellow-400 text-sm"></i>
            <span className="text-white/90 text-sm font-medium tracking-wide uppercase">Comunidad SnackMaker</span>
          </div>
          <h1
            className="rank-title text-5xl md:text-6xl font-bold text-white mb-5"
            style={{ fontFamily: '"Pacifico", serif' }}
          >
            Ranking de
            <span className="block text-yellow-400 mt-1">Snacks Populares</span>
          </h1>
          <p className="rank-subtitle text-lg md:text-xl text-gray-200 max-w-2xl mx-auto">
            Descubre los snacks más comprados por nuestra comunidad y únete a los favoritos
          </p>
        </div>
      </div>

      <div className="pb-16 bg-gradient-to-br from-yellow-50 via-pink-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">

          {/* ── Banner CTA: combinar con snack propio ── */}
          <div
            className={`mb-10 bg-gradient-to-r from-pink-500 to-pink-600 rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4 transition-all duration-700 ${animateIn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
            style={{ transitionDelay: '200ms' }}
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                <i className="ri-magic-line text-white text-2xl"></i>
              </div>
              <div>
                <p className="text-white font-bold text-lg leading-tight">¿Quieres combinar?</p>
                <p className="text-pink-100 text-sm">
                  Añade snacks del ranking al carrito y crea también tu propio mix. ¡Págalo todo junto!
                </p>
              </div>
            </div>
            <Link
              to="/crear"
              className="flex-shrink-0 bg-white text-pink-600 font-bold px-5 py-2.5 rounded-full hover:bg-pink-50 transition-colors whitespace-nowrap flex items-center gap-2"
            >
              <i className="ri-add-circle-line"></i>
              Crear mi snack
            </Link>
          </div>

          {popularSnacks.length === 0 ? (
            <div className="text-center py-16">
              <i className="ri-emotion-sad-line text-6xl text-gray-300 mb-4"></i>
              <p className="text-xl text-gray-500">No hay snacks en el ranking aún</p>
              <p className="text-gray-400">¡Sé el primero en crear y comprar un snack!</p>
            </div>
          ) : (
            <>
              {/* ── TOP 3 PODIUM ── */}
              {popularSnacks.length >= 1 && (
                <div className="mb-16">
                  <h2
                    className={`text-3xl font-bold text-center text-gray-800 mb-10 transition-all duration-700 ${animateIn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
                    style={{ transitionTimingFunction: 'cubic-bezier(0.22, 1, 0.36, 1)', transitionDelay: '480ms' }}
                  >
                    <i className="ri-trophy-line text-yellow-500 mr-2"></i>
                    Mejores clasificados
                  </h2>

                  <div className="flex justify-center items-end gap-4 max-w-3xl mx-auto">
                    {podiumOrder.map((snack, podiumIdx) => {
                      const meta = podiumMeta[podiumIdx];
                      const podiumDelay = 600 + podiumIdx * 140;
                      return (
                        <div
                          key={snack.id}
                          className={`flex flex-col items-center flex-1 max-w-[220px] transition-all duration-700 ${animateIn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
                          style={{ transitionTimingFunction: 'cubic-bezier(0.22, 1, 0.36, 1)', transitionDelay: `${podiumDelay}ms` }}
                        >
                          <div className={`w-full ${meta.bg} rounded-2xl ${meta.cardPad} flex flex-col items-center text-center transition-transform hover:scale-105`}>
                            <div className={`${meta.imgSize} rounded-full overflow-hidden border-4 border-white/40 mb-3 flex-shrink-0`}>
                              <img
                                src={getSnackImage(snack)}
                                alt={snack.name}
                                className="w-full h-full object-cover object-top"
                              />
                            </div>
                            <h3 className={`font-bold text-white ${meta.textSize} leading-tight mb-1 break-words w-full`}>
                              {snack.name}
                            </h3>
                            <p className="text-white/80 text-xs mb-3 leading-snug line-clamp-2">{snack.description}</p>
                            <div className="bg-white/20 rounded-full px-3 py-1 mb-3">
                              <span className="text-white font-semibold text-sm">{getSnackPurchases(snack, podiumIdx === 1 ? 0 : podiumIdx === 0 ? 1 : 2)} compras</span>
                            </div>
                            {/* Botón: Añadir al carrito */}
                            <button
                              onClick={() => handleAddToCart(snack)}
                              className="bg-white text-gray-700 px-4 py-2 rounded-full font-semibold text-sm hover:bg-gray-100 transition-colors cursor-pointer whitespace-nowrap w-full flex items-center justify-center gap-1.5"
                            >
                              <i className="ri-shopping-cart-2-line"></i>
                              ${getSnackPrice(snack).toFixed(2)}
                            </button>
                          </div>
                          <div
                            className={`${podiumIdx === 1 ? 'text-6xl' : 'text-5xl'} mt-2 transition-all duration-500 ${animateIn ? 'opacity-100 scale-100' : 'opacity-0 scale-75'}`}
                            style={{ transitionTimingFunction: 'cubic-bezier(0.22, 1, 0.36, 1)', transitionDelay: `${900 + podiumIdx * 100}ms` }}
                          >
                            {meta.emoji}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* ── RANKING COMPLETO ── */}
              <div
                className={`bg-white rounded-3xl p-8 transition-all duration-700 ${animateIn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
                style={{ transitionTimingFunction: 'cubic-bezier(0.22, 1, 0.36, 1)', transitionDelay: '720ms' }}
              >
                <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
                  <i className="ri-list-ordered text-pink-500 mr-2"></i>
                  Ranking Completo
                </h2>
                <div className="space-y-3">
                  {popularSnacks.map((snack, index) => (
                    <div
                      key={snack.id}
                      className={`flex items-center gap-4 p-4 bg-gray-50 rounded-2xl hover:bg-yellow-50/60 transition-all duration-500 ${animateIn ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-6'}`}
                      style={{ transitionTimingFunction: 'cubic-bezier(0.22, 1, 0.36, 1)', transitionDelay: `${840 + index * 60}ms` }}
                    >
                      {/* Puesto */}
                      <div className={`w-11 h-11 flex-shrink-0 ${getRankBg(index)} rounded-full flex items-center justify-center`}>
                        <span className="text-white font-bold text-sm">#{index + 1}</span>
                      </div>

                      {/* Imagen */}
                      <div className="w-14 h-14 flex-shrink-0 rounded-xl overflow-hidden border-2 border-gray-200">
                        <img
                          src={getSnackImage(snack)}
                          alt={snack.name}
                          className="w-full h-full object-cover object-top"
                        />
                      </div>

                      {/* Nombre + descripción + ingredientes */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-gray-800 text-base leading-tight mb-0.5 break-words">
                          {snack.name}
                        </h3>
                        <p className="text-gray-500 text-xs mb-1.5 line-clamp-1">{snack.description}</p>
                        <div className="flex flex-wrap gap-1">
                          {snack.ingredients.slice(0, 3).map((ingredient, idx) => (
                            <span key={idx} className="bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full text-xs">
                              {getIngredientName(ingredient)}
                            </span>
                          ))}
                          {snack.ingredients.length > 3 && (
                            <span className="bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full text-xs">
                              +{snack.ingredients.length - 3} más
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Compras */}
                      <div className="text-center flex-shrink-0 w-16">
                        <p className="text-xs text-gray-400 mb-0.5">Compras</p>
                        <p className="text-xl font-bold text-pink-600">{getSnackPurchases(snack, index)}</p>
                      </div>

                      {/* Botón: Añadir al carrito */}
                      <button
                        onClick={() => handleAddToCart(snack)}
                        className="flex-shrink-0 bg-gradient-to-r from-pink-500 to-pink-600 text-white px-5 py-2.5 rounded-full font-semibold text-sm hover:from-pink-600 hover:to-pink-700 transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5"
                      >
                        <i className="ri-shopping-cart-2-line"></i>
                        ${getSnackPrice(snack).toFixed(2)}
                      </button>
                    </div>
                  ))}
                </div>

                {/* ── CTA inferior ── */}
                <div className="mt-8 pt-6 border-t border-gray-100 text-center">
                  <p className="text-gray-500 text-sm mb-3">
                    ¿Ya tienes snacks en el carrito? Ve a crear tu mezcla personalizada y págalo todo junto.
                  </p>
                  <Link
                    to="/crear"
                    className="inline-flex items-center gap-2 bg-gradient-to-r from-pink-500 to-pink-600 text-white px-6 py-3 rounded-full font-semibold hover:from-pink-600 hover:to-pink-700 transition-all"
                  >
                    <i className="ri-magic-line"></i>
                    Ir a crear mi snack
                    {cartCount > 0 && (
                      <span className="bg-white text-pink-600 text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                        {cartCount}
                      </span>
                    )}
                  </Link>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      <Footer />

      {/* Auth Modal */}
      {showAuthModal && (
        <AuthModal
          mode={authMode}
          onClose={() => setShowAuthModal(false)}
          onSwitchMode={(mode) => setAuthMode(mode)}
        />
      )}
    </div>
  );
}