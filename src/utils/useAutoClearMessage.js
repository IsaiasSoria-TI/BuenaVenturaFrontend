import * as React from 'react';

// Limpia mensajes temporales, como confirmaciones de registro, despues de unos segundos.
export function useAutoClearMessage(message, clearMessage, delay = 2000) {
  React.useEffect(() => {
    if (!message) return undefined;

    const timeoutId = window.setTimeout(() => {
      clearMessage('');
    }, delay);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [message, clearMessage, delay]);
}
