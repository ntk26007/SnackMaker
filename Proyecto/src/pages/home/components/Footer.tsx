
export default function Footer() {
  return (
    <footer className="bg-gray-800 text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <h3 className="text-2xl font-bold mb-4" style={{ fontFamily: '"Pacifico", serif' }}>
              SnackMaker
            </h3>
            <p className="text-gray-300 mb-4">
              Crea snacks personalizados con los mejores ingredientes. 
              Mezcla, combina y disfruta de sabores únicos hechos especialmente para ti.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-300 hover:text-pink-400 transition-colors cursor-pointer">
                <i className="ri-facebook-fill text-xl"></i>
              </a>
              <a href="#" className="text-gray-300 hover:text-pink-400 transition-colors cursor-pointer">
                <i className="ri-instagram-line text-xl"></i>
              </a>
              <a href="#" className="text-gray-300 hover:text-pink-400 transition-colors cursor-pointer">
                <i className="ri-twitter-line text-xl"></i>
              </a>
            </div>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Enlaces</h4>
            <ul className="space-y-2">
              <li>
                <a href="/" className="text-gray-300 hover:text-pink-400 transition-colors cursor-pointer">
                  Crear Snack
                </a>
              </li>
              <li>
                <a href="/inventory" className="text-gray-300 hover:text-pink-400 transition-colors cursor-pointer">
                  Inventario y compras
                </a>
              </li>
              <li>
                <a href="/ranking" className="text-gray-300 hover:text-pink-400 transition-colors cursor-pointer">
                  Ranking
                </a>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Soporte</h4>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-gray-300 hover:text-pink-400 transition-colors cursor-pointer">
                  Ayuda
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-pink-400 transition-colors cursor-pointer">
                  Contacto
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-pink-400 transition-colors cursor-pointer">
                  Términos
                </a>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-700 mt-8 pt-8 text-center">
          <p className="text-gray-400">
            © 2024 SnackMaker. Todos los derechos reservados. | 
            <a 
              href="https://readdy.ai/?origin=logo" 
              className="text-pink-400 hover:text-pink-300 transition-colors cursor-pointer ml-1"
            >
              Powered by Readdy
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
