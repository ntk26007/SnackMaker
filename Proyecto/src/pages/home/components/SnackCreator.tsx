import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useScrollReveal } from '@/hooks/useScrollReveal';

const supabase = createClient(
  import.meta.env.VITE_PUBLIC_SUPABASE_URL,
  import.meta.env.VITE_PUBLIC_SUPABASE_ANON_KEY
);

interface Ingredient {
  id: string;
  name: string;
  category: string;
  price: number;
  image_url: string;
  color: string;
}

const snackNames = [
  'Delicia Crujiente', 'Mix Supremo', 'Energía Dorada', 'Fusión Perfecta', 'Sabor Celestial',
  'Mezcla Mágica', 'Tentación Dulce', 'Explosión Natural', 'Harmony Mix', 'Poder Nutritivo',
  'Dulce Aventura', 'Crunch Divino', 'Energía Pura', 'Sabor Único', 'Mix Especial'
];

const scrollStyles = `
  @keyframes revealUp {
    from { opacity: 0; transform: translateY(40px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes revealLeft {
    from { opacity: 0; transform: translateX(-40px); }
    to   { opacity: 1; transform: translateX(0); }
  }
  @keyframes revealRight {
    from { opacity: 0; transform: translateX(40px); }
    to   { opacity: 1; transform: translateX(0); }
  }
  @keyframes revealScale {
    from { opacity: 0; transform: scale(0.92); }
    to   { opacity: 1; transform: scale(1); }
  }
  .reveal-up {
    opacity: 0;
    animation: revealUp 0.7s cubic-bezier(0.22, 1, 0.36, 1) forwards;
  }
  .reveal-left {
    opacity: 0;
    animation: revealLeft 0.75s cubic-bezier(0.22, 1, 0.36, 1) forwards;
  }
  .reveal-right {
    opacity: 0;
    animation: revealRight 0.75s cubic-bezier(0.22, 1, 0.36, 1) forwards;
  }
  .reveal-scale {
    opacity: 0;
    animation: revealScale 0.65s cubic-bezier(0.22, 1, 0.36, 1) forwards;
  }
  .delay-0  { animation-delay: 0s; }
  .delay-1  { animation-delay: 0.08s; }
  .delay-2  { animation-delay: 0.16s; }
  .delay-3  { animation-delay: 0.24s; }
  .delay-4  { animation-delay: 0.32s; }
  .delay-5  { animation-delay: 0.40s; }
  .delay-6  { animation-delay: 0.48s; }
`;

