'use client';

import EditableTable from '@/components/editable-table';
import { Game } from '@/dal/game';
import { Player } from '@/dal/player';
import { PlayerSessionWithPlayerInfo } from '@/dal/player-session';
import { useGameStore } from '@/store/game';
import { useEffect } from 'react';
import PlayerSelection from './player-selection';

type Props = {
  game: Game | undefined;
  players: Player[];
  playerSessions: PlayerSessionWithPlayerInfo[];
};

// TODO: move to component directory
export default function SingleGame({ game, players, playerSessions }: Props) {
  const activePlayerSessionIds = playerSessions.map((session) => session.player_id);
  const { setActivePlayerIds } = useGameStore();

  useEffect(() => {
    setActivePlayerIds(activePlayerSessionIds);
  }, [playerSessions]);

  // const players = await getPlayersPerGroup(1);
  //
  // const playerSessions = await getPlayerSessionsPerGame(gameId);
  // game stats: name (optional, date, buy-in)
  // player stats: player_name, buy-in amounts, and cashout amounts

  if (!game) {
    return <div>No game oh no</div>;
  }

  return (
    <>
      <div>
        <h1>Game ID: {game.id}</h1>
        <PlayerSelection players={players} key={game.id} />

        <EditableTable gameId={game.id} initialData={playerSessions} key={game.id} />

        {/* TODO: game summary here */}
      </div>
    </>
  );
}
