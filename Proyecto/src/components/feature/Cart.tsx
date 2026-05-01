import { useCart } from '@/context/CartContext';
import { Link } from 'react-router-dom';

/**
 * Cart — icono de carrito para la barra de navegación.
 * Al pulsar navega a /crear donde el SnackCreator muestra
 * los snacks del ranking en su panel "Tu Snack" (sección ②).
 * No abre ningún drawer propio — toda la gestión del carrito
 * ocurre dentro del SnackCreator.
 */
export default function Cart() {
  const { count } = useCart();

  if (count === 0) return null;

  return (
    <Link
      to="/crear"
      className="relative flex items-center justify-center w-10 h-10 text-gray-600 hover:text-pink-600 transition-colors"
      title={`Ver carrito (${count} artículo${count !== 1 ? 's' : ''})`}
    >
      <i className="ri-shopping-cart-2-line text-xl" />
      <span className="absolute -top-1 -right-1 bg-pink-500 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center leading-none">
        {count > 9 ? '9+' : count}
      </span>
    </Link>
  );
}