export default function SnackCreator() {
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [selectedIngredients, setSelectedIngredients] = useState<{[key: string]: number}>({});
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');
  const [snackName, setSnackName] = useState<string>('');
  const [showPurchase, setShowPurchase] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [purchaseSuccess, setPurchaseSuccess] = useState(false);
  const [successVisible, setSuccessVisible] = useState(false);

  const { ref: headerRef, isVisible: headerVisible } = useScrollReveal({ threshold: 0.2 });
  const { ref: gridRef, isVisible: gridVisible } = useScrollReveal({ threshold: 0.1 });
  const { ref: summaryRef, isVisible: summaryVisible } = useScrollReveal({ threshold: 0.1 });

  useEffect(() => {
    loadIngredients();

    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadIngredients = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_PUBLIC_SUPABASE_URL}/functions/v1/get-ingredients`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_PUBLIC_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) throw new Error('Error al cargar ingredientes');
      const data = await response.json();
      if (data.ingredients) setIngredients(data.ingredients);
    } catch (error) {
      console.error('Error loading ingredients:', error);
    }
  };

  const categories = ['Todos', 'Frutos Secos', 'Frutas Deshidratadas', 'Chocolates', 'Semillas'];

  const filteredIngredients = selectedCategory === 'Todos'
    ? ingredients
    : ingredients.filter(ing => ing.category === selectedCategory);

  const addIngredient = (ingredientId: string) => {
    setSelectedIngredients(prev => ({ ...prev, [ingredientId]: (prev[ingredientId] || 0) + 1 }));
  };

  const removeIngredient = (ingredientId: string) => {
    setSelectedIngredients(prev => {
      const newState = { ...prev };
      if (newState[ingredientId] > 1) newState[ingredientId]--;
      else delete newState[ingredientId];
      return newState;
    });
  };

  const generateRandomName = () => {
    setSnackName(snackNames[Math.floor(Math.random() * snackNames.length)]);
  };

  const getTotalPrice = () =>
    Object.entries(selectedIngredients).reduce((total, [id, quantity]) => {
      const ingredient = ingredients.find(ing => ing.id === id);
      return total + (ingredient ? ingredient.price * quantity : 0);
    }, 0);

  const getSelectedIngredientsCount = () =>
    Object.values(selectedIngredients).reduce((total, quantity) => total + quantity, 0);

  const handlePurchase = () => {
    if (getSelectedIngredientsCount() === 0) { alert('¡Agrega al menos un ingrediente a tu snack!'); return; }
    if (!snackName.trim()) { alert('¡Genera un nombre para tu snack!'); return; }
    if (!user) { alert('¡Debes iniciar sesión para comprar snacks!'); return; }
    setShowPurchase(true);
  };

  const processPurchase = async () => {
    setLoading(true);
    try {
      const ingredientsData = Object.entries(selectedIngredients).map(([id, quantity]) => {
        const ingredient = ingredients.find(ing => ing.id === id);
        return { id, name: ingredient?.name, quantity, price: ingredient?.price, total: (ingredient?.price || 0) * quantity };
      });

      const response = await fetch(`${import.meta.env.VITE_PUBLIC_SUPABASE_URL}/functions/v1/create-snack`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_PUBLIC_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: snackName, userEmail: user.email, totalPrice: getTotalPrice(), ingredients: ingredientsData }),
      });

      const data = await response.json();
      if (data.success) {
        setShowPurchase(false);
        setPurchaseSuccess(true);
        setTimeout(() => setSuccessVisible(true), 30);
      } else alert('Error al procesar la compra: ' + (data.error || 'Error desconocido'));
    } catch (error) {
      console.error('Error processing purchase:', error);
      alert('Error al procesar la compra');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setShowPurchase(false);
    setPurchaseSuccess(false);
    setSuccessVisible(false);
    setSelectedIngredients({});
    setSnackName('');
  };

  return (
    <div className="min-h-screen py-12">
      <style>{scrollStyles}</style>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div ref={headerRef} className="text-center mb-12">
          {headerVisible && (
            <>
              <p className="reveal-up delay-0 text-sm font-semibold text-pink-500 uppercase tracking-widest mb-3">
                Tu creación
              </p>
              <h1 className="reveal-up delay-1 text-4xl font-bold text-gray-800 mb-4">
                Crea tu Snack Personalizado
              </h1>
              <p className="reveal-up delay-2 text-xl text-gray-600 max-w-2xl mx-auto">
                Selecciona tus ingredientes favoritos y crea la mezcla perfecta
              </p>
            </>
          )}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">

          {/* Ingredients Selection */}
          <div ref={gridRef} className="lg:col-span-2">
            {/* Category Filter */}
            {gridVisible && (
              <div className="reveal-up delay-0 mb-6">
                <div className="flex flex-wrap gap-2">
                  {categories.map(category => (
                    <button
                      key={category}
                      onClick={() => setSelectedCategory(category)}
                      className={`px-4 py-2 rounded-full transition-all whitespace-nowrap cursor-pointer ${
                        selectedCategory === category
                          ? 'bg-pink-500 text-white'
                          : 'bg-white text-gray-600 hover:bg-pink-50 border border-gray-200'
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Ingredients Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
              {gridVisible && filteredIngredients.map((ingredient, idx) => (
                <div
                  key={ingredient.id}
                  className={`reveal-scale delay-${Math.min(idx % 6, 6)} ${ingredient.color} rounded-2xl p-4 transition-all hover:scale-105`}
                >
                  <div className="text-center">
                    <img
                      src={ingredient.image_url}
                      alt={ingredient.name}
                      className="w-16 h-16 mx-auto mb-3 rounded-full object-cover object-top"
                    />
                    <h3 className="font-semibold text-gray-800 text-sm mb-1">{ingredient.name}</h3>
                    <p className="text-xs text-gray-600 mb-2">${ingredient.price.toFixed(2)}</p>
                    <div className="flex items-center justify-center space-x-2">
                      <button
                        onClick={() => removeIngredient(ingredient.id)}
                        className="w-8 h-8 bg-red-100 text-red-600 rounded-full flex items-center justify-center hover:bg-red-200 transition-colors cursor-pointer"
                        disabled={!selectedIngredients[ingredient.id]}
                      >
                        <i className="ri-subtract-line text-sm"></i>
                      </button>
                      <span className="w-8 text-center font-semibold">
                        {selectedIngredients[ingredient.id] || 0}
                      </span>
                      <button
                        onClick={() => addIngredient(ingredient.id)}
                        className="w-8 h-8 bg-green-100 text-green-600 rounded-full flex items-center justify-center hover:bg-green-200 transition-colors cursor-pointer"
                      >
                        <i className="ri-add-line text-sm"></i>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Snack Summary */}
          <div ref={summaryRef} className="lg:col-span-1">
            {summaryVisible && (
              <div className="reveal-right delay-1 bg-white rounded-2xl p-6 border border-gray-100 sticky top-24">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Tu Snack</h2>

                {/* Name Generator */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nombre del Snack</label>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={snackName}
                      onChange={(e) => setSnackName(e.target.value)}
                      placeholder="Nombre de tu snack"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent text-sm"
                    />
                    <button
                      onClick={generateRandomName}
                      className="px-3 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors cursor-pointer whitespace-nowrap"
                    >
                      <i className="ri-magic-line"></i>
                    </button>
                  </div>
                </div>

                {/* Selected Ingredients */}
                <div className="mb-6">
                  <h3 className="font-semibold text-gray-800 mb-3">Ingredientes Seleccionados</h3>
                  {Object.keys(selectedIngredients).length === 0 ? (
                    <p className="text-gray-500 text-sm">No has seleccionado ingredientes</p>
                  ) : (
                    <div className="space-y-2">
                      {Object.entries(selectedIngredients).map(([id, quantity]) => {
                        const ingredient = ingredients.find(ing => ing.id === id);
                        if (!ingredient) return null;
                        return (
                          <div key={id} className="flex justify-between items-center text-sm">
                            <span>{ingredient.name}</span>
                            <span className="font-semibold">{quantity}x ${(ingredient.price * quantity).toFixed(2)}</span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Total */}
                <div className="border-t pt-4 mb-6">
                  <div className="flex justify-between items-center text-lg font-bold">
                    <span>Total:</span>
                    <span className="text-pink-600">${getTotalPrice().toFixed(2)}</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{getSelectedIngredientsCount()} ingredientes</p>
                </div>

                {!user && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                    <p className="text-yellow-800 text-sm text-center">
                      <i className="ri-information-line mr-1"></i>
                      Inicia sesión para comprar snacks
                    </p>
                  </div>
                )}

                <button
                  onClick={handlePurchase}
                  className="w-full bg-gradient-to-r from-pink-500 to-pink-600 text-white py-3 rounded-lg font-semibold hover:from-pink-600 hover:to-pink-700 transition-all transform hover:scale-105 cursor-pointer whitespace-nowrap"
                >
                  <i className="ri-shopping-cart-line mr-2"></i>
                  Comprar Snack
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Purchase Modal */}
      {showPurchase && !purchaseSuccess && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full">
            <div className="text-center">
              <h3 className="text-2xl font-bold text-gray-800 mb-4">Finalizar Compra</h3>
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <p className="text-sm text-gray-600 mb-2">Snack: {snackName}</p>
                <p className="text-2xl font-bold text-pink-600">${getTotalPrice().toFixed(2)}</p>
                <p className="text-sm text-gray-600 mt-2">
                  <i className="ri-user-line mr-1"></i>
                  {user?.email}
                </p>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowPurchase(false)}
                  className="flex-1 bg-gray-200 text-gray-800 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors cursor-pointer whitespace-nowrap"
                >
                  Cancelar
                </button>
                <button
                  onClick={processPurchase}
                  disabled={loading}
                  className="flex-1 bg-pink-500 text-white py-3 rounded-lg font-semibold hover:bg-pink-600 transition-colors cursor-pointer whitespace-nowrap disabled:opacity-50"
                >
                  {loading ? 'Procesando...' : 'Confirmar Compra'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {purchaseSuccess && (
        <div
          className={`fixed inset-0 flex items-center justify-center z-50 p-4 transition-all duration-500 ${
            successVisible ? 'bg-black/60' : 'bg-black/0'
          }`}
        >
          <style>{`
            @keyframes sc-successPop {
              0%   { opacity: 0; transform: scale(0.7) translateY(40px); }
              60%  { transform: scale(1.04) translateY(-6px); }
              80%  { transform: scale(0.98) translateY(2px); }
              100% { opacity: 1; transform: scale(1) translateY(0); }
            }
            @keyframes sc-checkDraw {
              from { stroke-dashoffset: 60; }
              to   { stroke-dashoffset: 0; }
            }
            @keyframes sc-ringPulse {
              0%   { transform: scale(0.6); opacity: 0.9; }
              100% { transform: scale(2.2); opacity: 0; }
            }
            @keyframes sc-confettiFall {
              0%   { transform: translateY(-10px) rotate(0deg); opacity: 1; }
              100% { transform: translateY(180px) rotate(720deg); opacity: 0; }
            }
            @keyframes sc-starPop {
              0%   { transform: scale(0) rotate(-30deg); opacity: 0; }
              60%  { transform: scale(1.3) rotate(10deg); opacity: 1; }
              100% { transform: scale(1) rotate(0deg); opacity: 1; }
            }
            @keyframes sc-slideUp {
              from { opacity: 0; transform: translateY(20px); }
              to   { opacity: 1; transform: translateY(0); }
            }
            .sc-success-card { animation: sc-successPop 0.55s cubic-bezier(0.22, 1, 0.36, 1) forwards; }
            .sc-check-path   { stroke-dasharray: 60; stroke-dashoffset: 60; animation: sc-checkDraw 0.5s ease forwards; animation-delay: 0.35s; }
            .sc-ring-pulse   { animation: sc-ringPulse 0.7s ease-out forwards; animation-delay: 0.3s; }
            .sc-confetti-1   { animation: sc-confettiFall 1.1s ease-in forwards; animation-delay: 0.4s; }
            .sc-confetti-2   { animation: sc-confettiFall 1.3s ease-in forwards; animation-delay: 0.5s; }
            .sc-confetti-3   { animation: sc-confettiFall 0.95s ease-in forwards; animation-delay: 0.55s; }
            .sc-confetti-4   { animation: sc-confettiFall 1.2s ease-in forwards; animation-delay: 0.45s; }
            .sc-confetti-5   { animation: sc-confettiFall 1.0s ease-in forwards; animation-delay: 0.6s; }
            .sc-confetti-6   { animation: sc-confettiFall 1.4s ease-in forwards; animation-delay: 0.35s; }
            .sc-star-1       { animation: sc-starPop 0.4s cubic-bezier(0.22,1,0.36,1) forwards; animation-delay: 0.55s; opacity: 0; }
            .sc-star-2       { animation: sc-starPop 0.4s cubic-bezier(0.22,1,0.36,1) forwards; animation-delay: 0.7s;  opacity: 0; }
            .sc-star-3       { animation: sc-starPop 0.4s cubic-bezier(0.22,1,0.36,1) forwards; animation-delay: 0.85s; opacity: 0; }
            .sc-slide-up-1   { animation: sc-slideUp 0.5s cubic-bezier(0.22,1,0.36,1) forwards; animation-delay: 0.45s; opacity: 0; }
            .sc-slide-up-2   { animation: sc-slideUp 0.5s cubic-bezier(0.22,1,0.36,1) forwards; animation-delay: 0.58s; opacity: 0; }
            .sc-slide-up-3   { animation: sc-slideUp 0.5s cubic-bezier(0.22,1,0.36,1) forwards; animation-delay: 0.72s; opacity: 0; }
            .sc-slide-up-4   { animation: sc-slideUp 0.5s cubic-bezier(0.22,1,0.36,1) forwards; animation-delay: 0.86s; opacity: 0; }
          `}</style>

          <div className="sc-success-card bg-white rounded-3xl p-8 max-w-md w-full relative overflow-hidden">
            {/* Confetti */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              <div className="sc-confetti-1 absolute top-0 left-[15%] w-3 h-3 bg-yellow-400 rounded-sm"></div>
              <div className="sc-confetti-2 absolute top-0 left-[30%] w-2 h-4 bg-pink-400 rounded-sm"></div>
              <div className="sc-confetti-3 absolute top-0 left-[50%] w-3 h-2 bg-green-400 rounded-sm"></div>
              <div className="sc-confetti-4 absolute top-0 left-[65%] w-2 h-3 bg-yellow-300 rounded-sm"></div>
              <div className="sc-confetti-5 absolute top-0 left-[80%] w-3 h-3 bg-pink-300 rounded-full"></div>
              <div className="sc-confetti-6 absolute top-0 left-[45%] w-2 h-2 bg-amber-400 rounded-full"></div>
            </div>

            <div className="text-center relative z-10">
              {/* Check animado */}
              <div className="relative w-24 h-24 mx-auto mb-5">
                <div className="sc-ring-pulse absolute inset-0 rounded-full border-4 border-green-400 opacity-0"></div>
                <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center">
                  <svg width="44" height="44" viewBox="0 0 44 44" fill="none">
                    <path className="sc-check-path" d="M10 22 L19 31 L34 14" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              </div>

              {/* Estrellas */}
              <div className="flex justify-center gap-1 mb-3">
                <span className="sc-star-1 text-yellow-400 text-xl">&#9733;</span>
                <span className="sc-star-2 text-yellow-400 text-2xl">&#9733;</span>
                <span className="sc-star-3 text-yellow-400 text-xl">&#9733;</span>
              </div>

              <h3 className="sc-slide-up-1 text-3xl font-bold text-gray-800 mb-1" style={{ fontFamily: '"Pacifico", serif' }}>
                ¡Snack Creado!
              </h3>

              {/* Snack name pill */}
              <div className="sc-slide-up-2 inline-flex items-center gap-2 bg-yellow-50 border border-yellow-200 rounded-full px-4 py-1.5 mt-2 mb-4">
                <i className="ri-magic-line text-yellow-500 text-sm"></i>
                <span className="text-yellow-800 font-semibold text-sm">{snackName}</span>
              </div>

              <p className="sc-slide-up-3 text-gray-500 text-sm mb-5">
                Tu snack personalizado ha sido creado y guardado en tu inventario
              </p>

              {/* Precio + email */}
              <div className="sc-slide-up-3 bg-gradient-to-r from-pink-50 to-yellow-50 rounded-2xl p-4 mb-6 border border-pink-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-gray-500 text-sm">
                    <i className="ri-user-line"></i>
                    <span className="truncate max-w-[160px]">{user?.email}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-400">Total pagado</p>
                    <p className="text-2xl font-bold text-pink-600">${getTotalPrice().toFixed(2)}</p>
                  </div>
                </div>
              </div>

              {/* Botones */}
              <div className="sc-slide-up-4 flex space-x-3">
                <button
                  onClick={resetForm}
                  className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-200 transition-colors cursor-pointer whitespace-nowrap"
                >
                  Crear otro
                </button>
                <a
                  href="/inventory"
                  className="flex-1 bg-gradient-to-r from-pink-500 to-pink-600 text-white py-3 rounded-xl font-semibold hover:from-pink-600 hover:to-pink-700 transition-all cursor-pointer whitespace-nowrap text-center"
                >
                  <i className="ri-archive-line mr-1"></i>Ver Inventario
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
