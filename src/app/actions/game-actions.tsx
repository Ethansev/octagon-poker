'use server';
import { createNewGame, NewGameInput, NewGameResponse } from '@/dal/game';

// TODO: move these to dal directory
export async function submitNewGame(data: NewGameInput): Promise<NewGameResponse> {
  const gameRes = await createNewGame(data);
  return gameRes;
}
