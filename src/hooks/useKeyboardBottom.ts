import { useState, useEffect } from 'react';

// Returns the number of CSS pixels the keyboard is pushing up from the bottom.
// Use as `style={{ bottom: keyboardBottom }}` on a fixed-positioned sheet.
export function useKeyboardBottom(active: boolean): number {
  const [bottom, setBottom] = useState(0);

  useEffect(() => {
    if (!active) { setBottom(0); return; }
    const vv = window.visualViewport;
    if (!vv) return;
    const update = () => {
      setBottom(Math.max(0, window.innerHeight - vv.height - vv.offsetTop));
    };
    vv.addEventListener('resize', update);
    vv.addEventListener('scroll', update);
    update();
    return () => {
      vv.removeEventListener('resize', update);
      vv.removeEventListener('scroll', update);
    };
  }, [active]);

  return bottom;
}
