import EditableTable from '@/components/editable-table';
import { Player } from '@/dal/player';
import { PlayerSessionWithPlayerInfo } from '@/dal/player-session';
import Link from 'next/link';
import { Card, CardContent, CardHeader } from '../ui/card';
import LineChartComponent from './line-chart';

type Props = {
  playerSessions: PlayerSessionWithPlayerInfo[];
  player: Player;
};

const stats = [
  {
    name: 'Average Earnings',
    value: '$405,091.00',
    change: '+4.75%',
    changeType: 'positive',
  },
  { name: 'Win Rate', value: '$405,091.00', change: '+4.75%', changeType: 'positive' },
  { name: 'Biggest Wins', value: '$12,787.00', change: '+54.02%', changeType: 'negative' },
  // { name: 'Outstanding invoices', value: '$245,988.00', change: '-1.39%', changeType: 'positive' },
  { name: 'Biggest Loss', value: '$30,156.00', change: '+10.18%', changeType: 'negative' },
  { name: 'Games Played', value: '5', change: '', changeType: 'negative' },
];

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

// main player page
export default function MainPlayer({ playerSessions, player }: Props) {
  // TODO: hovering over session info can hover over that point in the chart
  // TODO: make it responsive for mobile devices
  return (
    <div className='p-8'>
      <Link href='/'> Back to Home</Link>
      <div className='mb-4 text-4xl font-bold'>
        <h1>
          {player.first_name} {player.last_name}
        </h1>
      </div>
      {/* <div className='mb-8 grid grid-cols-1 gap-4 md:grid-cols-3'> */}
      {/*   <Card> */}
      {/*     <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'> */}
      {/*       <CardTitle className='text-sm font-medium'>Net Earnings</CardTitle> */}
      {/*     </CardHeader> */}
      {/*     <CardContent> */}
      {/*       <div className='text-2xl font-bold text-green-500'> */}
      {/*         ${player.net_earnings.toLocaleString()} */}
      {/*       </div> */}
      {/*     </CardContent> */}
      {/*   </Card> */}
      {/**/}
      {/*   <Card> */}
      {/*     <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'> */}
      {/*       <CardTitle className='text-sm font-medium'>Biggest Win</CardTitle> */}
      {/*     </CardHeader> */}
      {/*     <CardContent> */}
      {/*       <div className='text-2xl font-bold text-green-500'> */}
      {/*         ${player.biggest_win.toLocaleString()} */}
      {/*       </div> */}
      {/*     </CardContent> */}
      {/*   </Card> */}
      {/**/}
      {/*   <Card> */}
      {/*     <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'> */}
      {/*       <CardTitle className='text-sm font-medium'>Biggest Loss</CardTitle> */}
      {/*     </CardHeader> */}
      {/*     <CardContent> */}
      {/*       <div className='text-2xl font-bold text-red-500'> */}
      {/*         ${player.biggest_loss.toLocaleString()} */}
      {/*       </div> */}
      {/*     </CardContent> */}
      {/*   </Card> */}
      {/* </div> */}

      <LineChartComponent
        className=''
        chartTitle='Net Earnings'
        chartDescription='January - June 2024'
      />
      <Card className='mb-12'>
        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
          {/* <CardTitle className='text-sm font-medium text-white'>Net Earnings</CardTitle> */}
        </CardHeader>
        <CardContent className='flex flex-row items-start justify-between gap-4'>
          <LineChartComponent
            className='w-2/3'
            chartTitle='Net Earnings'
            chartDescription='January - June 2024'
          />
          <div className='font-bold'>
            {/* <div className='mb-4'> */}
            {/*   <h1 className='text-2xl'>Net Earnings</h1> */}
            {/*   <p className='text-3xl text-green-500'>${player.net_earnings.toLocaleString()}</p> */}
            {/* </div> */}
            <div className='flex flex-col gap-1'>
              {stats.map((stat) => (
                <div className='flex flex-row' key={stat.name}>
                  <p className='text-sm text-gray-500'>{stat.name}</p>
                  <p className='font-bold'>{stat.value}</p>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
      {/* <dl className='mx-auto grid grid-cols-1 gap-px bg-gray-900/5 sm:grid-cols-2 lg:grid-cols-3'> */}
      {/*   {stats.map((stat) => ( */}
      {/*     <div */}
      {/*       key={stat.name} */}
      {/*       className='flex flex-wrap items-baseline justify-between gap-x-4 gap-y-2 bg-white px-4 py-10 sm:px-6 xl:px-8'> */}
      {/*       <dt className='text-sm font-medium leading-6 text-gray-500'>{stat.name}</dt> */}
      {/*       <dd */}
      {/*         className={classNames( */}
      {/*           stat.changeType === 'negative' ? 'text-rose-600' : 'text-gray-700', */}
      {/*           'text-xs font-medium', */}
      {/*         )}> */}
      {/*         {stat.change} */}
      {/*       </dd> */}
      {/*       <dd className='w-full flex-none text-3xl font-medium leading-10 tracking-tight text-gray-900'> */}
      {/*         {stat.value} */}
      {/*       </dd> */}
      {/*     </div> */}
      {/*   ))} */}
      {/* </dl> */}
      <h1 className='pl-4 text-2xl font-bold'>Sessions</h1>
      <EditableTable initialData={playerSessions} />
    </div>
  );
}
