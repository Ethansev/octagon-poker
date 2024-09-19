import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { getAllGamesWithPlayers } from '@/dal/combined-game-data';
import { getPlayers } from '@/dal/player';
import { InfoIcon } from 'lucide-react';
import MainGroup from './main-group';

export default async function Home() {
  const players = await getPlayers();
  const games = await getAllGamesWithPlayers();
  console.log('printing all games with players: ', games);

  return (
    <main className='flex min-h-screen flex-col items-center px-12 pt-8'>
      <div className='w-full max-w-4xl'>
        <div className='mb-8'>
          <Alert className='border-yellow-200 bg-yellow-50'>
            <InfoIcon className='h-4 w-4 text-yellow-600' />
            <AlertTitle className='text-yellow-800'>New?</AlertTitle>
            <AlertDescription className='text-yellow-700'>
              Click any rows in the Player Details and Game Sessions tables to see more.
            </AlertDescription>
          </Alert>
        </div>
        <MainGroup players={players} games={games} />
        {/* <Tabs defaultValue='account' className='w-full'> */}
        {/*   <div className='mx-auto mb-4 flex max-w-xl items-center'> */}
        {/*     <TabsList className='grid w-full grid-cols-2'> */}
        {/*       <TabsTrigger value='account'>Main Pot</TabsTrigger> */}
        {/*       <TabsTrigger value='password'>Side Pot</TabsTrigger> */}
        {/*     </TabsList> */}
        {/*   </div> */}
        {/*   <TabsContent value='account'> */}
        {/*     <MainGroup players={players} games={games} /> */}
        {/*   </TabsContent> */}
        {/*   <TabsContent value='password'> */}
        {/*     <SideGroup /> */}
        {/*   </TabsContent> */}
        {/* </Tabs> */}
      </div>
    </main>
  );
}
