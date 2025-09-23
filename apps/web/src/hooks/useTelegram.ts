import { useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

export const useTelegram = () => {
  const navigate = useNavigate();
  const tg = window.Telegram?.WebApp;

  useEffect(() => {
    if (!tg) return;

    // Set theme
    tg.setHeaderColor('secondary_bg_color');
    tg.setBackgroundColor('#ffffff');
  }, [tg]);

  const showBackButton = useCallback(() => {
    if (!tg) return;
    tg.BackButton.show();
  }, [tg]);

  const hideBackButton = useCallback(() => {
    if (!tg) return;
    tg.BackButton.hide();
  }, [tg]);

  const onBackButtonClick = useCallback((callback: () => void) => {
    if (!tg) return;
    tg.BackButton.onClick(callback);
    return () => {
      tg.BackButton.offClick(callback);
    };
  }, [tg]);

  const showMainButton = useCallback((text: string, onClick: () => void) => {
    if (!tg) return;
    
    tg.MainButton.setText(text);
    tg.MainButton.show();
    tg.MainButton.enable();
    tg.MainButton.onClick(onClick);

    return () => {
      tg.MainButton.hide();
      tg.MainButton.offClick(onClick);
    };
  }, [tg]);

  const hideMainButton = useCallback(() => {
    if (!tg) return;
    tg.MainButton.hide();
  }, [tg]);

  const showProgress = useCallback(() => {
    if (!tg) return;
    tg.MainButton.showProgress();
  }, [tg]);

  const hideProgress = useCallback(() => {
    if (!tg) return;
    tg.MainButton.hideProgress();
  }, [tg]);

  const showAlert = useCallback((message: string) => {
    if (!tg) return;
    tg.showAlert(message);
  }, [tg]);

  const showConfirm = useCallback((message: string): Promise<boolean> => {
    return new Promise((resolve) => {
      if (!tg) {
        resolve(false);
        return;
      }
      tg.showConfirm(message, (confirmed) => {
        resolve(confirmed);
      });
    });
  }, [tg]);

  const hapticFeedback = useCallback((type: 'impact' | 'notification' | 'selection', style?: string) => {
    if (!tg) return;
    
    switch (type) {
      case 'impact':
        tg.HapticFeedback.impactOccurred(style as any || 'light');
        break;
      case 'notification':
        tg.HapticFeedback.notificationOccurred(style as any || 'success');
        break;
      case 'selection':
        tg.HapticFeedback.selectionChanged();
        break;
    }
  }, [tg]);

  const openLink = useCallback((url: string) => {
    if (!tg) {
      window.open(url, '_blank');
      return;
    }
    tg.openLink(url);
  }, [tg]);

  const close = useCallback(() => {
    if (!tg) return;
    tg.close();
  }, [tg]);

  return {
    tg,
    user: tg?.initDataUnsafe?.user,
    showBackButton,
    hideBackButton,
    onBackButtonClick,
    showMainButton,
    hideMainButton,
    showProgress,
    hideProgress,
    showAlert,
    showConfirm,
    hapticFeedback,
    openLink,
    close
  };
};

