import { useEffect, useRef, useCallback } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router";
import { logout } from "@/Redux Toolkit/features/user/userThunks";
import { clearUserState } from "@/Redux Toolkit/features/user/userSlice";
import { clearStoreState } from "@/Redux Toolkit/features/store/storeSlice";
import { toast } from "@/components/ui/use-toast";

/**
 * useIdleTimer — automatically logs the user out after a configurable
 * period of inactivity (no mouse / keyboard / touch / scroll events).
 *
 * @param {number} timeoutMinutes  idle threshold in **minutes** (default 30)
 * @param {object} options          { enabled: boolean } – master switch (default true)
 */
export const useIdleTimer = (timeoutMinutes = 30, options = { enabled: true }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const enabled = options?.enabled !== false;

  // Keep refs so we never create stale closures inside the reset handler
  const timeoutRef = useRef(null);
  const warningTimeoutRef = useRef(null);
  const lastActivityRef = useRef(Date.now());
  const warningShownRef = useRef(false);

  // -------------------------------------------------------------------------
  // The action fired when the idle threshold is reached
  // -------------------------------------------------------------------------
  const handleLogout = useCallback(() => {
    // Clear any pending timers
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (warningTimeoutRef.current) {
      clearTimeout(warningTimeoutRef.current);
      warningTimeoutRef.current = null;
    }

    dispatch(logout());
    dispatch(clearUserState());
    dispatch(clearStoreState());
    toast({
      title: "Logged out due to inactivity",
      description: "Your session timed out after " + timeoutMinutes + " minutes of inactivity.",
      duration: 5000,
    });
    navigate("/auth/login");
  }, [dispatch, navigate, timeoutMinutes]);

  // -------------------------------------------------------------------------
  // Reset the idle timer
  // -------------------------------------------------------------------------
  const resetTimer = useCallback(() => {
    lastActivityRef.current = Date.now();

    if (!enabled) return; // don't schedule when disabled

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    if (warningTimeoutRef.current) {
      clearTimeout(warningTimeoutRef.current);
    }

    warningShownRef.current = false;

    const remainingMs = timeoutMinutes * 60 * 1000;
    const warningMs = Math.max(10000, remainingMs - 2 * 60 * 1000); // 2 minutes before timeout

    // Schedule pre-timeout warning
    warningTimeoutRef.current = setTimeout(() => {
      if (!warningShownRef.current) {
        warningShownRef.current = true;
        toast({
          title: "Session Expiring Soon",
          description: "You will be logged out in 2 minutes due to inactivity. Move your mouse or press any key to stay logged in.",
          duration: 6000,
        });
      }
    }, warningMs);

    timeoutRef.current = setTimeout(() => {
      // Verify inactivity again at fire-time (extra guard against
      // edge cases where a late event sneaks in)
      const idleMs = Date.now() - lastActivityRef.current;
      if (idleMs >= remainingMs) {
        handleLogout();
      } else {
        // Activity arrived just before the timer fired — reschedule
        resetTimer();
      }
    }, remainingMs);
  }, [enabled, timeoutMinutes, handleLogout]);

  // -------------------------------------------------------------------------
  // Set up activity listeners once
  // -------------------------------------------------------------------------
  useEffect(() => {
    if (!enabled) return;

    const events = [
      "mousemove",
      "mousedown",
      "keydown",
      "touchstart",
      "scroll",
      "wheel",
    ];

    const activityHandler = () => resetTimer();

    events.forEach((ev) =>
      window.addEventListener(ev, activityHandler, { passive: true })
    );

    // Start the timer on mount
    resetTimer();

    return () => {
      // Clean up everything to avoid leaks / duplicate timers on re-render
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      if (warningTimeoutRef.current) {
        clearTimeout(warningTimeoutRef.current);
        warningTimeoutRef.current = null;
      }
      events.forEach((ev) => window.removeEventListener(ev, activityHandler));
    };
  }, [enabled, resetTimer]);

  // Expose a manual-reset in case a parent wants to reset from a custom event
  return { resetTimer, lastActivityRef };
};
