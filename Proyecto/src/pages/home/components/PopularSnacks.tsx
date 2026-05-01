import { useState } from 'react';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import { useCart } from '@/context/CartContext';

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

const scrollStyles = `
  @keyframes revealUp {
    from { opacity: 0; transform: translateY(40px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes revealScale {
    from { opacity: 0; transform: scale(0.90); }
    to   { opacity: 1; transform: scale(1); }
  }
  @keyframes revealFade {
    from { opacity: 0; }
    to   { opacity: 1; }
  }
  @keyframes podiumRise {
    from { opacity: 0; transform: translateY(60px) scaleY(0.7); }
    to   { opacity: 1; transform: translateY(0) scaleY(1); }
  }
  .ps-reveal-up {
    opacity: 0;
    animation: revealUp 0.72s cubic-bezier(0.22, 1, 0.36, 1) forwards;
  }
  .ps-reveal-scale {
    opacity: 0;
    animation: revealScale 0.65s cubic-bezier(0.22, 1, 0.36, 1) forwards;
  }
  .ps-reveal-fade {
    opacity: 0;
    animation: revealFade 0.6s ease forwards;
  }
  .ps-podium {
    opacity: 0;
    transform-origin: bottom center;
    animation: podiumRise 0.75s cubic-bezier(0.22, 1, 0.36, 1) forwards;
  }
  .ps-d0  { animation-delay: 0s; }
  .ps-d1  { animation-delay: 0.08s; }
  .ps-d2  { animation-delay: 0.16s; }
  .ps-d3  { animation-delay: 0.24s; }
  .ps-d4  { animation-delay: 0.32s; }
  .ps-d5  { animation-delay: 0.40s; }
  .ps-d6  { animation-delay: 0.48s; }
  .ps-d7  { animation-delay: 0.56s; }
  .ps-d8  { animation-delay: 0.64s; }
`;

