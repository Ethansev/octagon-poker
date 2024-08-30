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
import { Player } from '@/types';
import { openDb } from '../../lib/db';
import NetEarningsChart from './net-earnings-chart';
import NewGameDialog from './new-game-dialog';

async function getPlayers(): Promise<Player[]> {
  const db = await openDb();
  return db.all(`
        SELECT 
          p.id, 
          p.first_name, 
          p.last_name, 
          p.username, 
          p.net_earnings, 
          p.biggest_win, 
          p.biggest_loss, 
          p.average_earnings_per_session,
          p.win_rate,
          p.games_played
        FROM players p
        JOIN players_game_groups pgg ON p.id = pgg.player_id
        WHERE pgg.game_group_id = 1
        `);
}

export default async function MainGroup() {
  // GROUP ID: 1
  const playersData = await getPlayers();
  // TODO: add table of each player with their respective data, sorted by net earnings. Users should be able to click on a player to see more details about them.
  // TODO: add a table for all previous game records for the group <- not sure which data to display here.

  return (
    <div>
      <div className='mx-auto mb-8 flex max-w-2xl flex-row justify-between'>
        {/* <Button className=''>Add a game</Button> */}
        <Dialog>
          <DialogTrigger asChild>
            <Button variant='outline'>Add a new game</Button>
          </DialogTrigger>
          <NewGameDialog />
        </Dialog>
        <Button className=''>Add a new player</Button>
      </div>

      <div className='mb-8'>
        <NetEarningsChart playerData={playersData} />
      </div>

      <Card className='mb-8'>
        <CardHeader>
          <CardTitle>All Player Data</CardTitle>
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
              {playersData.map((player) => (
                <TableRow key={player.id}>
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
                <TableHead>Winner</TableHead>
                <TableHead>Total Buy-Ins</TableHead>
                {/* <TableHead>Total Pot</TableHead> */}
              </TableRow>
            </TableHeader>
            <TableBody>
              {/* {recentSessions.map((session) => (
                <TableRow key={session.id}>
                  <TableCell>{session.date}</TableCell>
                  <TableCell>
                    <Badge variant='outline'>{session.winner}</Badge>
                  </TableCell>
                  <TableCell>${session.totalPot}</TableCell>
                </TableRow>
              ))} */}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
