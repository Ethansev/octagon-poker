'use client';

import { createContext, useContext, type ReactNode } from 'react';

const PlayerPhotosContext = createContext<Record<string, string>>({});

export function PlayerPhotosProvider({
  photos,
  children,
}: {
  photos: Record<string, string>;
  children: ReactNode;
}) {
  return <PlayerPhotosContext.Provider value={photos}>{children}</PlayerPhotosContext.Provider>;
}

// Keyed by lowercased name, which players_group_id_lower_name_idx keeps unique within the group.
export function usePlayerPhoto(name: string): string | undefined {
  return useContext(PlayerPhotosContext)[name.toLowerCase()];
}
