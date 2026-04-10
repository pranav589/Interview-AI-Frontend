"use client";

import { useState, useCallback, useRef, useEffect } from "react";

export type ExecutionResult = {
  stdout: string;
  stderr: string;
  exitCode: number;
  executionTime: number;
};

export const useCodeRunner = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [isPyodideLoading, setIsPyodideLoading] = useState(false);
  
  // Persistent refs for workers to avoid reloading overhead
  const pyWorkerRef = useRef<Worker | null>(null);
  const jsWorkerRef = useRef<Worker | null>(null);

  // Helper to cleanup workers on unmount
  useEffect(() => {
    return () => {
      pyWorkerRef.current?.terminate();
      jsWorkerRef.current?.terminate();
    };
  }, []);

  const runJS = useCallback(async (code: string): Promise<ExecutionResult> => {
    return new Promise((resolve) => {
      const startTime = performance.now();
      
      const workerCode = `
        onmessage = async function(e) {
          const code = e.data;
          const logs = [];
          
          const customConsole = {
            log: (...args) => logs.push(args.map(a => {
              if (typeof a === 'object') {
                try { return JSON.stringify(a, null, 2); } catch(e) { return String(a); }
              }
              return String(a);
            }).join(' ')),
            error: (...args) => logs.push('[ERROR] ' + args.map(a => String(a)).join(' ')),
            warn: (...args) => logs.push('[WARN] ' + args.map(a => String(a)).join(' ')),
            info: (...args) => logs.push('[INFO] ' + args.map(a => String(a)).join(' '))
          };

          self.console = customConsole;

          try {
            const wrappedCode = \`(async () => { 
              \${code} 
            })()\`;
            
            await eval(wrappedCode);
            postMessage({ type: 'success', logs: logs.join('\\n') });
          } catch (err) {
            postMessage({ type: 'error', error: err.toString(), logs: logs.join('\\n') });
          }
        };
      `;

      const blob = new Blob([workerCode], { type: "application/javascript" });
      const worker = new Worker(URL.createObjectURL(blob));

      const timeout = setTimeout(() => {
        worker.terminate();
        resolve({
          stdout: "[Execution Timed Out]",
          stderr: "Maximum execution time of 5 seconds exceeded. Your code might have an infinite loop.",
          exitCode: 1,
          executionTime: performance.now() - startTime,
        });
      }, 5000);

      worker.onmessage = (e) => {
        const { type, logs, error } = e.data;
        clearTimeout(timeout);
        worker.terminate();
        resolve({
          stdout: logs,
          stderr: error || "",
          exitCode: type === "success" ? 0 : 1,
          executionTime: performance.now() - startTime,
        });
      };

      worker.onerror = (e) => {
        clearTimeout(timeout);
        worker.terminate();
        resolve({
          stdout: "",
          stderr: e.message,
          exitCode: 1,
          executionTime: performance.now() - startTime,
        });
      };

      worker.postMessage(code);
    });
  }, []);

  const runPython = useCallback(async (code: string): Promise<ExecutionResult> => {
    const startTime = performance.now();
    
    return new Promise((resolve) => {
      if (!pyWorkerRef.current) {
        setIsPyodideLoading(true);
        
        const workerCode = `
          // We use importScripts inside the worker to load Pyodide.
          // This COMPLETELY bypasses the Monaco/AMD loader on the main thread.
          importScripts("https://cdn.jsdelivr.net/pyodide/v0.25.0/full/pyodide.js");
          
          let pyodide = null;
          let stdout = "";
          let stderr = "";

          onmessage = async function(e) {
            const { type, code } = e.data;
            
            if (type === 'init') {
              try {
                pyodide = await loadPyodide({
                  indexURL: "https://cdn.jsdelivr.net/pyodide/v0.25.0/full/",
                  stdout: (text) => { stdout += text + "\\n"; },
                  stderr: (text) => { stderr += text + "\\n"; },
                });
                postMessage({ type: 'init-success' });
              } catch (err) {
                postMessage({ type: 'init-error', error: err.toString() });
              }
              return;
            }

            if (type === 'run') {
              stdout = "";
              stderr = "";
              try {
                await pyodide.runPythonAsync(code);
                postMessage({ type: 'success', stdout: stdout.trim(), stderr: stderr.trim() });
              } catch (err) {
                postMessage({ type: 'error', error: err.toString(), stdout: stdout.trim(), stderr: stderr.trim() });
              }
            }
          };
        `;
        
        const blob = new Blob([workerCode], { type: "application/javascript" });
        const worker = new Worker(URL.createObjectURL(blob));
        pyWorkerRef.current = worker;

        worker.onmessage = (e) => {
          const { type, stdout, stderr, error } = e.data;
          
          if (type === 'init-success') {
            setIsPyodideLoading(false);
            worker.postMessage({ type: 'run', code });
          } else if (type === 'init-error') {
            setIsPyodideLoading(false);
            pyWorkerRef.current = null; // Reset to allow retry
            resolve({
              stdout: "",
              stderr: "Failed to initialize Python engine: " + error,
              exitCode: 1,
              executionTime: performance.now() - startTime,
            });
          } else if (type === 'success' || type === 'error') {
            resolve({
              stdout: stdout || "",
              stderr: error || stderr || "",
              exitCode: type === 'success' ? 0 : 1,
              executionTime: performance.now() - startTime,
            });
          }
        };

        worker.postMessage({ type: 'init' });
      } else {
        const worker = pyWorkerRef.current;
        
        const handleMessage = (e: MessageEvent) => {
          const { type, stdout, stderr, error } = e.data;
          if (type === 'success' || type === 'error') {
            worker.removeEventListener('message', handleMessage);
            resolve({
              stdout: stdout || "",
              stderr: error || stderr || "",
              exitCode: type === 'success' ? 0 : 1,
              executionTime: performance.now() - startTime,
            });
          }
        };
        
        worker.addEventListener('message', handleMessage);
        worker.postMessage({ type: 'run', code });
      }
    });
  }, []);

  const execute = useCallback(async (code: string, language: string): Promise<ExecutionResult> => {
    setIsRunning(true);
    try {
      if (language === "javascript" || language === "typescript") {
        return await runJS(code);
      } else if (language === "python") {
        return await runPython(code);
      } else {
        return {
          stdout: "",
          stderr: `Execution for ${language} is not yet supported in-browser. JavaScript and Python are supported.`,
          exitCode: 1,
          executionTime: 0,
        };
      }
    } finally {
      setIsRunning(false);
    }
  }, [runJS, runPython]);

  return { execute, isRunning, isPyodideLoading };
};
