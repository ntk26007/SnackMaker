import { useState } from 'react';

interface PopularSnack {
  id: string;
  name: string;
  creator: string;
  ingredients: string[];
  price: number;
  rating: number;
  votes: number;
  image: string;
  description: string;
}

const popularSnacks: PopularSnack[] = [
  {
    id: '1',
    name: 'Delicia Tropical',
    creator: 'María González',
    ingredients: ['Mango', 'Coco', 'Anacardos', 'Chocolate Blanco'],
    price: 8.50,
    rating: 4.9,
    votes: 234,
    image: 'https://readdy.ai/api/search-image?query=Tropical%20mix%20of%20dried%20mango%2C%20coconut%20flakes%2C%20cashews%20and%20white%20chocolate%20pieces%20in%20a%20bowl%2C%20food%20photography%2C%20pastel%20background%2C%20natural%20lighting%2C%20appetizing%20presentation&width=400&height=300&seq=tropical&orientation=landscape',
    description: 'Una mezcla exótica que te transporta al paraíso con cada bocado'
  },
  {
    id: '2',
    name: 'Energía Suprema',
    creator: 'Carlos Ruiz',
    ingredients: ['Almendras', 'Nueces', 'Arándanos', 'Cacao Nibs'],
    price: 9.20,
    rating: 4.8,
    votes: 189,
    image: 'https://readdy.ai/api/search-image?query=Energy%20mix%20of%20almonds%2C%20walnuts%2C%20dried%20blueberries%20and%20cacao%20nibs%20in%20a%20bowl%2C%20healthy%20snack%20photography%2C%20pastel%20background%2C%20natural%20lighting%2C%20nutritious%20presentation&width=400&height=300&seq=energy&orientation=landscape',
    description: 'El combustible perfecto para tus días más intensos'
  },
  {
    id: '3',
    name: 'Dulce Tentación',
    creator: 'Ana Martín',
    ingredients: ['Chips de Chocolate', 'Pasas', 'Almendras', 'Coco'],
    price: 7.80,
    rating: 4.7,
    votes: 156,
    image: 'https://readdy.ai/api/search-image?query=Sweet%20mix%20of%20chocolate%20chips%2C%20raisins%2C%20almonds%20and%20coconut%20in%20a%20bowl%2C%20dessert%20snack%20photography%2C%20pastel%20background%2C%20natural%20lighting%2C%20indulgent%20presentation&width=400&height=300&seq=sweet&orientation=landscape',
    description: 'Para cuando necesitas ese toque dulce especial'
  },
  {
    id: '4',
    name: 'Crunch Natural',
    creator: 'Pedro López',
    ingredients: ['Semillas de Girasol', 'Pistachos', 'Semillas de Calabaza', 'Chía'],
    price: 6.90,
    rating: 4.6,
    votes: 142,
    image: 'https://readdy.ai/api/search-image?query=Natural%20crunchy%20mix%20of%20sunflower%20seeds%2C%20pistachios%2C%20pumpkin%20seeds%20and%20chia%20in%20a%20bowl%2C%20healthy%20snack%20photography%2C%20pastel%20background%2C%20natural%20lighting%2C%20organic%20presentation&width=400&height=300&seq=crunch&orientation=landscape',
    description: 'Textura perfecta y sabor natural en cada bocado'
  },
  {
    id: '5',
    name: 'Fusión Perfecta',
    creator: 'Laura Sánchez',
    ingredients: ['Nueces', 'Arándanos', 'Chocolate Blanco', 'Semillas de Calabaza'],
    price: 8.90,
    rating: 4.8,
    votes: 198,
    image: 'https://readdy.ai/api/search-image?query=Perfect%20fusion%20mix%20of%20walnuts%2C%20blueberries%2C%20white%20chocolate%20and%20pumpump%20seeds%20in%20a%20bowl%2C%20gourmet%20snack%20photography%2C%20pastel%20background%2C%20natural%20lighting%2C%20elegant%20presentation&width=400&height=300&seq=fusion&orientation=landscape',
    description: 'La combinación ideal entre dulce y salado'
  },
  {
    id: '6',
    name: 'Poder Antioxidante',
    creator: 'Miguel Torres',
    ingredients: ['Arándanos', 'Cacao Nibs', 'Almendras', 'Chía'],
    price: 9.50,
    rating: 4.9,
    votes: 167,
    image: 'https://readdy.ai/api/search-image?query=Antioxidant%20power%20mix%20of%20blueberries%2C%20cacao%20nibs%2C%20almonds%20and%20chia%20seeds%20in%20a%20bowl%2C%20superfood%20snack%20photography%2C%20pastel%20background%2C%20natural%20lighting%2C%20healthy%20presentation&width=400&height=300&seq=antioxidant&orientation=landscape',
    description: 'Cargado de antioxidantes para cuidar tu salud'
  }
];

