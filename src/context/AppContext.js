import React, { createContext, useContext, useState } from 'react';
import { setAuthToken } from '../services/api';

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [ultimosConsultados, setUltimosConsultados] = useState({});
  const [totalImagenes, setTotalImagenes] = useState(0);
  const [usuario, setUsuarioState] = useState(null);

  const setUsuario = (data) => {
    setUsuarioState(data);
    if (data?.token) {
      setAuthToken(data.token);
    }
  };

  const cerrarSesion = () => {
    setUsuarioState(null);
    setAuthToken(null);
  };

  const actualizarUltimoConsultado = (anime, personaje) => {
    setUltimosConsultados(prev => ({
      ...prev,
      [anime]: personaje,
    }));
  };

  const sumarImagenes = (cantidad) => {
    setTotalImagenes(prev => prev + cantidad);
  };

  return (
    <AppContext.Provider value={{
      ultimosConsultados,
      totalImagenes,
      usuario,
      setUsuario,
      cerrarSesion,
      actualizarUltimoConsultado,
      sumarImagenes,
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => useContext(AppContext);