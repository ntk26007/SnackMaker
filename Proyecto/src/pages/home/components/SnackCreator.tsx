
import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

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

export default function SnackCreator() {
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [selectedIngredients, setSelectedIngredients] = useState<{[key: string]: number}>({});
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');
  const [snackName, setSnackName] = useState<string>('');
  const [showPurchase, setShowPurchase] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [purchaseSuccess, setPurchaseSuccess] = useState(false);

  useEffect(() => {
    loadIngredients();
    
    // Check if user is logged in
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };

    checkUser();

    // Listen for auth changes
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
      if (data.ingredients) {
        setIngredients(data.ingredients);
      }
    } catch (error) {
      console.error('Error loading ingredients:', error);
    }
  };

  const categories = ['Todos', 'Frutos Secos', 'Frutas Deshidratadas', 'Chocolates', 'Semillas'];

  const filteredIngredients = selectedCategory === 'Todos' 
    ? ingredients 
    : ingredients.filter(ing => ing.category === selectedCategory);

  const addIngredient = (ingredientId: string) => {
    setSelectedIngredients(prev => ({
      ...prev,
      [ingredientId]: (prev[ingredientId] || 0) + 1
    }));
  };

  const removeIngredient = (ingredientId: string) => {
    setSelectedIngredients(prev => {
      const newState = { ...prev };
      if (newState[ingredientId] > 1) {
        newState[ingredientId]--;
      } else {
        delete newState[ingredientId];
      }
      return newState;
    });
  };

  const generateRandomName = () => {
    const randomName = snackNames[Math.floor(Math.random() * snackNames.length)];
    setSnackName(randomName);
  };

  const getTotalPrice = () => {
    return Object.entries(selectedIngredients).reduce((total, [id, quantity]) => {
      const ingredient = ingredients.find(ing => ing.id === id);
      return total + (ingredient ? ingredient.price * quantity : 0);
    }, 0);
  };

  const getSelectedIngredientsCount = () => {
    return Object.values(selectedIngredients).reduce((total, quantity) => total + quantity, 0);
  };

  const handlePurchase = () => {
    if (getSelectedIngredientsCount() === 0) {
      alert('¡Agrega al menos un ingrediente a tu snack!');
      return;
    }
    if (!snackName.trim()) {
      alert('¡Genera un nombre para tu snack!');
      return;
    }
    if (!user) {
      alert('¡Debes iniciar sesión para comprar snacks!');
      return;
    }
    setShowPurchase(true);
  };

  const processPurchase = async () => {
    setLoading(true);
    try {
      const ingredientsData = Object.entries(selectedIngredients).map(([id, quantity]) => {
        const ingredient = ingredients.find(ing => ing.id === id);
        return {
          id,
          name: ingredient?.name,
          quantity,
          price: ingredient?.price,
          total: (ingredient?.price || 0) * quantity
        };
      });

      const response = await fetch(`${import.meta.env.VITE_PUBLIC_SUPABASE_URL}/functions/v1/create-snack`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_PUBLIC_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: snackName,
          userEmail: user.email,
          totalPrice: getTotalPrice(),
          ingredients: ingredientsData
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        setPurchaseSuccess(true);
      } else {
        alert('Error al procesar la compra: ' + (data.error || 'Error desconocido'));
      }
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
    setSelectedIngredients({});
    setSnackName('');
  };

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            Crea tu Snack Personalizado
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Selecciona tus ingredientes favoritos y crea la mezcla perfecta
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Ingredients Selection */}
          <div className="lg:col-span-2">
            {/* Category Filter */}
            <div className="mb-6">
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

            {/* Ingredients Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredIngredients.map(ingredient => (
                <div key={ingredient.id} className={`${ingredient.color} rounded-2xl p-4 shadow-sm hover:shadow-md transition-all`}>
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
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl p-6 shadow-lg sticky top-24">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Tu Snack</h2>
              
              {/* Name Generator */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre del Snack
                </label>
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
                          <span className="font-semibold">
                            {quantity}x ${(ingredient.price * quantity).toFixed(2)}
                          </span>
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
                <p className="text-sm text-gray-600 mt-1">
                  {getSelectedIngredientsCount()} ingredientes
                </p>
              </div>

              {/* Login Notice */}
              {!user && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                  <p className="text-yellow-800 text-sm text-center">
                    <i className="ri-information-line mr-1"></i>
                    Inicia sesión para comprar snacks
                  </p>
                </div>
              )}

              {/* Purchase Button */}
              <button
                onClick={handlePurchase}
                className="w-full bg-gradient-to-r from-pink-500 to-pink-600 text-white py-3 rounded-lg font-semibold hover:from-pink-600 hover:to-pink-700 transition-all transform hover:scale-105 cursor-pointer whitespace-nowrap"
              >
                <i className="ri-shopping-cart-line mr-2"></i>
                Comprar Snack
              </button>
            </div>
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
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="ri-check-line text-green-600 text-2xl"></i>
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">¡Compra Exitosa!</h3>
              <p className="text-gray-600 mb-4">
                Tu snack "{snackName}" ha sido creado y guardado exitosamente
              </p>
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <p className="text-sm text-gray-600">Total pagado:</p>
                <p className="text-2xl font-bold text-pink-600">${getTotalPrice().toFixed(2)}</p>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={resetForm}
                  className="flex-1 bg-pink-500 text-white py-3 rounded-lg font-semibold hover:bg-pink-600 transition-colors cursor-pointer whitespace-nowrap"
                >
                  Crear Otro Snack
                </button>
                <a
                  href="/inventory"
                  className="flex-1 bg-blue-500 text-white py-3 rounded-lg font-semibold hover:bg-blue-600 transition-colors cursor-pointer whitespace-nowrap text-center"
                >
                  Ver Inventario
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
