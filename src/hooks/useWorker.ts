import { RefObject, useEffect, useRef } from "react";

export function useWorker(worker: Worker): RefObject<Worker> {
  const workerRef = useRef<Worker>(worker);

  useEffect(() => {
    workerRef.current = worker;

    return () => workerRef.current.terminate();
  }, []);

  return workerRef;
}
