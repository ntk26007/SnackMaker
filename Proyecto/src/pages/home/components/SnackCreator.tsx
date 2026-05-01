import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import PaymentGateway from '@/components/feature/PaymentGateway';
import { useCart } from '@/context/CartContext';
import type { CartItem } from '@/context/CartContext';

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
  const [selectedIngredients, setSelectedIngredients] = useState<{ [key: string]: number }>({});
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');
  const [snackName, setSnackName] = useState<string>('');
  const [showPurchase, setShowPurchase] = useState(false);
  const [user, setUser] = useState<any>(null);

  const { items: cartItems, removeItem, updateQty, clearCart } = useCart();

  useEffect(() => {
    loadIngredients();
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    checkUser();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
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
    : ingredients.filter((ing: Ingredient) => ing.category === selectedCategory);

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
    setSnackName(snackNames[Math.floor(Math.random() * snackNames.length)]);
  };

  const getCustomTotal = () =>
    Object.entries(selectedIngredients).reduce((total: number, [id, quantity]: [string, number]) => {
      const ingredient = ingredients.find((ing: Ingredient) => ing.id === id);
      return total + (ingredient ? ingredient.price * quantity : 0);
    }, 0);

  const getCartTotal = () =>
    cartItems.reduce((sum: number, item: CartItem) => sum + item.price * item.quantity, 0);

  const getCombinedTotal = () => getCustomTotal() + getCartTotal();

  const getSelectedIngredientsCount = () =>
    Object.values(selectedIngredients).reduce((total: number, qty: number) => total + qty, 0);

  const hasAnything = getSelectedIngredientsCount() > 0 || cartItems.length > 0;

  const customIngredientsForPayment = Object.entries(selectedIngredients)
    .map(([id, quantity]: [string, number]) => {
      const ingredient = ingredients.find((ing: Ingredient) => ing.id === id)!;
      return { id, name: ingredient.name, quantity, price: ingredient.price };
    });

  const cartIngredientsForPayment = cartItems.flatMap((item: CartItem) =>
    (item.ingredients ?? []).map((name: string, idx: number) => ({
      id: `cart-${item.id}-${idx}`,
      name: `${item.name} — ${name}`,
      quantity: item.quantity,
      price: item.price / Math.max((item.ingredients ?? []).length, 1),
    }))
  );

  const allIngredientsForPayment = [...customIngredientsForPayment, ...cartIngredientsForPayment];

  const getCombinedSnackName = () => {
    const parts: string[] = [];
    if (getSelectedIngredientsCount() > 0 && snackName.trim()) parts.push(snackName.trim());
    if (cartItems.length > 0) parts.push(...cartItems.map((i: CartItem) => i.name));
    return parts.length > 0 ? parts.join(' + ') : 'Mi pedido';
  };

  const handlePurchase = () => {
    if (!hasAnything) {
      alert('¡Agrega al menos un ingrediente o un snack del ranking!');
      return;
    }
    if (getSelectedIngredientsCount() > 0 && !snackName.trim()) {
      alert('¡Genera un nombre para tu snack personalizado!');
      return;
    }
    if (!user) {
      alert('¡Debes iniciar sesión para comprar snacks!');
      return;
    }
    setShowPurchase(true);
  };

  const processPurchase = async () => {
    if (getSelectedIngredientsCount() > 0) {
      const ingredientsData = Object.entries(selectedIngredients).map(([id, quantity]: [string, number]) => {
        const ingredient = ingredients.find((ing: Ingredient) => ing.id === id);
        return {
          id,
          name: ingredient?.name,
          quantity,
          price: ingredient?.price,
          total: (ingredient?.price || 0) * quantity,
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
          totalPrice: getCustomTotal(),
          ingredients: ingredientsData,
        }),
      });
      const data = await response.json();
      if (!data.success) throw new Error(data.error || 'Error al guardar el snack personalizado');
    }

    for (const item of cartItems) {
      await fetch(`${import.meta.env.VITE_PUBLIC_SUPABASE_URL}/functions/v1/purchase-predefined-snack`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_PUBLIC_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          snackName: item.name,
          snackCreator: 'SnackMaker',
          userEmail: user.email,
          price: item.price * item.quantity,
          ingredients: item.ingredients,
        }),
      });
    }
  };

  const handleCancel = () => setShowPurchase(false);

  const handleAfterSuccess = () => {
    setShowPurchase(false);
    setSelectedIngredients({});
    setSnackName('');
    clearCart();
  };

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            Crea tu Snack Personalizado
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Selecciona tus ingredientes favoritos y crea la mezcla perfecta
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
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

            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredIngredients.map((ingredient: Ingredient) => (
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

          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg sticky top-24 overflow-hidden">
              <div className="p-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-5">Tu Snack</h2>

                <div className="mb-5">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="w-5 h-5 rounded-full bg-pink-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">1</span>
                    <h3 className="font-semibold text-gray-700 text-sm">Tu creación personalizada</h3>
                  </div>

                  <div className="mb-3">
                    <label className="block text-xs font-medium text-gray-500 mb-1">Nombre del Snack</label>
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
                        className="px-3 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors cursor-pointer"
                        title="Nombre aleatorio"
                      >
                        <i className="ri-magic-line"></i>
                      </button>
                    </div>
                  </div>

                  {Object.keys(selectedIngredients).length === 0 ? (
                    <p className="text-gray-400 text-xs italic">No has seleccionado ingredientes</p>
                  ) : (
                    <div className="space-y-1.5 mb-2">
                      {Object.entries(selectedIngredients).map(([id, quantity]: [string, number]) => {
                        const ingredient = ingredients.find((ing: Ingredient) => ing.id === id);
                        if (!ingredient) return null;
                        return (
                          <div key={id} className="flex justify-between items-center text-sm">
                            <span className="text-gray-700">{ingredient.name}</span>
                            <span className="font-semibold text-gray-800">
                              {quantity}x <span className="text-pink-500">${(ingredient.price * quantity).toFixed(2)}</span>
                            </span>
                          </div>
                        );
                      })}
                      <div className="flex justify-between items-center text-sm font-bold border-t border-gray-100 pt-1.5 mt-1.5">
                        <span className="text-gray-600">Subtotal creación</span>
                        <span className="text-pink-600">${getCustomTotal().toFixed(2)}</span>
                      </div>
                    </div>
                  )}
                </div>

                {cartItems.length > 0 && (
                  <div className="mb-5 border-t border-dashed border-gray-200 pt-4">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="w-5 h-5 rounded-full bg-yellow-400 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">2</span>
                      <h3 className="font-semibold text-gray-700 text-sm">Snacks del ranking</h3>
                    </div>

                    <div className="space-y-2">
                      {cartItems.map((item: CartItem) => (
                        <div key={item.id} className="flex items-center gap-2 bg-yellow-50 rounded-xl p-2">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-gray-800 truncate">{item.name}</p>
                            <p className="text-xs text-pink-600 font-bold">${(item.price * item.quantity).toFixed(2)}</p>
                          </div>
                          <div className="flex items-center gap-1 flex-shrink-0">
                            <button
                              onClick={() => updateQty(item.id, item.quantity - 1)}
                              className="w-5 h-5 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold hover:bg-gray-300 transition-colors"
                            >−</button>
                            <span className="w-4 text-center text-xs font-semibold">{item.quantity}</span>
                            <button
                              onClick={() => updateQty(item.id, item.quantity + 1)}
                              className="w-5 h-5 rounded-full bg-pink-100 flex items-center justify-center text-xs font-bold hover:bg-pink-200 transition-colors text-pink-600"
                            >+</button>
                          </div>
                          <button
                            onClick={() => removeItem(item.id)}
                            className="text-gray-300 hover:text-red-500 transition-colors ml-1"
                            title="Quitar"
                          >
                            <i className="ri-close-line text-sm" />
                          </button>
                        </div>
                      ))}

                      <div className="flex justify-between items-center text-sm font-bold pt-1">
                        <span className="text-gray-600">Subtotal ranking</span>
                        <span className="text-yellow-600">${getCartTotal().toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                )}

                <div className="border-t border-gray-200 pt-4 mb-4">
                  <div className="flex justify-between items-center text-lg font-bold">
                    <span>Total</span>
                    <span className="text-pink-600">${getCombinedTotal().toFixed(2)}</span>
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {getSelectedIngredientsCount() > 0 && `${getSelectedIngredientsCount()} ingredientes propios`}
                    {getSelectedIngredientsCount() > 0 && cartItems.length > 0 && ' · '}
                    {cartItems.length > 0 && `${cartItems.length} snack${cartItems.length > 1 ? 's' : ''} del ranking`}
                  </p>
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
                  disabled={!hasAnything}
                  className="w-full bg-gradient-to-r from-pink-500 to-pink-600 text-white py-3 rounded-lg font-semibold hover:from-pink-600 hover:to-pink-700 transition-all transform hover:scale-105 cursor-pointer whitespace-nowrap disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  <i className="ri-shopping-cart-line mr-2"></i>
                  {cartItems.length > 0 && getSelectedIngredientsCount() > 0
                    ? 'Comprar todo junto'
                    : cartItems.length > 0
                    ? 'Comprar snacks del ranking'
                    : 'Comprar mi snack'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showPurchase && (
        <PaymentGateway
          snackName={getCombinedSnackName()}
          ingredients={allIngredientsForPayment}
          totalPrice={getCombinedTotal()}
          userEmail={user?.email ?? ''}
          onConfirm={processPurchase}
          onCancel={handleCancel}
          onAfterSuccess={handleAfterSuccess}
        />
      )}
    </div>
  );
}