export default function PopularSnacks() {
  const { addItem } = useCart();
  const [sortBy, setSortBy] = useState<'rating' | 'votes' | 'price'>('rating');
  const [toastSnack, setToastSnack] = useState<PopularSnack | null>(null);
  const [toastVisible, setToastVisible] = useState(false);

  const { ref: headerRef, isVisible: headerVisible } = useScrollReveal({ threshold: 0.2 });
  const { ref: filtersRef, isVisible: filtersVisible } = useScrollReveal({ threshold: 0.3 });
  const { ref: cardsRef, isVisible: cardsVisible } = useScrollReveal({ threshold: 0.05 });
  const { ref: podiumRef, isVisible: podiumVisible } = useScrollReveal({ threshold: 0.2 });

  const sortedSnacks = [...popularSnacks].sort((a, b) => {
    switch (sortBy) {
      case 'rating': return b.rating - a.rating;
      case 'votes':  return b.votes - a.votes;
      case 'price':  return a.price - b.price;
      default:       return 0;
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

  const handleAddToCart = (snack: PopularSnack) => {
    addItem({
      id: `popular-${snack.id}`,
      name: snack.name,
      price: snack.price,
      image: snack.image,
      type: 'ranking',
      ingredients: snack.ingredients,
    });
    setToastSnack(snack);
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 3000);
  };

  return (
    <div className="min-h-screen">
      <style>{scrollStyles}</style>

      {/* Header con degradado amarillo */}
      <div className="bg-gradient-to-b from-yellow-100 via-yellow-50 to-white py-20">
        <div ref={headerRef} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {headerVisible && (
            <>
              <div className="ps-reveal-fade ps-d0 inline-flex items-center gap-2 bg-yellow-200/80 border border-yellow-300 rounded-full px-5 py-2 mb-6">
                <i className="ri-trophy-fill text-yellow-500 text-sm"></i>
                <span className="text-yellow-800 text-sm font-medium tracking-wide uppercase">Comunidad SnackMaker</span>
              </div>
              <h2 className="ps-reveal-up ps-d1 text-5xl md:text-6xl font-bold text-gray-800 mb-5" style={{ fontFamily: '"Pacifico", serif' }}>
                Ranking de
                <span className="block text-yellow-500 mt-1">Snacks Populares</span>
              </h2>
              <p className="ps-reveal-up ps-d2 text-lg md:text-xl text-gray-500 max-w-2xl mx-auto">
                Descubre las creaciones más valoradas por nuestra comunidad
              </p>
            </>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">

        {/* Sort Controls */}
        <div ref={filtersRef} className="flex justify-center mb-8">
          {filtersVisible && (
            <div className="ps-reveal-up ps-d0 bg-white rounded-full p-1 border border-gray-100">
              <button
                onClick={() => setSortBy('rating')}
                className={`px-6 py-2 rounded-full transition-all whitespace-nowrap cursor-pointer ${
                  sortBy === 'rating' ? 'bg-pink-500 text-white' : 'text-gray-600 hover:text-pink-600'
                }`}
              >
                <i className="ri-star-line mr-2"></i>Por Valoración
              </button>
              <button
                onClick={() => setSortBy('votes')}
                className={`px-6 py-2 rounded-full transition-all whitespace-nowrap cursor-pointer ${
                  sortBy === 'votes' ? 'bg-yellow-500 text-white' : 'text-gray-600 hover:text-yellow-600'
                }`}
              >
                <i className="ri-heart-line mr-2"></i>Por Votos
              </button>
              <button
                onClick={() => setSortBy('price')}
                className={`px-6 py-2 rounded-full transition-all whitespace-nowrap cursor-pointer ${
                  sortBy === 'price' ? 'bg-yellow-500 text-white' : 'text-gray-600 hover:text-yellow-600'
                }`}
              >
                <i className="ri-money-dollar-circle-line mr-2"></i>Por Precio
              </button>
            </div>
          )}
        </div>

        {/* Snacks Grid */}
        <div ref={cardsRef} className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {cardsVisible && sortedSnacks.map((snack, index) => (
            <div
              key={snack.id}
              className={`ps-reveal-scale ps-d${Math.min(index, 5)} bg-white rounded-2xl overflow-hidden hover:scale-105 transition-all`}
              style={{ border: '1px solid #f3f4f6' }}
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
                  <span className="flex items-center text-sm text-gray-600">
                    <i className="ri-heart-line mr-1"></i>{snack.votes}
                  </span>
                  <div className="text-xl font-bold text-pink-600">${snack.price.toFixed(2)}</div>
                </div>
                <button
                  onClick={() => handleAddToCart(snack)}
                  className="w-full bg-gradient-to-r from-pink-500 to-pink-600 text-white py-2 rounded-lg font-semibold hover:from-pink-600 hover:to-pink-700 transition-all cursor-pointer whitespace-nowrap"
                >
                  <i className="ri-shopping-cart-line mr-2"></i>Añadir al carrito
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Podio */}
        <div ref={podiumRef} className="mt-16 pb-12">
          {podiumVisible && (
            <>
              <h2 className="ps-reveal-up ps-d0 text-3xl font-bold text-center text-gray-800 mb-8">
                Mejores clasificados
              </h2>
              <div className="flex justify-center items-end space-x-4 max-w-4xl mx-auto">
                {/* 2º Lugar */}
                <div className="ps-podium ps-d2 text-center">
                  <div className="bg-gradient-to-t from-gray-300 to-gray-400 rounded-t-lg p-6 h-32 flex flex-col justify-end">
                    <div className="text-4xl mb-2">🥈</div>
                    <div className="text-white font-bold">{sortedSnacks[1]?.name}</div>
                  </div>
                  <div className="bg-gray-400 text-white py-2 px-4 rounded-b-lg">
                    <div className="font-bold">2º Lugar</div>
                    <div className="text-sm">⭐ {sortedSnacks[1]?.rating}</div>
                  </div>
                </div>
                {/* 1º Lugar */}
                <div className="ps-podium ps-d0 text-center">
                  <div className="bg-gradient-to-t from-yellow-400 to-yellow-500 rounded-t-lg p-6 h-40 flex flex-col justify-end">
                    <div className="text-5xl mb-2">🥇</div>
                    <div className="text-white font-bold text-lg">{sortedSnacks[0]?.name}</div>
                  </div>
                  <div className="bg-yellow-500 text-white py-2 px-4 rounded-b-lg">
                    <div className="font-bold">1º Lugar</div>
                    <div className="text-sm">⭐ {sortedSnacks[0]?.rating}</div>
                  </div>
                </div>
                {/* 3º Lugar */}
                <div className="ps-podium ps-d4 text-center">
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
            </>
          )}
        </div>
      </div>

      {/* Toast — añadido al carrito */}
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
              {toastSnack?.name} añadido al carrito
            </p>
            <p className="text-xs text-gray-500">Ve a Crear para finalizar tu pedido</p>
          </div>
          <a
            href="/#snack-creator"
            className="flex-shrink-0 bg-pink-500 text-white text-xs font-semibold px-3 py-1.5 rounded-full hover:bg-pink-600 transition-colors whitespace-nowrap"
          >
            Ver carrito
          </a>
        </div>
      </div>
    </div>
  );
}