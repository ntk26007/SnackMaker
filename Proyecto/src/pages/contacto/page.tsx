import { useState } from 'react';
import { Link } from 'react-router-dom';

export default function ContactoPage() {
  const [enviado, setEnviado] = useState(false);
  const [form, setForm] = useState({ nombre: '', email: '', asunto: '', mensaje: '' });

  const handleSubmit = (e: React.MouseEvent) => {
    e.preventDefault();
    if (form.nombre && form.email && form.mensaje) {
      setEnviado(true);
    }
  };

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

      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 pt-36 pb-16">
        <h1 className="text-4xl font-bold text-gray-800 mb-2" style={{ fontFamily: '"Pacifico", serif' }}>
          Contacto
        </h1>
        <p className="text-gray-500 mb-10 text-lg">¿Tienes alguna pregunta o sugerencia? Escríbenos.</p>

        {enviado ? (
          <div className="bg-green-50 border border-green-200 rounded-2xl p-10 text-center">
            <div className="text-5xl mb-4">🎉</div>
            <h2 className="text-2xl font-bold text-green-700 mb-2">¡Mensaje enviado!</h2>
            <p className="text-green-600 mb-6">Nos pondremos en contacto contigo lo antes posible.</p>
            <Link
              to="/"
              className="inline-block bg-gradient-to-r from-pink-500 to-pink-600 text-white px-6 py-3 rounded-full hover:from-pink-600 hover:to-pink-700 transition-all font-medium"
            >
              Volver al inicio
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                <input
                  type="text"
                  value={form.nombre}
                  onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                  placeholder="Tu nombre"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-pink-300 focus:border-transparent transition"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="tu@email.com"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-pink-300 focus:border-transparent transition"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Asunto</label>
                <input
                  type="text"
                  value={form.asunto}
                  onChange={(e) => setForm({ ...form, asunto: e.target.value })}
                  placeholder="¿Sobre qué nos escribes?"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-pink-300 focus:border-transparent transition"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mensaje</label>
                <textarea
                  value={form.mensaje}
                  onChange={(e) => setForm({ ...form, mensaje: e.target.value })}
                  placeholder="Cuéntanos en qué podemos ayudarte..."
                  rows={5}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-pink-300 focus:border-transparent transition resize-none"
                />
              </div>
              <button
                onClick={handleSubmit}
                className="w-full bg-gradient-to-r from-pink-500 to-pink-600 text-white py-3 rounded-xl hover:from-pink-600 hover:to-pink-700 transition-all font-medium text-lg cursor-pointer"
              >
                Enviar mensaje
              </button>
            </div>
          </div>
        )}

        {/* Info de contacto */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { icon: 'ri-mail-line', label: 'Email', valor: 'hola@snackmaker.com' },
            { icon: 'ri-time-line', label: 'Horario', valor: 'Lun–Vie 9:00–18:00' },
            { icon: 'ri-map-pin-line', label: 'Ubicación', valor: 'España' },
          ].map((item, i) => (
            <div key={i} className="bg-white rounded-2xl p-5 text-center shadow-sm border border-gray-100">
              <i className={`${item.icon} text-2xl text-pink-500 mb-2 block`}></i>
              <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">{item.label}</p>
              <p className="text-sm text-gray-700 font-medium">{item.valor}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}