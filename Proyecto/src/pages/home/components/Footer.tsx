import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-gray-800 text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <Link to="/">
              <h3 className="text-2xl font-bold mb-4 hover:text-pink-400 transition-colors inline-block cursor-pointer" style={{ fontFamily: '"Pacifico", serif' }}>
                SnackMaker
              </h3>
            </Link>
            <p className="text-gray-300 mb-4">
              Crea snacks personalizados con los mejores ingredientes. 
              Mezcla, combina y disfruta de sabores únicos hechos especialmente para ti.
            </p>
            <div className="flex space-x-4">
              <a
                href="https://www.facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-300 hover:text-pink-400 transition-colors cursor-pointer"
              >
                <i className="ri-facebook-fill text-xl"></i>
              </a>
              <a
                href="https://www.instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-300 hover:text-pink-400 transition-colors cursor-pointer"
              >
                <i className="ri-instagram-line text-xl"></i>
              </a>
              <a
                href="https://www.twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-300 hover:text-pink-400 transition-colors cursor-pointer"
              >
                <i className="ri-twitter-line text-xl"></i>
              </a>
            </div>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Enlaces</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-300 hover:text-pink-400 transition-colors cursor-pointer">
                  Crear Snack
                </Link>
              </li>
              <li>
                <Link to="/inventory" className="text-gray-300 hover:text-pink-400 transition-colors cursor-pointer">
                  Inventario y compras
                </Link>
              </li>
              <li>
                <Link to="/ranking" className="text-gray-300 hover:text-pink-400 transition-colors cursor-pointer">
                  Ranking
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Soporte</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/ayuda" className="text-gray-300 hover:text-pink-400 transition-colors cursor-pointer">
                  Ayuda
                </Link>
              </li>
              <li>
                <Link to="/contacto" className="text-gray-300 hover:text-pink-400 transition-colors cursor-pointer">
                  Contacto
                </Link>
              </li>
              <li>
                <Link to="/terminos" className="text-gray-300 hover:text-pink-400 transition-colors cursor-pointer">
                  Términos
                </Link>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-700 mt-8 pt-8 text-center">
          <p className="text-gray-400">
            © 2024 SnackMaker. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}
