# Ejemplo Completo: Página de Recuperación de Contraseña (Frontend)

Este es un ejemplo completo usando React/Next.js que muestra los mensajes específicos según si el email existe o no.

## Componente de Forgot Password

```tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const response = await fetch('http://localhost:3000/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        if (data.success) {
          // Email encontrado, instrucciones enviadas
          setSuccess(true);
          setError('');
        } else {
          // Email no encontrado
          setError(data.message);
          setSuccess(false);
        }
      } else {
        setError(data.message || 'Error al procesar la solicitud');
      }
    } catch (error) {
      setError('Error de conexión. Por favor, intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center">
            <svg
              className="h-8 w-8 text-blue-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            ¿Olvidaste tu contraseña?
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Ingresa tu correo electrónico y te enviaremos instrucciones para recuperar tu cuenta.
          </p>
        </div>

        {/* Formulario */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Correo Electrónico
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="tu-email@ejemplo.com"
            />
          </div>

          {/* Mensaje de Éxito */}
          {success && (
            <div className="rounded-md bg-green-50 p-4 border border-green-200">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-green-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-green-800">
                    ¡Correo enviado exitosamente!
                  </p>
                  <p className="mt-2 text-sm text-green-700">
                    Se han enviado las instrucciones de recuperación a tu correo electrónico. Por favor, revisa tu bandeja de entrada y sigue los pasos. El enlace expirará en 1 hora.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Mensaje de Error */}
          {error && (
            <div className="rounded-md bg-red-50 p-4 border border-red-200">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-red-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-red-800">
                    Error
                  </p>
                  <p className="mt-2 text-sm text-red-700">
                    {error}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Botón de Envío */}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center">
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Enviando...
              </span>
            ) : (
              <span className="flex items-center">
                <svg
                  className="-ml-1 mr-2 h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
                Enviar Instrucciones
              </span>
            )}
          </button>

          {/* Link para volver al login */}
          <div className="text-center">
            <button
              type="button"
              onClick={() => router.push('/login')}
              className="text-sm text-blue-600 hover:text-blue-500"
            >
              ¿Recordaste tu contraseña? Volver al login
            </button>
          </div>
        </form>

        {/* Nota informativa */}
        {success && (
          <div className="mt-6 p-4 bg-blue-50 rounded-md">
            <p className="text-xs text-blue-700">
              <strong>Nota:</strong> Si no recibes el correo en unos minutos:
            </p>
            <ul className="mt-2 text-xs text-blue-600 list-disc list-inside space-y-1">
              <li>Revisa tu carpeta de spam o correo no deseado</li>
              <li>Verifica que el correo esté escrito correctamente</li>
              <li>Espera unos minutos, puede haber retraso en la entrega</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
```

## Ejemplo con Validación en Tiempo Real

```tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ForgotPasswordPageWithValidation() {
  const [email, setEmail] = useState('');
  const [emailValid, setEmailValid] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  // Validación de email en tiempo real
  useEffect(() => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    setEmailValid(emailRegex.test(email));
  }, [email]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!emailValid) {
      setError('Por favor, ingresa un correo electrónico válido');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const response = await fetch('http://localhost:3000/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        if (data.success) {
          setSuccess(true);
          setError('');
          // Limpiar el formulario
          setEmail('');
        } else {
          setError(data.message);
          setSuccess(false);
        }
      } else {
        setError(data.message || 'Error al procesar la solicitud');
      }
    } catch (error) {
      setError('Error de conexión. Por favor, intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="email">Correo Electrónico</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="tu-email@ejemplo.com"
            required
          />
          {email && !emailValid && (
            <p className="text-red-500 text-xs mt-1">
              Por favor, ingresa un email válido
            </p>
          )}
        </div>

        {success && (
          <div className="alert alert-success">
            ✅ Se han enviado las instrucciones a tu correo
          </div>
        )}

        {error && (
          <div className="alert alert-error">
            ❌ {error}
          </div>
        )}

        <button 
          type="submit" 
          disabled={loading || !emailValid || !email}
        >
          {loading ? 'Enviando...' : 'Enviar Instrucciones'}
        </button>

        <button
          type="button"
          onClick={() => router.push('/login')}
          className="link-button"
        >
          Volver al login
        </button>
      </form>
    </div>
  );
}
```

## Manejo de Estados

```typescript
// Estados posibles del componente
interface ForgotPasswordState {
  email: string;
  loading: boolean;
  success: boolean;
  error: string;
}

// Respuesta del backend
interface ForgotPasswordResponse {
  success: boolean;
  message: string;
}

// Lógica de manejo
const handleForgotPassword = async (email: string) => {
  const response = await fetch('/auth/forgot-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });

  const data: ForgotPasswordResponse = await response.json();

  if (data.success) {
    // Email encontrado, instrucciones enviadas
    return {
      type: 'SUCCESS',
      message: data.message
    };
  } else {
    // Email no encontrado
    return {
      type: 'ERROR',
      message: data.message
    };
  }
};
```

## Estilos CSS (Tailwind)

```css
/* Mensaje de éxito */
.success-message {
  @apply bg-green-50 border border-green-200 text-green-800 p-4 rounded-md;
}

/* Mensaje de error */
.error-message {
  @apply bg-red-50 border border-red-200 text-red-800 p-4 rounded-md;
}

/* Input con validación */
.input-valid {
  @apply border-green-500 focus:ring-green-500;
}

.input-invalid {
  @apply border-red-500 focus:ring-red-500;
}
```

## Testing en Frontend

```typescript
// Test con email existente
test('muestra mensaje de éxito cuando el email existe', async () => {
  const mockResponse = {
    success: true,
    message: 'Se han enviado las instrucciones...'
  };

  global.fetch = jest.fn(() =>
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    })
  );

  // Renderizar componente y hacer submit
  // Verificar que se muestra el mensaje de éxito
});

// Test con email no existente
test('muestra mensaje de error cuando el email no existe', async () => {
  const mockResponse = {
    success: false,
    message: 'No se encontró ninguna cuenta...'
  };

  global.fetch = jest.fn(() =>
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    })
  );

  // Renderizar componente y hacer submit
  // Verificar que se muestra el mensaje de error
});
```

## Mejores Prácticas

1. **Validar email antes de enviar:**
   - Formato correcto
   - No vacío
   - Regex básico

2. **Mostrar estados claros:**
   - Loading mientras procesa
   - Success con instrucciones
   - Error con mensaje específico

3. **UX mejorada:**
   - Deshabilitar botón durante loading
   - Limpiar formulario después de éxito
   - Mostrar spinner o animación

4. **Accesibilidad:**
   - Labels correctos
   - ARIA attributes
   - Focus management
   - Mensajes legibles por screen readers
