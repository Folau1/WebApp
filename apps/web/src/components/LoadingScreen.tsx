export default function LoadingScreen() {
  return (
    <div className="fixed inset-0 bg-telegram-bg flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-telegram-button border-t-transparent rounded-full animate-spin" />
        <p className="text-telegram-hint">Загрузка...</p>
      </div>
    </div>
  );
}

