interface HeroProps {
  onCreateClick: () => void;
}

export default function Hero() {
  return (
    <div
      className="relative min-h-screen flex items-center justify-center bg-cover bg-center"
      style={{
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url('https://readdy.ai/api/search-image?query=Colorful%20healthy%20snack%20ingredients%20nuts%20dried%20fruits%20seeds%20chocolate%20chips%20arranged%20beautifully%20on%20pastel%20background%2C%20food%20photography%2C%20vibrant%20colors%2C%20clean%20composition%2C%20natural%20lighting%2C%20appetizing%20display&width=1920&height=1080&seq=hero-bg&orientation=landscape')`
      }}
    >
      {/* Imagen decorativa esquina superior izquierda */}
      <div className="absolute top-10 left-10 md:top-14 md:left-14 w-44 h-44 md:w-60 md:h-60 lg:w-72 lg:h-72 z-10 pointer-events-none">
        <img
          src="https://storage.readdy-site.link/project_files/62d206f0-feda-4a4d-a808-b79c7e6567c9/bed002c0-d399-406d-b70e-a3769f7726f6_Gemini_Generated_Image_563x9q563x9q563x-removebg-preview.png?v=058d2d9c118ae1e1d8288f4f08522ac3"
          alt="SnackMaker mascot"
          className="w-full h-full object-contain drop-shadow-2xl"
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="w-full">
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
            Crea tu Snack
            <span className="block text-yellow-400">Perfecto</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-200 mb-8 max-w-3xl mx-auto">
            Diseña mezclas únicas con ingredientes premium. Frutos secos, frutas deshidratadas,
            chocolates y semillas para crear tu combinación ideal.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <button
              onClick={() => document.getElementById('snack-creator')?.scrollIntoView({ behavior: 'smooth' })}
              className="bg-gradient-to-r from-pink-500 to-pink-600 text-white px-8 py-4 rounded-full text-lg font-semibold hover:from-pink-600 hover:to-pink-700 transition-all transform hover:scale-105 cursor-pointer whitespace-nowrap"
            >
              <i className="ri-magic-line mr-2"></i>
              Empezar a Crear
            </button>
            <a
              href="/ranking"
              className="bg-white/20 backdrop-blur-sm text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-white/30 transition-all border border-white/30 cursor-pointer whitespace-nowrap"
            >
              <i className="ri-trophy-line mr-2"></i>
              Ver Ranking
            </a>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <div className="text-3xl font-bold text-yellow-400 mb-2">14+</div>
              <div className="text-white">Ingredientes Premium</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <div className="text-3xl font-bold text-pink-400 mb-2">&#8734;</div>
              <div className="text-white">Combinaciones Posibles</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <div className="text-3xl font-bold text-green-400 mb-2">100%</div>
              <div className="text-white">Natural y Saludable</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
