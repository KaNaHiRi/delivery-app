// app/hooks/useModalState.ts
import { useState, useCallback } from 'react';

// モーダルIDの型定義（型安全なモーダル管理）
export type ModalId =
  | 'delivery'
  | 'export'
  | 'import'
  | 'backup'
  | 'notification'
  | 'analytics'
  | 'advancedFilter'
  | 'filterPresets'
  | 'shortcutHelp'
  | 'report'
  | 'email'
  | 'history'
  | 'master'
  | 'dashboardCustomize';

type ModalState = Record<ModalId, boolean>;

const INITIAL_MODAL_STATE: ModalState = {
  delivery: false,
  export: false,
  import: false,
  backup: false,
  notification: false,
  analytics: false,
  advancedFilter: false,
  filterPresets: false,
  shortcutHelp: false,
  report: false,
  email: false,
  history: false,
  master: false,
  dashboardCustomize: false,
};

export function useModalState() {
  const [modals, setModals] = useState<ModalState>(INITIAL_MODAL_STATE);

  const openModal = useCallback((id: ModalId) => {
    setModals(prev => ({ ...prev, [id]: true }));
  }, []);

  const closeModal = useCallback((id: ModalId) => {
    setModals(prev => ({ ...prev, [id]: false }));
  }, []);

  const toggleModal = useCallback((id: ModalId) => {
    setModals(prev => ({ ...prev, [id]: !prev[id] }));
  }, []);

  // いずれかのモーダルが開いているか
  const isAnyModalOpen = Object.values(modals).some(Boolean);

  return {
    modals,
    openModal,
    closeModal,
    toggleModal,
    isAnyModalOpen,
  };
}