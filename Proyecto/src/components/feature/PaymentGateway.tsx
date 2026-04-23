import { useState } from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Ingredient {
  id: string;
  name: string;
  quantity: number;
  price: number;
}

interface PaymentGatewayProps {
  snackName: string;
  ingredients: Ingredient[];
  totalPrice: number;
  userEmail: string;
  onConfirm: () => Promise<void>;
  onCancel: () => void;
  onAfterSuccess?: () => void;
}

type Step = 'checkout' | 'processing' | 'success';

const PROCESSING_MESSAGES = [
  'Procesando tu pago...',
  'Verificando seguridad 3D Secure...',
  'Conectando con el banco...',
  'Confirmando pedido...',
];

function formatCardNumber(raw: string): string {
  const digits = raw.replace(/\D/g, '').slice(0, 16);
  return digits.match(/.{1,4}/g)?.join(' ') ?? digits;
}

function formatExpiry(raw: string): string {
  const digits = raw.replace(/\D/g, '').slice(0, 4);
  if (digits.length >= 3) return digits.slice(0, 2) + '/' + digits.slice(2);
  return digits;
}

function getDeliveryDate(): string {
  const d = new Date();
  d.setDate(d.getDate() + Math.floor(3 + Math.random() * 4));
  return d.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' });
}

function randomOrderId(): string {
  return '#SM-' + Math.floor(10000 + Math.random() * 90000);
}

// ─── InputField: FUERA del componente principal para evitar que pierda el foco ─

interface InputFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  maxLength?: number;
  errors: Record<string, string>;
}

function InputField({
  id,
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
  maxLength,
  errors,
}: InputFieldProps) {
  return (
    <div className="mb-4">
      <label className="block text-xs text-gray-500 mb-1.5">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        maxLength={maxLength}
        className={`w-full px-3 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent transition-all ${
          errors[id] ? 'border-red-400 bg-red-50' : 'border-gray-200'
        }`}
      />
      {errors[id] && (
        <p className="text-xs text-red-500 mt-1">
          <i className="ri-error-warning-line mr-1" />
          {errors[id]}
        </p>
      )}
    </div>
  );
}

// ─── StepIndicator ────────────────────────────────────────────────────────────

function StepIndicator({ step }: { step: Step }) {
  const done = (s: Step) =>
    (step === 'processing' && s === 'checkout') || step === 'success';
  const active = (s: Step) => step === s;

  const cls = (s: Step) =>
    done(s) ? 'text-green-600' : active(s) ? 'text-pink-600' : 'text-gray-400';

  const numCls = (s: Step) =>
    done(s)
      ? 'bg-green-100 border-green-500 text-green-700'
      : active(s)
      ? 'bg-pink-500 border-pink-500 text-white'
      : 'border-gray-300 text-gray-400';

  const lineCls = (after: Step) =>
    (step === 'processing' && after === 'checkout') || step === 'success'
      ? 'bg-green-400'
      : 'bg-gray-200';

  return (
    <div className="flex items-center gap-0 mb-6">
      {(['checkout', 'processing', 'success'] as Step[]).map((s, i) => (
        <div key={s} className="flex items-center flex-1 last:flex-none">
          <div className={`flex items-center gap-2 text-sm font-medium ${cls(s)}`}>
            <div
              className={`w-7 h-7 rounded-full border-2 flex items-center justify-center text-xs font-semibold flex-shrink-0 ${numCls(s)}`}
            >
              {done(s) ? <i className="ri-check-line text-xs" /> : i + 1}
            </div>
            <span className="hidden sm:inline">
              {s === 'checkout' ? 'Pago' : s === 'processing' ? 'Confirmación' : 'Listo'}
            </span>
          </div>
          {i < 2 && <div className={`flex-1 h-px mx-3 ${lineCls(s)}`} />}
        </div>
      ))}
    </div>
  );
}

// ─── CardVisual ───────────────────────────────────────────────────────────────

