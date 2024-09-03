import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getAllGamesWithPlayers } from '@/dal/combined-game-data';
import { getPlayers } from '@/dal/player';
import MainGroup from './main-group';
import SideGroup from './side-group';

export default async function Home() {
  const players = await getPlayers();
  const games = await getAllGamesWithPlayers();
  console.log('printing all games with players: ', games);

  return (
    <main className='flex min-h-screen flex-col items-center p-12'>
      <div className='w-full max-w-4xl'>
        <Tabs defaultValue='account' className='w-full'>
          <div className='mx-auto mb-4 flex max-w-xl items-center'>
            <TabsList className='grid w-full grid-cols-2'>
              <TabsTrigger value='account'>Main Pot</TabsTrigger>
              <TabsTrigger value='password'>Side Pot</TabsTrigger>
            </TabsList>
          </div>
          <TabsContent value='account'>
            <MainGroup players={players} games={games} />
          </TabsContent>
          <TabsContent value='password'>
            <SideGroup />
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}
