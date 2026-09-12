import { useEffect, useState } from "react";

/**
 * Tracks an element's content-box size via ResizeObserver. Canvases need
 * to know their container's actual CSS pixel size (to set their backing
 * store at the right resolution — see `prepareCanvas`), and that size
 * changes whenever the window resizes or the layout reflows, which plain
 * CSS ("width: 100%") doesn't expose to JS on its own.
 */
export function useResizeObserver(ref) {
  const [size, setSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      const { width, height } = entry.contentRect;
      setSize({ width, height });
    });
    observer.observe(el);

    return () => observer.disconnect();
  }, [ref]);

  return size;
}
