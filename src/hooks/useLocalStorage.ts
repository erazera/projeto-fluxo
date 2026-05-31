"use client";

import { useState, useEffect } from "react";

/**
 * Hook customizado para gerenciar estado sincronizado com o localStorage.
 * SSR-safe: lida com a hidratação no Next.js (typeof window !== "undefined").
 */
export function useLocalStorage<T>(key: string, initialValue: T) {
  // Estado para armazenar o valor
  const [storedValue, setStoredValue] = useState<T>(initialValue);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    // Marca como hidratado para permitir renderização que depende do localStorage
    setIsHydrated(true);

    if (typeof window === "undefined") {
      return;
    }

    try {
      const item = window.localStorage.getItem(key);
      if (item) {
        setStoredValue(JSON.parse(item));
      } else {
        // Inicializa com o valor default caso a chave não exista
        window.localStorage.setItem(key, JSON.stringify(initialValue));
        setStoredValue(initialValue);
      }
    } catch (error) {
      console.warn(`Erro ao ler localStorage key "${key}":`, error);
    }
  }, [key]);

  // Função para setar o valor
  const setValue = (value: T | ((val: T) => T)) => {
    try {
      // Permite o mesmo padrão de API do useState (função ou valor)
      const valueToStore =
        value instanceof Function ? value(storedValue) : value;

      // Salva no React state
      setStoredValue(valueToStore);

      // Salva no localStorage
      if (typeof window !== "undefined") {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.warn(`Erro ao salvar no localStorage key "${key}":`, error);
    }
  };

  return [storedValue, setValue, isHydrated] as const;
}
