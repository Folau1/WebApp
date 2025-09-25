// Заглушка для Telegram WebApp API в режиме разработки
// Используется только в браузере для тестирования UI

if (!(window as any).Telegram) {
  (window as any).Telegram = {
    WebApp: {
      initData: "",
      initDataUnsafe: {
        user: {
          id: 123456789,
          first_name: "Test",
          last_name: "User",
          username: "testuser",
          language_code: "ru"
        }
      },
      colorScheme: "light",
      themeParams: {
        bg_color: "#ffffff",
        text_color: "#000000",
        hint_color: "#999999",
        link_color: "#2481cc",
        button_color: "#2481cc",
        button_text_color: "#ffffff"
      },
      ready() {
        console.log("Telegram WebApp ready (stub)");
      },
      expand() {
        console.log("Telegram WebApp expand (stub)");
      },
      close() {
        console.log("Telegram WebApp close (stub)");
      },
      BackButton: {
        show() {
          console.log("BackButton show (stub)");
        },
        hide() {
          console.log("BackButton hide (stub)");
        },
        onClick: (callback: () => void) => {
          console.log("BackButton onClick (stub)");
          return () => {};
        }
      },
      MainButton: {
        show() {
          console.log("MainButton show (stub)");
        },
        hide() {
          console.log("MainButton hide (stub)");
        },
        setText(text: string) {
          console.log("MainButton setText (stub):", text);
        },
        onClick: (callback: () => void) => {
          console.log("MainButton onClick (stub)");
          return () => {};
        }
      },
      HapticFeedback: {
        impactOccurred(style: "light" | "medium" | "heavy" | "rigid" | "soft" = "medium") {
          console.log("HapticFeedback impactOccurred (stub):", style);
        },
        notificationOccurred(type: "error" | "success" | "warning") {
          console.log("HapticFeedback notificationOccurred (stub):", type);
        },
        selectionChanged() {
          console.log("HapticFeedback selectionChanged (stub)");
        }
      }
    }
  };
}
