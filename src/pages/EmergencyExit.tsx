import { useEffect } from "react";

const EmergencyExit = () => {
  useEffect(() => {
    // Immediately redirect to a neutral site
    window.location.replace("https://www.google.com");
  }, []);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <p className="text-muted-foreground">Redirecting to a safe page...</p>
    </div>
  );
};

export default EmergencyExit;