function CardVisual({ number, name, expiry }: { number: string; name: string; expiry: string }) {
  const displayNum = () => {
    const digits = number.replace(/\s/g, '');
    const padded = (digits + '????????????????').slice(0, 16);
    return padded.match(/.{1,4}/g)?.join(' ') ?? '•••• •••• •••• ••••';
  };

  return (
    <div
      className="rounded-2xl p-5 mb-5 text-white relative overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #D4537E 0%, #7b2d50 100%)' }}
    >
      <div className="absolute -right-8 -top-8 w-40 h-40 rounded-full opacity-10 bg-white" />
      <div className="absolute -right-4 top-8 w-24 h-24 rounded-full opacity-10 bg-white" />
      <div className="w-10 h-7 rounded mb-4 relative overflow-hidden" style={{ background: 'rgba(255,255,255,0.3)' }}>
        <div className="absolute inset-y-0 left-1/2 w-px bg-white/40" />
        <div className="absolute inset-x-0 top-1/2 h-px bg-white/40" />
      </div>
      <div className="font-mono text-lg tracking-widest mb-4 opacity-95">{displayNum()}</div>
      <div className="flex justify-between text-xs">
        <div>
          <div className="opacity-60 mb-1">TITULAR</div>
          <div className="uppercase tracking-wider text-sm font-medium">
            {name.trim() || 'Nombre Apellido'}
          </div>
        </div>
        <div className="text-right">
          <div className="opacity-60 mb-1">CADUCA</div>
          <div className="text-sm font-medium">{expiry || 'MM/AA'}</div>
        </div>
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function PaymentGateway({
  snackName,
  ingredients,
  totalPrice,
  userEmail,
  onConfirm,
  onCancel,
  onAfterSuccess,
}: PaymentGatewayProps) {
  const [payMethod, setPayMethod] = useState<'card' | 'paypal' | 'bizum'>('card');
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [bizumPhone, setBizumPhone] = useState('');
  const [email, setEmail] = useState(userEmail);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [address, setAddress] = useState('');
  const [zip, setZip] = useState('');
  const [city, setCity] = useState('');
  const [step, setStep] = useState<Step>('checkout');
  const [procMsg, setProcMsg] = useState(PROCESSING_MESSAGES[0]);
  const [orderId] = useState(randomOrderId);
  const [deliveryDate] = useState(getDeliveryDate);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (payMethod === 'card') {
      if (cardNumber.replace(/\s/g, '').length < 16) errs.cardNumber = 'Número de tarjeta inválido';
      if (!/^\d{2}\/\d{2}$/.test(cardExpiry)) errs.cardExpiry = 'Fecha inválida';
      if (cardCvv.length < 3) errs.cardCvv = 'CVV inválido';
      if (!cardName.trim()) errs.cardName = 'Introduce el nombre del titular';
    }
    if (payMethod === 'bizum' && bizumPhone.length < 9) {
      errs.bizumPhone = 'Número de teléfono inválido';
    }
    if (!email.includes('@')) errs.email = 'Email inválido';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handlePay = async () => {
    if (!validate()) return;
    setStep('processing');
    let i = 0;
    const interval = setInterval(() => {
      i++;
      if (i < PROCESSING_MESSAGES.length) {
        setProcMsg(PROCESSING_MESSAGES[i]);
      } else {
        clearInterval(interval);
        onConfirm()
          .then(() => setStep('success'))
          .catch(() => {
            setStep('checkout');
            setErrors({ general: 'Error al procesar el pago. Inténtalo de nuevo.' });
          });
      }
    }, 850);
  };

  const lastFour = cardNumber.replace(/\s/g, '').slice(-4) || '????';
  const payMethodLabel =
    payMethod === 'card' ? `Tarjeta •••• ${lastFour}` : payMethod === 'paypal' ? 'PayPal' : 'Bizum';

  const renderCheckout = () => (
    <>
      {/* Order summary */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-4">
        <div className="flex items-center gap-2 mb-3">
          <span className="inline-flex items-center gap-1.5 bg-pink-50 text-pink-700 text-xs px-3 py-1 rounded-full font-medium">
            <i className="ri-heart-line" /> {snackName}
          </span>
        </div>
        <h3 className="font-semibold text-gray-700 text-sm mb-3">Resumen del pedido</h3>
        <div className="space-y-0">
          {ingredients.map((ing) => (
            <div key={ing.id} className="flex justify-between items-center py-2 border-b border-gray-50 text-sm last:border-0">
              <span className="text-gray-700">
                {ing.name}
                <span className="text-gray-400 text-xs ml-1.5">×{ing.quantity}</span>
              </span>
              <span className="text-gray-500">${(ing.price * ing.quantity).toFixed(2)}</span>
            </div>
          ))}
        </div>
        <div className="pt-3 mt-1 border-t border-gray-100 space-y-1">
          <div className="flex justify-between text-sm text-gray-500">
            <span>Subtotal</span><span>${totalPrice.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Envío</span>
            <span className="text-green-600 font-medium">Gratis</span>
          </div>
          <div className="flex justify-between items-baseline pt-2">
            <span className="font-semibold text-gray-800">Total</span>
            <span className="text-xl font-bold text-pink-600">${totalPrice.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Payment method */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-4">
        <h3 className="font-semibold text-gray-700 text-sm mb-3">Método de pago</h3>
        <div className="grid grid-cols-3 gap-2 mb-4">
          {(['card', 'paypal', 'bizum'] as const).map((pm) => (
            <button
              key={pm}
              onClick={() => setPayMethod(pm)}
              className={`flex flex-col items-center gap-1.5 py-3 rounded-xl border-2 text-xs font-medium transition-all cursor-pointer ${
                payMethod === pm
                  ? 'border-pink-500 text-pink-600 bg-pink-50'
                  : 'border-gray-200 text-gray-500 hover:border-gray-300'
              }`}
            >
              {pm === 'card' && <i className="ri-bank-card-line text-lg" />}
              {pm === 'paypal' && <i className="ri-paypal-line text-lg" />}
              {pm === 'bizum' && <i className="ri-smartphone-line text-lg" />}
              {pm === 'card' ? 'Tarjeta' : pm === 'paypal' ? 'PayPal' : 'Bizum'}
            </button>
          ))}
        </div>

        {payMethod === 'card' && (
          <>
            <div className="flex items-center gap-2 mb-4">
              <div className="px-2 py-1 rounded text-xs font-bold italic text-white bg-blue-900">VISA</div>
              <div className="px-2 py-1 rounded text-xs font-bold text-white bg-red-600">MC</div>
              <div className="px-2 py-1 rounded text-xs font-bold text-white bg-blue-500">AMEX</div>
              <span className="text-xs text-gray-400 ml-auto">y más</span>
            </div>
            <CardVisual number={cardNumber} name={cardName} expiry={cardExpiry} />
            <InputField
              id="cardNumber" label="Número de tarjeta" value={cardNumber}
              onChange={(v) => setCardNumber(formatCardNumber(v))}
              placeholder="1234 5678 9012 3456" maxLength={19} errors={errors}
            />
            <InputField
              id="cardName" label="Nombre en la tarjeta" value={cardName}
              onChange={setCardName} placeholder="Como aparece en la tarjeta" errors={errors}
            />
            <div className="grid grid-cols-2 gap-3">
              <InputField
                id="cardExpiry" label="Caducidad" value={cardExpiry}
                onChange={(v) => setCardExpiry(formatExpiry(v))}
                placeholder="MM/AA" maxLength={5} errors={errors}
              />
              <InputField
                id="cardCvv" label="CVV" value={cardCvv}
                onChange={(v) => setCardCvv(v.replace(/\D/g, '').slice(0, 4))}
                placeholder="•••" maxLength={4} errors={errors}
              />
            </div>
          </>
        )}

        {payMethod === 'paypal' && (
          <div className="text-center py-6">
            <div className="text-3xl font-black tracking-tight mb-2">
              <span style={{ color: '#003087' }}>Pay</span>
              <span style={{ color: '#009cde' }}>Pal</span>
            </div>
            <p className="text-sm text-gray-500">
              Serás redirigido a PayPal para completar el pago de forma segura.
            </p>
          </div>
        )}

        {payMethod === 'bizum' && (
          <>
            <InputField
              id="bizumPhone" label="Número de teléfono" value={bizumPhone}
              onChange={(v) => setBizumPhone(v.replace(/\D/g, '').slice(0, 9))}
              placeholder="6XX XXX XXX" maxLength={9} errors={errors}
            />
            <p className="text-xs text-gray-400 -mt-2 mb-4">
              <i className="ri-information-line mr-1" />
              Recibirás una notificación en tu app bancaria para confirmar.
            </p>
          </>
        )}

        <div className="flex flex-wrap gap-3 mt-3 pt-3 border-t border-gray-100">
          {['Pago SSL seguro', '3D Secure', 'Sin cargos reales'].map((badge) => (
            <span key={badge} className="flex items-center gap-1 text-xs text-gray-400">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
              {badge}
            </span>
          ))}
        </div>
      </div>

      {/* Shipping address */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-5">
        <h3 className="font-semibold text-gray-700 text-sm mb-3">Datos de entrega</h3>
        <InputField
          id="email" label="Email de confirmación" value={email}
          onChange={setEmail} placeholder="tu@email.com" type="email" errors={errors}
        />
        <div className="grid grid-cols-2 gap-3">
          <InputField id="firstName" label="Nombre" value={firstName} onChange={setFirstName} placeholder="Nombre" errors={errors} />
          <InputField id="lastName" label="Apellidos" value={lastName} onChange={setLastName} placeholder="Apellidos" errors={errors} />
        </div>
        <InputField id="address" label="Dirección" value={address} onChange={setAddress} placeholder="Calle y número" errors={errors} />
        <div className="grid grid-cols-2 gap-3">
          <InputField
            id="zip" label="Código postal" value={zip}
            onChange={(v) => setZip(v.replace(/\D/g, '').slice(0, 5))}
            placeholder="45000" maxLength={5} errors={errors}
          />
          <InputField id="city" label="Ciudad" value={city} onChange={setCity} placeholder="Ciudad" errors={errors} />
        </div>
      </div>

      {errors.general && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-4 text-sm text-red-600 flex items-center gap-2">
          <i className="ri-error-warning-line" /> {errors.general}
        </div>
      )}

      <button
        onClick={handlePay}
        className="w-full py-4 rounded-2xl font-semibold text-white text-base transition-all hover:opacity-90 active:scale-95 cursor-pointer whitespace-nowrap"
        style={{ background: 'linear-gradient(135deg, #D4537E, #993556)' }}
      >
        <i className="ri-secure-payment-line mr-2" />
        Pagar ${totalPrice.toFixed(2)} — Confirmar pedido
      </button>

      <p className="text-center text-xs text-gray-400 mt-3">
        Esta es una demo — no se procesarán cargos reales
      </p>

      <button
        onClick={onCancel}
        className="w-full mt-2 py-2.5 text-sm text-gray-500 hover:text-gray-700 transition-colors cursor-pointer"
      >
        Cancelar
      </button>
    </>
  );

  const renderProcessing = () => (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-10 text-center">
      <div className="w-14 h-14 border-4 border-pink-100 border-t-pink-500 rounded-full animate-spin mx-auto mb-5" />
      <p className="font-semibold text-gray-800 text-lg mb-2">{procMsg}</p>
      <p className="text-sm text-gray-400">Por favor, no cierres esta ventana</p>
    </div>
  );

  const renderSuccess = () => (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center">
      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
        <i className="ri-check-line text-green-600 text-2xl" />
      </div>
      <h3 className="text-xl font-bold text-gray-800 mb-2">¡Pedido confirmado!</h3>
      <p className="text-sm text-gray-500 mb-6">
        Tu snack está en camino. Recibirás un email en{' '}
        <span className="font-medium text-gray-700">{email}</span>
      </p>
      <div className="bg-gray-50 rounded-xl p-4 text-left mb-6 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Total cobrado</span>
          <span className="font-semibold text-pink-600">${totalPrice.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Nº de pedido</span>
          <span className="font-semibold">{orderId}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Método de pago</span>
          <span className="font-semibold">{payMethodLabel}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Entrega estimada</span>
          <span className="font-semibold">{deliveryDate}</span>
        </div>
        <div className="flex justify-between text-sm pt-1 border-t border-gray-200">
          <span className="text-gray-500">Estado</span>
          <span className="text-green-600 font-semibold">
            <i className="ri-check-line mr-1" />Pagado
          </span>
        </div>
      </div>
      <div className="flex gap-3">
        <button
          onClick={onAfterSuccess ?? onCancel}
          className="flex-1 py-3 rounded-xl font-semibold text-white text-sm cursor-pointer whitespace-nowrap"
          style={{ background: 'linear-gradient(135deg, #D4537E, #993556)' }}
        >
          <i className="ri-add-line mr-1" />
          Crear otro snack
        </button>
        <a
          href="/inventory"
          className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold text-sm hover:bg-gray-200 transition-colors text-center whitespace-nowrap"
        >
          <i className="ri-archive-line mr-1" />
          Ver inventario
        </a>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/50 flex items-start justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-gray-50 rounded-3xl w-full max-w-lg my-8 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 flex items-center justify-center">
              <span className="text-xl">🍬</span>
            </div>
            <span
              className="text-xl font-bold text-gray-800"
              style={{ fontFamily: '"Pacifico", serif' }}
            >
              SnackMaker
            </span>
          </div>
          {step === 'checkout' && (
            <button
              onClick={onCancel}
              className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300 transition-colors cursor-pointer"
            >
              <i className="ri-close-line text-gray-600" />
            </button>
          )}
        </div>

        <StepIndicator step={step} />

        {step === 'checkout' && renderCheckout()}
        {step === 'processing' && renderProcessing()}
        {step === 'success' && renderSuccess()}
      </div>
    </div>
  );
}