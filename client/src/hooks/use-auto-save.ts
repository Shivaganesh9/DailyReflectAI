import { useEffect, useRef, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";

interface UseAutoSaveOptions {
  onSave: (data: any) => Promise<void>;
  delay?: number;
  enabled?: boolean;
}

export function useAutoSave<T>({ onSave, delay = 2000, enabled = true }: UseAutoSaveOptions) {
  const { toast } = useToast();
  const saveTimeoutRef = useRef<NodeJS.Timeout>();
  const isSavingRef = useRef(false);
  const lastSavedDataRef = useRef<string>("");

  const debouncedSave = useCallback((data: T) => {
    if (!enabled || isSavingRef.current) return;

    const serializedData = JSON.stringify(data);
    
    // Don't save if data hasn't changed
    if (serializedData === lastSavedDataRef.current) return;

    // Clear existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Set new timeout
    saveTimeoutRef.current = setTimeout(async () => {
      try {
        isSavingRef.current = true;
        await onSave(data);
        lastSavedDataRef.current = serializedData;
        
        toast({
          title: "Auto-saved",
          description: "Your changes have been saved automatically.",
          duration: 2000,
        });
      } catch (error) {
        console.error("Auto-save failed:", error);
        toast({
          title: "Auto-save failed",
          description: "Failed to save your changes automatically.",
          variant: "destructive",
          duration: 3000,
        });
      } finally {
        isSavingRef.current = false;
      }
    }, delay);
  }, [onSave, delay, enabled, toast]);

  const forceSave = useCallback(async (data: T) => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    try {
      isSavingRef.current = true;
      await onSave(data);
      lastSavedDataRef.current = JSON.stringify(data);
      
      toast({
        title: "Saved",
        description: "Your changes have been saved.",
        duration: 2000,
      });
    } catch (error) {
      console.error("Save failed:", error);
      toast({
        title: "Save failed",
        description: "Failed to save your changes.",
        variant: "destructive",
        duration: 3000,
      });
      throw error;
    } finally {
      isSavingRef.current = false;
    }
  }, [onSave, toast]);

  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  return {
    debouncedSave,
    forceSave,
    isSaving: isSavingRef.current,
  };
}
