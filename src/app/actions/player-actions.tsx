'use server';

import {
  addNewPlayerToGroup,
  createNewPlayer,
  NewPlayerInput,
  NewPlayerResponse,
} from '@/dal/player';

export async function submitNewPlayer(data: NewPlayerInput): Promise<NewPlayerResponse> {
  const playerRes = await createNewPlayer(data);
  if (playerRes.success && playerRes.player) {
    const groupRes = await addNewPlayerToGroup(playerRes.player.id);
    // TODO: handle error if we can't add it to the database
  }
  return playerRes;
}
