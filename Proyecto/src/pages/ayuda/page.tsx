import { Link } from 'react-router-dom';

export default function AyudaPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar simple */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <Link to="/" className="flex items-center gap-3">
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
            <Link to="/" className="text-gray-600 hover:text-pink-600 transition-colors text-sm">
              ← Volver al inicio
            </Link>
          </div>
        </div>
      </nav>

      {/* Contenido */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-36 pb-16">
        <h1 className="text-4xl font-bold text-gray-800 mb-2" style={{ fontFamily: '"Pacifico", serif' }}>
          Centro de Ayuda
        </h1>
        <p className="text-gray-500 mb-10 text-lg">Encuentra respuestas a las preguntas más frecuentes.</p>

        <div className="space-y-6">
          {[
            {
              pregunta: '¿Cómo creo mi primer snack?',
              respuesta: 'Ve a la sección "Crear" en la barra de navegación, elige tus ingredientes favoritos, combínalos y guarda tu creación. ¡Es así de sencillo!',
            },
            {
              pregunta: '¿Necesito una cuenta para usar SnackMaker?',
              respuesta: 'Puedes explorar y crear snacks sin cuenta, pero necesitarás registrarte para guardar tus creaciones y aparecer en el ranking.',
            },
            {
              pregunta: '¿Cómo funciona el inventario y compras?',
              respuesta: 'En la sección "Inventario y compras" puedes ver todos los ingredientes disponibles, sus precios y gestionar tus pedidos.',
            },
            {
              pregunta: '¿Puedo compartir mis snacks con otros usuarios?',
              respuesta: 'Sí, una vez guardado tu snack aparecerá en la sección de snacks populares y otros usuarios podrán verlo y valorarlo.',
            },
            {
              pregunta: '¿Cómo se calcula el ranking?',
              respuesta: 'El ranking se basa en las valoraciones y la popularidad de tus snacks entre la comunidad SnackMaker.',
            },
          ].map((item, i) => (
            <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-800 mb-2 flex items-start gap-2">
                <span className="text-pink-500 mt-0.5">
                  <i className="ri-question-line"></i>
                </span>
                {item.pregunta}
              </h3>
              <p className="text-gray-600 pl-6">{item.respuesta}</p>
            </div>
          ))}
        </div>

        <div className="mt-12 bg-gradient-to-r from-pink-50 to-yellow-50 rounded-2xl p-8 text-center border border-pink-100">
          <p className="text-gray-700 text-lg mb-4">¿No encuentras lo que buscas?</p>
          <Link
            to="/contacto"
            className="inline-block bg-gradient-to-r from-pink-500 to-pink-600 text-white px-6 py-3 rounded-full hover:from-pink-600 hover:to-pink-700 transition-all font-medium"
          >
            Contáctanos
          </Link>
        </div>
      </div>
    </div>
  );
}
