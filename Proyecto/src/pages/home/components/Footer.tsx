import { useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_PUBLIC_SUPABASE_URL,
  import.meta.env.VITE_PUBLIC_SUPABASE_ANON_KEY
);

export default function Footer() {
  const [showContactModal, setShowContactModal] = useState(false);
  const [formStatus, setFormStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [charCount, setCharCount] = useState(0);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);

    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const subject = formData.get('subject') as string;
    const message = formData.get('message') as string;

    if (!name || !email || !message) return;
    if (message.length > 500) return;

    setFormStatus('sending');

    try {
      // Save to Supabase
      const { error } = await supabase.from('contact_messages').insert({
        name,
        email,
        subject,
        message,
      });
      if (error) throw error;

      // Also send to form endpoint
      const body = new URLSearchParams();
      body.append('name', name);
      body.append('email', email);
      body.append('subject', subject || '');
      body.append('message', message);

      await fetch('https://readdy.ai/api/form/d7ktm6htql32ft4svefg', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: body.toString(),
      });

      setFormStatus('success');
      form.reset();
      setCharCount(0);
    } catch {
      setFormStatus('error');
    }
  };

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
                <button
                  onClick={() => { setShowContactModal(true); setFormStatus('idle'); }}
                  className="text-gray-300 hover:text-pink-400 transition-colors cursor-pointer text-left"
                >
                  Contacto
                </button>
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
            © 2024 SnackMaker. Todos los derechos reservados.
          </p>
        </div>
      </div>

      {/* Contact Modal */}
      {showContactModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-lg w-full text-gray-800 relative">
            <button
              onClick={() => { setShowContactModal(false); setFormStatus('idle'); }}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
            >
              <i className="ri-close-line text-xl"></i>
            </button>

            {formStatus === 'success' ? (
              <div className="text-center py-6">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i className="ri-check-line text-green-600 text-2xl"></i>
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">¡Mensaje enviado!</h3>
                <p className="text-gray-500 mb-6">Hemos recibido tu mensaje. Te responderemos lo antes posible.</p>
                <button
                  onClick={() => { setShowContactModal(false); setFormStatus('idle'); }}
                  className="bg-pink-500 text-white px-6 py-2.5 rounded-full font-semibold hover:bg-pink-600 transition-colors cursor-pointer whitespace-nowrap"
                >
                  Cerrar
                </button>
              </div>
            ) : (
              <>
                <div className="mb-6">
                  <h3 className="text-2xl font-bold text-gray-800 mb-1">Contacta con nosotros</h3>
                  <p className="text-gray-500 text-sm">Rellena el formulario y te responderemos pronto.</p>
                </div>

                <form onSubmit={handleSubmit} data-readdy-form id="contact-snackmaker">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
                      <input
                        type="text"
                        name="name"
                        required
                        placeholder="Tu nombre"
                        className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-pink-300 transition"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                      <input
                        type="email"
                        name="email"
                        required
                        placeholder="tu@email.com"
                        className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-pink-300 transition"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Asunto</label>
                      <input
                        type="text"
                        name="subject"
                        placeholder="¿En qué podemos ayudarte?"
                        className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-pink-300 transition"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Mensaje * <span className={`text-xs ${charCount > 500 ? 'text-red-500' : 'text-gray-400'}`}>({charCount}/500)</span>
                      </label>
                      <textarea
                        name="message"
                        required
                        rows={4}
                        maxLength={500}
                        placeholder="Escribe tu mensaje aquí..."
                        onChange={(e) => setCharCount(e.target.value.length)}
                        className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-pink-300 transition resize-none"
                      />
                    </div>
                  </div>

                  {formStatus === 'error' && (
                    <p className="text-red-500 text-sm mt-3">
                      <i className="ri-error-warning-line mr-1"></i>
                      Hubo un error al enviar. Inténtalo de nuevo.
                    </p>
                  )}

                  <div className="flex gap-3 mt-6">
                    <button
                      type="button"
                      onClick={() => { setShowContactModal(false); setFormStatus('idle'); }}
                      className="flex-1 bg-gray-100 text-gray-700 py-2.5 rounded-full font-semibold hover:bg-gray-200 transition-colors cursor-pointer whitespace-nowrap"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={formStatus === 'sending' || charCount > 500}
                      className="flex-1 bg-gradient-to-r from-pink-500 to-pink-600 text-white py-2.5 rounded-full font-semibold hover:from-pink-600 hover:to-pink-700 transition-all cursor-pointer whitespace-nowrap disabled:opacity-50"
                    >
                      {formStatus === 'sending' ? (
                        <><i className="ri-loader-4-line animate-spin mr-1"></i>Enviando...</>
                      ) : (
                        <><i className="ri-send-plane-line mr-1"></i>Enviar mensaje</>
                      )}
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </footer>
  );
}
