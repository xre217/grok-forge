"use client";

import { getCrewActivities, type CrewActivity } from "@/lib/crew-activity";
import { FORGE_CREW_ACTIVITY_UPDATED } from "@/lib/forge-events";
import { useCallback, useEffect, useState } from "react";

export function useCrewActivity(limit = 16) {
  const [activities, setActivities] = useState<CrewActivity[]>([]);

  const refresh = useCallback(() => {
    setActivities(getCrewActivities(limit));
  }, [limit]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    const onUpdate = () => refresh();
    window.addEventListener(FORGE_CREW_ACTIVITY_UPDATED, onUpdate);
    return () =>
      window.removeEventListener(FORGE_CREW_ACTIVITY_UPDATED, onUpdate);
  }, [refresh]);

  return { activities, refresh };
}