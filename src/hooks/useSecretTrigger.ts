import { useRef } from 'react';

interface UseSecretTriggerProps {
  onTrigger: () => void;
}

export function useSecretTrigger({ onTrigger }: UseSecretTriggerProps) {
  const clicksRef = useRef<{ count: number; lastTime: number }>({ count: 0, lastTime: 0 });

  const handleLogoClick = () => {
    const now = Date.now();
    const { count, lastTime } = clicksRef.current;

    // Reset if there was a pause of more than 1 second between clicks
    if (now - lastTime > 1000) {
      clicksRef.current = { count: 1, lastTime: now };
    } else {
      const newCount = count + 1;
      clicksRef.current = { count: newCount, lastTime: now };
      if (newCount >= 7) {
        onTrigger();
        clicksRef.current = { count: 0, lastTime: 0 }; // Reset after triggering
      }
    }
  };

  return { handleLogoClick };
}
