/**
 * useConfirmation.ts - Semana 4
 * Abigail Plua - Hook para manejo de confirmaciones
 * Sistema de Recomendaciones Turísticas
 */

import { useState, useEffect } from 'react';
import { confirmationService } from '../services/confirmation.service';
import { ConfirmationData } from '../components/common/ConfirmationModal';

export interface UseConfirmationReturn {
  currentConfirmation: ConfirmationData | null;
  isOpen: boolean;
  allConfirmations: ConfirmationData[];
  showTourPurchaseConfirmation: typeof confirmationService.showTourPurchaseConfirmation;
  showPartnerReservationConfirmation: typeof confirmationService.showPartnerReservationConfirmation;
  showSystemNotification: typeof confirmationService.showSystemNotification;
  close: (id?: string) => void;
  closeAll: () => void;
}

export const useConfirmation = (): UseConfirmationReturn => {
  const [currentConfirmation, setCurrentConfirmation] = useState<ConfirmationData | null>(
    confirmationService.getCurrentConfirmation()
  );
  const [allConfirmations, setAllConfirmations] = useState<ConfirmationData[]>(
    confirmationService.getAllConfirmations()
  );

  useEffect(() => {
    // Suscribirse a cambios en el servicio de confirmaciones
    const unsubscribe = confirmationService.subscribe((confirmation) => {
      setCurrentConfirmation(confirmationService.getCurrentConfirmation());
      setAllConfirmations(confirmationService.getAllConfirmations());
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const close = (id?: string) => {
    if (id) {
      confirmationService.close(id);
    } else if (currentConfirmation) {
      confirmationService.close(currentConfirmation.id);
    }
  };

  const closeAll = () => {
    confirmationService.closeAll();
  };

  return {
    currentConfirmation,
    isOpen: currentConfirmation !== null,
    allConfirmations,
    showTourPurchaseConfirmation: confirmationService.showTourPurchaseConfirmation.bind(confirmationService),
    showPartnerReservationConfirmation: confirmationService.showPartnerReservationConfirmation.bind(confirmationService),
    showSystemNotification: confirmationService.showSystemNotification.bind(confirmationService),
    close,
    closeAll
  };
};

export default useConfirmation;