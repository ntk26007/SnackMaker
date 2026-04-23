import { Link } from 'react-router-dom';

const secciones = [
  {
    titulo: '1. Aceptación de los términos',
    contenido:
      'Al acceder y usar SnackMaker, aceptas quedar vinculado por estos Términos y Condiciones. Si no estás de acuerdo con alguna parte de estos términos, no podrás acceder al servicio.',
  },
  {
    titulo: '2. Uso del servicio',
    contenido:
      'SnackMaker te permite crear, compartir y descubrir combinaciones de snacks personalizados. Te comprometes a usar el servicio de forma responsable y a no publicar contenido inapropiado, ofensivo o que infrinja derechos de terceros.',
  },
  {
    titulo: '3. Cuentas de usuario',
    contenido:
      'Para acceder a determinadas funciones necesitarás crear una cuenta. Eres responsable de mantener la confidencialidad de tu contraseña y de todas las actividades que ocurran bajo tu cuenta.',
  },
  {
    titulo: '4. Propiedad intelectual',
    contenido:
      'El contenido, diseño y código de SnackMaker están protegidos por derechos de autor. Las creaciones de snacks que publiques siguen siendo tuyas, aunque nos concedes una licencia para mostrarlas en la plataforma.',
  },
  {
    titulo: '5. Privacidad de datos',
    contenido:
      'Recopilamos y procesamos tus datos conforme a nuestra Política de Privacidad. Usamos tus datos únicamente para mejorar tu experiencia en la plataforma y nunca los vendemos a terceros.',
  },
  {
    titulo: '6. Limitación de responsabilidad',
    contenido:
      'SnackMaker se proporciona "tal cual". No garantizamos que el servicio sea ininterrumpido o libre de errores. No seremos responsables de daños indirectos o consecuentes derivados del uso del servicio.',
  },
  {
    titulo: '7. Modificaciones',
    contenido:
      'Nos reservamos el derecho de modificar estos términos en cualquier momento. Te notificaremos sobre cambios significativos y el uso continuado del servicio implica la aceptación de los nuevos términos.',
  },
  {
    titulo: '8. Contacto',
    contenido:
      'Si tienes preguntas sobre estos Términos y Condiciones, puedes contactarnos a través de nuestra página de contacto o escribiéndonos a legal@snackmaker.com.',
  },
];

export default function TerminosPage() {
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

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-36 pb-16">
        <h1 className="text-4xl font-bold text-gray-800 mb-2" style={{ fontFamily: '"Pacifico", serif' }}>
          Términos y Condiciones
        </h1>
        <p className="text-gray-400 mb-10 text-sm">Última actualización: Abril 2026</p>

        <div className="space-y-6">
          {secciones.map((s, i) => (
            <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-lg font-semibold text-gray-800 mb-3">{s.titulo}</h2>
              <p className="text-gray-600 leading-relaxed">{s.contenido}</p>
            </div>
          ))}
        </div>

        <div className="mt-10 text-center">
          <p className="text-gray-400 text-sm mb-4">¿Tienes alguna pregunta sobre nuestros términos?</p>
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
