'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogTrigger } from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { GameWithPlayers } from '@/dal/combined-game-data';
import { Player } from '@/dal/player';
import { formatDate } from '@/lib/utils';
import { useHomeStore } from '@/store/home';
import { useRouter } from 'next/navigation';
import NetEarningsChart from './net-earnings-chart';
import NewGameDialog from './new-game-dialog';
import NewPlayerDialog from './new-player-dialog';
type Props = {
  players: Player[];
  games: GameWithPlayers[];
};

export default function MainGroup(props: Props) {
  const { players, games } = props;
  const router = useRouter();

  const [isNewPlayerDialogOpen, setIsNewPlayerDialogOpen] = useHomeStore((state) => [
    state.isNewPlayerDialogOpen,
    state.setIsNewPlayerDialogOpen,
  ]);

  const [isNewGameDialogOpen, setIsNewGameDialogOpen] = useHomeStore((state) => [
    state.isNewGameDialogOpen,
    state.setIsNewGameDialogOpen,
  ]);
  // GROUP ID: 1

  return (
    <div>
      <div className='mx-auto mb-8 flex max-w-2xl flex-row justify-between'>
        {/* <Button className=''>Add a game</Button> */}
        <Dialog open={isNewGameDialogOpen} onOpenChange={setIsNewGameDialogOpen}>
          <DialogTrigger asChild>
            <Button variant='default'>Add a new game</Button>
          </DialogTrigger>
          <NewGameDialog />
        </Dialog>

        <Dialog open={isNewPlayerDialogOpen} onOpenChange={setIsNewPlayerDialogOpen}>
          <DialogTrigger asChild>
            <Button variant='default'>Add a new player</Button>
          </DialogTrigger>
          <NewPlayerDialog />
        </Dialog>
      </div>

      <div className='mb-8'>
        <NetEarningsChart playerData={players} />
      </div>

      {/* TODO: move into separate component */}
      <Card className='mb-8'>
        <CardHeader>
          <CardTitle>Player Details</CardTitle>
          <CardDescription>Detailed statistics for all players</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Net Earnings</TableHead>
                <TableHead>Biggest Win</TableHead>
                <TableHead>Biggest Loss</TableHead>
                <TableHead>Average Earnings Per Session</TableHead>
                {/* <TableHead>Games Played</TableHead> */}
                {/* <TableHead>Win Rate</TableHead> */}
              </TableRow>
            </TableHeader>
            <TableBody>
              {players.map((player) => (
                <TableRow key={player.id} onClick={() => router.push(`player/${player.id}`)}>
                  <TableCell className='font-medium'>{player.first_name}</TableCell>
                  <TableCell>${player.net_earnings}</TableCell>
                  <TableCell>${player.biggest_win}</TableCell>
                  <TableCell>${player.biggest_loss}</TableCell>
                  <TableCell>${player.average_earnings_per_session}</TableCell>
                  {/* <TableCell>{player.games_played}</TableCell> */}
                  {/* <TableCell>{player.win_rate}%</TableCell> */}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* TODO: move into separate component */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Game Sessions</CardTitle>
          <CardDescription>Summary of the last few poker sessions</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Buy-In Amount</TableHead>
                <TableHead>Number of Players</TableHead>
                {/* <TableHead>Winner</TableHead> */}
              </TableRow>
            </TableHeader>
            <TableBody>
              {games.map((game) => (
                <TableRow
                  className='cursor-pointer'
                  key={game.id}
                  onClick={() => {
                    router.push(`/game/${game.id}`);
                  }}>
                  <TableCell>{formatDate(game.date)}</TableCell>
                  <TableCell>${game.buy_in}</TableCell>
                  <TableCell>{game.players.length}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