export default function PopularSnacks() {
  const [sortBy, setSortBy] = useState<'rating' | 'votes' | 'price'>('rating');
  const [selectedSnack, setSelectedSnack] = useState<PopularSnack | null>(null);
  const [showPurchase, setShowPurchase] = useState(false);
  const [userEmail, setUserEmail] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [purchaseSuccess, setPurchaseSuccess] = useState(false);

  const sortedSnacks = [...popularSnacks].sort((a, b) => {
    switch (sortBy) {
      case 'rating':
        return b.rating - a.rating;
      case 'votes':
        return b.votes - a.votes;
      case 'price':
        return a.price - b.price;
      default:
        return 0;
    }
  });

  const getRankIcon = (index: number) => {
    switch (index) {
      case 0: return '🥇';
      case 1: return '🥈';
      case 2: return '🥉';
      default: return `#${index + 1}`;
    }
  };

  const handlePurchaseSnack = (snack: PopularSnack) => {
    setSelectedSnack(snack);
    setShowPurchase(true);
  };

  const processPurchase = async () => {
    if (!userEmail.trim()) {
      alert('¡Ingresa tu email para completar la compra!');
      return;
    }
    if (!selectedSnack) return;
    setLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_PUBLIC_SUPABASE_URL}/functions/v1/purchase-predefined-snack`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_PUBLIC_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          snackName: selectedSnack.name,
          snackCreator: selectedSnack.creator,
          userEmail,
          price: selectedSnack.price,
          ingredients: selectedSnack.ingredients
        }),
      });
      const data = await response.json();
      if (data.success) {
        setPurchaseSuccess(true);
        setShowPurchase(false);
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
    setSelectedSnack(null);
    setUserEmail('');
  };

  return (
    <div className="min-h-screen">
      {/* Header con degradado amarillo — separa visualmente la sección */}
      <div className="bg-gradient-to-b from-yellow-100 via-yellow-50 to-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 bg-yellow-200/80 border border-yellow-300 rounded-full px-5 py-2 mb-6">
            <i className="ri-trophy-fill text-yellow-500 text-sm"></i>
            <span className="text-yellow-800 text-sm font-medium tracking-wide uppercase">Comunidad SnackMaker</span>
          </div>
          <h2 className="text-5xl md:text-6xl font-bold text-gray-800 mb-5" style={{ fontFamily: '"Pacifico", serif' }}>
            Ranking de
            <span className="block text-yellow-500 mt-1">Snacks Populares</span>
          </h2>
          <p className="text-lg md:text-xl text-gray-500 max-w-2xl mx-auto">
            Descubre las creaciones más valoradas por nuestra comunidad
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">

        {/* Sort Controls */}
        <div className="flex justify-center mb-8">
          <div className="bg-white rounded-full p-1 shadow-lg">
            <button
              onClick={() => setSortBy('rating')}
              className={`px-6 py-2 rounded-full transition-all whitespace-nowrap cursor-pointer ${
                sortBy === 'rating' ? 'bg-pink-500 text-white' : 'text-gray-600 hover:text-pink-600'
              }`}
            >
              <i className="ri-star-line mr-2"></i>
              Por Valoración
            </button>
            <button
              onClick={() => setSortBy('votes')}
              className={`px-6 py-2 rounded-full transition-all whitespace-nowrap cursor-pointer ${
                sortBy === 'votes' ? 'bg-yellow-500 text-white' : 'text-gray-600 hover:text-yellow-600'
              }`}
            >
              <i className="ri-heart-line mr-2"></i>
              Por Votos
            </button>
            <button
              onClick={() => setSortBy('price')}
              className={`px-6 py-2 rounded-full transition-all whitespace-nowrap cursor-pointer ${
                sortBy === 'price' ? 'bg-yellow-500 text-white' : 'text-gray-600 hover:text-yellow-600'
              }`}
            >
              <i className="ri-money-dollar-circle-line mr-2"></i>
              Por Precio
            </button>
          </div>
        </div>

        {/* Snacks Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {sortedSnacks.map((snack, index) => (
            <div
              key={snack.id}
              className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all transform hover:scale-105"
            >
              <div className="relative">
                <img
                  src={snack.image}
                  alt={snack.name}
                  className="w-full h-48 object-cover object-top"
                />
                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-full w-12 h-12 flex items-center justify-center font-bold text-lg">
                  {getRankIcon(index)}
                </div>
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 flex items-center space-x-1">
                  <i className="ri-star-fill text-yellow-500 text-sm"></i>
                  <span className="font-semibold text-sm">{snack.rating}</span>
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-2">{snack.name}</h3>
                <p className="text-gray-600 text-sm mb-3">por {snack.creator}</p>
                <p className="text-gray-700 text-sm mb-4 line-clamp-2">{snack.description}</p>
                <div className="mb-4">
                  <div className="flex flex-wrap gap-1">
                    {snack.ingredients.slice(0, 3).map((ingredient, idx) => (
                      <span key={idx} className="bg-pink-100 text-pink-700 px-2 py-1 rounded-full text-xs">
                        {ingredient}
                      </span>
                    ))}
                    {snack.ingredients.length > 3 && (
                      <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs">
                        +{snack.ingredients.length - 3}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <span className="flex items-center">
                      <i className="ri-heart-line mr-1"></i>
                      {snack.votes}
                    </span>
                  </div>
                  <div className="text-xl font-bold text-pink-600">${snack.price.toFixed(2)}</div>
                </div>
                <button
                  onClick={() => handlePurchaseSnack(snack)}
                  className="w-full bg-gradient-to-r from-pink-500 to-pink-600 text-white py-2 rounded-lg font-semibold hover:from-pink-600 hover:to-pink-700 transition-all cursor-pointer whitespace-nowrap"
                >
                  <i className="ri-shopping-cart-line mr-2"></i>
                  Comprar Snack
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Mejores clasificados (podio) */}
        <div className="mt-16 pb-12">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">Mejores clasificados</h2>
          <div className="flex justify-center items-end space-x-4 max-w-4xl mx-auto">
            {/* Second Place */}
            <div className="text-center">
              <div className="bg-gradient-to-t from-gray-300 to-gray-400 rounded-t-lg p-6 h-32 flex flex-col justify-end">
                <div className="text-4xl mb-2">🥈</div>
                <div className="text-white font-bold">{sortedSnacks[1]?.name}</div>
              </div>
              <div className="bg-gray-400 text-white py-2 px-4 rounded-b-lg">
                <div className="font-bold">2º Lugar</div>
                <div className="text-sm">⭐ {sortedSnacks[1]?.rating}</div>
              </div>
            </div>
            {/* First Place */}
            <div className="text-center">
              <div className="bg-gradient-to-t from-yellow-400 to-yellow-500 rounded-t-lg p-6 h-40 flex flex-col justify-end">
                <div className="text-5xl mb-2">🥇</div>
                <div className="text-white font-bold text-lg">{sortedSnacks[0]?.name}</div>
              </div>
              <div className="bg-yellow-500 text-white py-2 px-4 rounded-b-lg">
                <div className="font-bold">1º Lugar</div>
                <div className="text-sm">⭐ {sortedSnacks[0]?.rating}</div>
              </div>
            </div>
            {/* Third Place */}
            <div className="text-center">
              <div className="bg-gradient-to-t from-orange-400 to-orange-500 rounded-t-lg p-6 h-24 flex flex-col justify-end">
                <div className="text-3xl mb-2">🥉</div>
                <div className="text-white font-bold">{sortedSnacks[2]?.name}</div>
              </div>
              <div className="bg-orange-500 text-white py-2 px-4 rounded-b-lg">
                <div className="font-bold">3º Lugar</div>
                <div className="text-sm">⭐ {sortedSnacks[2]?.rating}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Purchase Modal */}
      {showPurchase && selectedSnack && !purchaseSuccess && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full">
            <div className="text-center">
              <h3 className="text-2xl font-bold text-gray-800 mb-4">Comprar Snack</h3>
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <p className="text-sm text-gray-600 mb-2">Snack: {selectedSnack.name}</p>
                <p className="text-sm text-gray-600 mb-2">Creador: {selectedSnack.creator}</p>
                <p className="text-2xl font-bold text-pink-600">${selectedSnack.price.toFixed(2)}</p>
              </div>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  value={userEmail}
                  onChange={(e) => setUserEmail(e.target.value)}
                  placeholder="tu@email.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent text-sm"
                />
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
      {purchaseSuccess && selectedSnack && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="ri-check-line text-green-600 text-2xl"></i>
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">¡Compra Exitosa!</h3>
              <p className="text-gray-600 mb-4">
                Has comprado &quot;{selectedSnack.name}&quot; exitosamente
              </p>
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <p className="text-sm text-gray-600">Total pagado:</p>
                <p className="text-2xl font-bold text-pink-600">${selectedSnack.price.toFixed(2)}</p>
              </div>
              <button
                onClick={resetForm}
                className="w-full bg-pink-500 text-white py-3 rounded-lg font-semibold hover:bg-pink-600 transition-colors cursor-pointer whitespace-nowrap"
              >
                Continuar Navegando
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
