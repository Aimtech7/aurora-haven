import { Shield, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { useTranslation } from "@/contexts/LanguageContext";

export const EmergencyButton = () => {
  const [showWarning, setShowWarning] = useState(false);
  const [escCount, setEscCount] = useState(0);
  const { t } = useTranslation();

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setEscCount(prev => {
          const newCount = prev + 1;
          if (newCount >= 2) {
            handleEmergencyExit();
            return 0;
          }
          return newCount;
        });

        clearTimeout(timeout);
        timeout = setTimeout(() => setEscCount(0), 800);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      clearTimeout(timeout);
    };
  }, []);

  const handleEmergencyExit = () => {
    // Redirect to a neutral website
    window.location.replace("https://www.google.com");
  };

  const handleClick = () => {
    setShowWarning(true);
  };

  const confirmExit = () => {
    handleEmergencyExit();
  };

  if (showWarning) {
    return (
      <div className="fixed inset-0 bg-background/95 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-card p-8 rounded-2xl shadow-card max-w-md w-full space-y-6 animate-in fade-in-0 zoom-in-95">
          <div className="space-y-2 text-center">
            <div className="mx-auto w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center">
              <Shield className="w-6 h-6 text-destructive" />
            </div>
            <h3 className="text-xl font-semibold">{t("emergency.title", "Emergency Exit")}</h3>
            <p className="text-muted-foreground">
              {t("emergency.message", "This will immediately redirect you to Google. Your browsing history will not show this site.")}
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setShowWarning(false)}
            >
              <X className="w-4 h-4 mr-2" />
              {t("common.cancel", "Cancel")}
            </Button>
            <Button
              variant="destructive"
              className="flex-1"
              onClick={confirmExit}
            >
              <Shield className="w-4 h-4 mr-2" />
              {t("emergency.button", "Exit Now")}
            </Button>
          </div>
          <p className="text-xs text-center text-muted-foreground">
            Tip: Press ESC twice quickly to exit instantly
          </p>
        </div>
      </div>
    );
  }

  return (
    <Button
      variant="destructive"
      size="lg"
      onClick={handleClick}
      className="fixed bottom-6 right-6 rounded-full shadow-lg z-40 h-14 w-14 p-0"
      title={t("emergency.button", "Emergency Exit")}
    >
      <Shield className="w-6 h-6" />
      <span className="sr-only">{t("emergency.button", "Emergency Exit")}</span>
    </Button>
  );
};