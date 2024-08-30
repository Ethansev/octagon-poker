import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { openDb } from '@/lib/db';
import { Player } from '@/types';
import SideGroup from './side-group';
import MainGroup from './main-group';

async function getPlayers(): Promise<Player[]> {
  const db = await openDb();
  return db.all('SELECT * FROM players');
}

export default async function Home() {
  const players = await getPlayers();
  // console.log('players', players);

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
            <MainGroup />
          </TabsContent>
          <TabsContent value='password'>
            <SideGroup />
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}
