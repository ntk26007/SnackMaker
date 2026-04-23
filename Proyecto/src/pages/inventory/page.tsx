
import { useState, useEffect, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';
import Footer from '../home/components/Footer';
import AuthModal from '../../components/feature/AuthModal';

// Hook para animar un número desde 0 hasta el valor objetivo
function useCountUp(target: number, duration: number = 1200, decimals: number = 0) {
  const [current, setCurrent] = useState(0);
  const rafRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);

  useEffect(() => {
    if (target === 0) { setCurrent(0); return; }
    startTimeRef.current = null;

    const animate = (timestamp: number) => {
      if (!startTimeRef.current) startTimeRef.current = timestamp;
      const elapsed = timestamp - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1);
      // easeOutExpo para que desacelere al final
      const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      const value = eased * target;
      setCurrent(decimals > 0 ? Math.round(value * 100) / 100 : Math.floor(value));
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate);
      } else {
        setCurrent(target);
      }
    };

    rafRef.current = requestAnimationFrame(animate);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [target, duration, decimals]);

  return current;
}

const supabase = createClient(
  import.meta.env.VITE_PUBLIC_SUPABASE_URL,
  import.meta.env.VITE_PUBLIC_SUPABASE_ANON_KEY
);

interface Purchase {
  id: number;
  snack_name: string;
  snack_type: 'custom' | 'predefined';
  ingredients: any[];
  total_price: number;
  purchased_at: string;
  description: string;
}

interface Stats {
  total_purchases: number;
  total_spent: number;
  custom_snacks: number;
  predefined_snacks: number;
  favorite_ingredients: Record<string, number>;
}

