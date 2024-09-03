'use server';
import { createNewGame, NewGameInput, NewGameResponse } from '@/dal/game';

export async function submitNewGame(data: NewGameInput): Promise<NewGameResponse> {
  const gameRes = await createNewGame(data);
  return gameRes;
}
