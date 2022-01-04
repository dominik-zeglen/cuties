import { RefObject, useEffect, useRef } from "react";

export function useWorker(workerFn: () => Worker): RefObject<Worker> {
  const workerRef = useRef<Worker>(null);

  useEffect(() => {
    workerRef.current = workerFn();

    return () => workerRef.current.terminate();
  }, []);

  return workerRef;
}