export default function InventoryPage() {
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [statsVisible, setStatsVisible] = useState(false);
  const statsRef = useRef<HTMLDivElement | null>(null);

  // Contadores animados
  const countPurchases = useCountUp(statsVisible ? (stats?.total_purchases ?? 0) : 0, 1100);
  const countSpent = useCountUp(statsVisible ? (stats?.total_spent ?? 0) : 0, 1300, 2);
  const countCustom = useCountUp(statsVisible ? (stats?.custom_snacks ?? 0) : 0, 900);
  const countPredefined = useCountUp(statsVisible ? (stats?.predefined_snacks ?? 0) : 0, 1000);

  // Función para procesar los ingredientes
  const getIngredientsDisplay = (ingredients: any): Array<{name: string, quantity: number}> => {
    if (!ingredients) return [];
    
    try {
      // Si ingredients es un array
      if (Array.isArray(ingredients)) {
        return ingredients.map(ingredient => {
          // Si el ingrediente es un string JSON
          if (typeof ingredient === 'string') {
            try {
              const parsed = JSON.parse(ingredient);
              return {
                name: parsed.name || 'Ingrediente',
                quantity: parsed.quantity || 1
              };
            } catch {
              return { name: ingredient, quantity: 1 };
            }
          }
          // Si el ingrediente ya es un objeto
          return {
            name: ingredient.name || 'Ingrediente',
            quantity: ingredient.quantity || 1
          };
        });
      }
      
      // Si ingredients es un string JSON
      if (typeof ingredients === 'string') {
        const parsed = JSON.parse(ingredients);
        if (Array.isArray(parsed)) {
          return getIngredientsDisplay(parsed);
        }
        return [{ name: parsed.name || 'Ingrediente', quantity: parsed.quantity || 1 }];
      }
      
      // Si ingredients es un objeto simple
      return [{ name: ingredients.name || 'Ingrediente', quantity: ingredients.quantity || 1 }];
    } catch (error) {
      console.error('Error parsing ingredients:', error);
      return [];
    }
  };

  useEffect(() => {
    // Check if user is logged in
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      if (user) {
        fetchInventory(user.email!);
      }
    };

    checkUser();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null);
      if (session?.user) {
        fetchInventory(session.user.email!);
      } else {
        setPurchases([]);
        setStats(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchInventory = async (email: string) => {
    setLoading(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_PUBLIC_SUPABASE_URL}/functions/v1/get-user-inventory?email=${encodeURIComponent(email)}`,
        {
          headers: {
            'Authorization': `Bearer ${import.meta.env.VITE_PUBLIC_SUPABASE_ANON_KEY}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setPurchases(data.inventory || []);
        
        // Mapear los datos de estadísticas que vienen de la Edge Function
        if (data.stats) {
          const mappedStats: Stats = {
            total_purchases: data.stats.totalPurchases || 0,
            total_spent: data.stats.totalSpent || 0,
            custom_snacks: data.stats.customCount || 0,
            predefined_snacks: data.stats.predefinedCount || 0,
            favorite_ingredients: data.stats.favoriteIngredients ? 
              data.stats.favoriteIngredients.reduce((acc: Record<string, number>, item: any) => {
                acc[item.name] = item.count;
                return acc;
              }, {}) : {}
          };
          setStats(mappedStats);
        }
      }
    } catch (error) {
      console.error('Error fetching inventory:', error);
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // IntersectionObserver para disparar la animación cuando las cards entran en vista
  useEffect(() => {
    if (!stats) return;
    const node = statsRef.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setStatsVisible(true); observer.disconnect(); } },
      { threshold: 0.2 }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [stats]);

  const getFavoriteIngredients = () => {
    if (!stats?.favorite_ingredients) return [];
    return Object.entries(stats.favorite_ingredients)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-pink-50 to-blue-50">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center gap-3">
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
            </div>
            <div className="flex items-center space-x-6">
              <a href="/" className="text-gray-600 hover:text-pink-600 transition-colors cursor-pointer">
                Crear
              </a>
              <a href="/inventory" className="text-pink-600 font-semibold cursor-pointer">
                Inventario y compras
              </a>
              {user ? (
                <div className="flex items-center space-x-4">
                  <span className="text-gray-600 text-sm">
                    <i className="ri-user-line mr-1"></i>
                    {user.email}
                  </span>
                  <button
                    onClick={handleLogout}
                    className="text-gray-600 hover:text-pink-600 transition-colors cursor-pointer"
                  >
                    Cerrar Sesión
                  </button>
                </div>
              ) : (
                <>
                  <button
                    onClick={() => handleAuthClick('login')}
                    className="text-gray-600 hover:text-pink-600 transition-colors cursor-pointer"
                  >
                    Iniciar Sesión
                  </button>
                  <button
                    onClick={() => handleAuthClick('signup')}
                    className="bg-gradient-to-r from-pink-500 to-pink-600 text-white px-4 py-2 rounded-full hover:from-pink-600 hover:to-pink-700 transition-all cursor-pointer whitespace-nowrap"
                  >
                    Registrarse
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      <div className="pt-28 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
              Tu Inventario de
              <span className="text-pink-500"> Snacks</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Revisa todos los snacks que has comprado, tanto tus creaciones personalizadas como los favoritos del ranking
            </p>
          </div>

          {!user ? (
            // Not logged in - show login prompt
            <div className="bg-white rounded-3xl shadow-xl p-12 text-center">
              <div className="max-w-md mx-auto">
                <i className="ri-lock-line text-6xl text-gray-300 mb-6"></i>
                <h3 className="text-2xl font-bold text-gray-800 mb-4">
                  Inicia sesión para ver tu inventario
                </h3>
                <p className="text-gray-600 mb-8">
                  Necesitas una cuenta para guardar y ver tus snacks comprados
                </p>
                <div className="flex gap-4 justify-center">
                  <button
                    onClick={() => handleAuthClick('login')}
                    className="bg-gradient-to-r from-pink-500 to-pink-600 text-white px-8 py-3 rounded-full font-semibold hover:from-pink-600 hover:to-pink-700 transition-all cursor-pointer whitespace-nowrap"
                  >
                    <i className="ri-login-circle-line mr-2"></i>
                    Iniciar Sesión
                  </button>
                  <button
                    onClick={() => handleAuthClick('signup')}
                    className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-white px-8 py-3 rounded-full font-semibold hover:from-yellow-500 hover:to-yellow-600 transition-all cursor-pointer whitespace-nowrap"
                  >
                    <i className="ri-user-add-line mr-2"></i>
                    Registrarse
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* Stats Section */}
              {stats && (
                <div ref={statsRef} className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                  <div
                    className={`bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-2xl p-6 text-white transition-all duration-700 ${
                      statsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
                    }`}
                    style={{ transitionTimingFunction: 'cubic-bezier(0.22, 1, 0.36, 1)', transitionDelay: '0ms' }}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-yellow-100 text-sm font-medium">Total Compras</p>
                        <p className="text-3xl font-bold tabular-nums">{countPurchases}</p>
                      </div>
                      <i className="ri-shopping-bag-3-line text-3xl text-yellow-200"></i>
                    </div>
                  </div>

                  <div
                    className={`bg-gradient-to-br from-pink-400 to-pink-500 rounded-2xl p-6 text-white transition-all duration-700 ${
                      statsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
                    }`}
                    style={{ transitionTimingFunction: 'cubic-bezier(0.22, 1, 0.36, 1)', transitionDelay: '120ms' }}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-pink-100 text-sm font-medium">Total Gastado</p>
                        <p className="text-3xl font-bold tabular-nums">${countSpent.toFixed(2)}</p>
                      </div>
                      <i className="ri-money-dollar-circle-line text-3xl text-pink-200"></i>
                    </div>
                  </div>

                  <div
                    className={`bg-gradient-to-br from-blue-400 to-blue-500 rounded-2xl p-6 text-white transition-all duration-700 ${
                      statsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
                    }`}
                    style={{ transitionTimingFunction: 'cubic-bezier(0.22, 1, 0.36, 1)', transitionDelay: '240ms' }}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-blue-100 text-sm font-medium">Snacks Personalizados</p>
                        <p className="text-3xl font-bold tabular-nums">{countCustom}</p>
                      </div>
                      <i className="ri-magic-line text-3xl text-blue-200"></i>
                    </div>
                  </div>

                  <div
                    className={`bg-gradient-to-br from-purple-400 to-purple-500 rounded-2xl p-6 text-white transition-all duration-700 ${
                      statsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
                    }`}
                    style={{ transitionTimingFunction: 'cubic-bezier(0.22, 1, 0.36, 1)', transitionDelay: '360ms' }}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-purple-100 text-sm font-medium">Del Ranking</p>
                        <p className="text-3xl font-bold tabular-nums">{countPredefined}</p>
                      </div>
                      <i className="ri-trophy-line text-3xl text-purple-200"></i>
                    </div>
                  </div>
                </div>
              )}

              {/* Favorite Ingredients */}
              {stats && getFavoriteIngredients().length > 0 && (
                <div className="bg-white rounded-3xl shadow-xl p-8 mb-8">
                  <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">
                    <i className="ri-heart-fill text-red-500 mr-2"></i>
                    Tus Ingredientes Favoritos
                  </h3>
                  <div className="flex flex-wrap justify-center gap-4">
                    {getFavoriteIngredients().map(([ingredient, count]) => (
                      <div key={ingredient} className="bg-gradient-to-r from-yellow-100 to-pink-100 rounded-full px-6 py-3 border border-yellow-200">
                        <span className="font-semibold text-gray-700">{ingredient}</span>
                        <span className="ml-2 bg-pink-500 text-white text-xs px-2 py-1 rounded-full">{count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Purchases List */}
              <div className="bg-white rounded-3xl shadow-xl p-8">
                <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">
                  Historial de Compras
                </h3>
                
                {loading ? (
                  <div className="text-center py-12">
                    <i className="ri-loader-4-line text-4xl text-gray-400 animate-spin mb-4"></i>
                    <p className="text-gray-600">Cargando tu inventario...</p>
                  </div>
                ) : purchases.length === 0 ? (
                  <div className="text-center py-12">
                    <i className="ri-shopping-cart-line text-6xl text-gray-300 mb-4"></i>
                    <p className="text-xl text-gray-500 mb-2">No tienes compras registradas</p>
                    <p className="text-gray-400">¡Crea tu primer snack personalizado!</p>
                    <a 
                      href="/"
                      className="inline-block mt-6 bg-gradient-to-r from-pink-500 to-pink-600 text-white px-8 py-3 rounded-full font-semibold hover:from-pink-600 hover:to-pink-700 transition-all cursor-pointer whitespace-nowrap"
                    >
                      <i className="ri-magic-line mr-2"></i>
                      Crear Mi Primer Snack
                    </a>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {purchases.map((purchase, index) => (
                      <div key={`purchase-${purchase.id || index}`} className="border border-gray-200 rounded-2xl p-6 hover:shadow-lg transition-shadow">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-lg font-bold text-gray-800">{purchase.snack_name}</h3>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                purchase.snack_type === 'custom' 
                                  ? 'bg-pink-100 text-pink-700' 
                                  : 'bg-blue-100 text-blue-700'
                              }`}>
                                {purchase.snack_type === 'custom' ? 'Personalizado' : 'Del Ranking'}
                              </span>
                            </div>
                            
                            {purchase.description && (
                              <p className="text-gray-600 text-sm mb-3">{purchase.description}</p>
                            )}

                            {/* Ingredients */}
                            <div className="flex flex-wrap gap-1 mb-3">
                              {getIngredientsDisplay(purchase.ingredients).map((ingredient, idx) => (
                                <span
                                  key={idx}
                                  className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full text-xs"
                                >
                                  {ingredient.name} x{ingredient.quantity}
                                </span>
                              ))}
                            </div>

                            <p className="text-sm text-gray-500">
                              Comprado el {new Date(purchase.purchased_at).toLocaleDateString()}
                            </p>
                          </div>

                          <div className="text-right ml-4">
                            <p className="text-2xl font-bold text-pink-600">
                              ${(purchase.total_price || 0).toFixed(2)}
                            </p>
                            <p className="text-xs text-gray-500">Total gastado</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
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
