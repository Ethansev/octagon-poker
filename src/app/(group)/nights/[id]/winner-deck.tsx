import type { NightResults, ResultSeat } from '@/app/(group)/nights/[id]/load-night';
import { winLabel, winnerHeadline, winnerKicker } from '@/app/(group)/nights/[id]/winner-copy';
import { formatDollars, formatNet } from '@/money/money';
import { PlayerAvatar } from '@/players/player-avatar';
import { playerColor } from '@/players/player-color';

const chip = 'rounded-full bg-hero-ink/10 px-3.5 py-1.5 text-sm font-extrabold tabular-nums';
const strongChip =
  'rounded-full bg-hero-figure px-3.5 py-1.5 text-sm font-extrabold text-hero tabular-nums';

function backCardColors(results: NightResults): [string, string] {
  const behind = results.seats.filter((seat) => !seat.won);
  if (results.winners.length === 0) return ['var(--surface-3)', 'var(--line)'];
  const [first, second] = behind;
  return [
    first ? playerColor(first.colorSlot).solid : 'var(--surface-3)',
    second ? playerColor(second.colorSlot).solid : 'var(--line)',
  ];
}

function Crowned({ seat, size }: { seat: ResultSeat; size: number }) {
  return (
    <span className='relative block rounded-full bg-frame p-1.5'>
      <span
        aria-hidden
        className='absolute -top-8 left-1/2 z-10 -translate-x-1/2 -rotate-12 text-5xl leading-none'>
        👑
      </span>
      <PlayerAvatar colorSlot={seat.colorSlot} name={seat.name} size={size} />
    </span>
  );
}

function WinnerChips({ results }: { results: NightResults }) {
  const { winners, potCents, year } = results;
  const [lead] = winners;
  const shared = winners.length > 1;
  const takenCents = winners.reduce((sum, seat) => sum + seat.cashOutCents, 0);
  const share = potCents > 0 ? Math.round((takenCents / potCents) * 100) : 0;

  return (
    <ul className='relative mt-6 flex flex-wrap gap-2'>
      {!shared && (
        <li className={chip}>
          {formatDollars(lead.buyInCents)} in → {formatDollars(lead.cashOutCents)} out
        </li>
      )}
      {share > 0 && (
        <li className={chip}>
          {shared ? `Split ${share}% of the pot` : `Walked off with ${share}% of the pot`}
        </li>
      )}
      {winners.map(
        (seat) =>
          seat.winNumber !== null && (
            <li key={seat.playerId} className={strongChip}>
              {winLabel(seat.name, seat.winNumber, year, shared)}
            </li>
          ),
      )}
    </ul>
  );
}

function NoWinner({ results }: { results: NightResults }) {
  return (
    <>
      <div className='relative mt-10 flex -space-x-3'>
        {results.seats.map((seat) => (
          <span key={seat.playerId} className='rounded-full bg-frame p-1'>
            <PlayerAvatar colorSlot={seat.colorSlot} name={seat.name} size={56} />
          </span>
        ))}
      </div>
      <h2 className='relative mt-6 text-4xl leading-[0.95] font-bold tracking-tight text-balance sm:text-6xl'>
        {winnerHeadline([])}
      </h2>
      <p className='relative mt-3 max-w-md text-lg font-bold text-hero-muted'>
        Everyone walked out with exactly what they brought. Doesn’t happen often.
      </p>
      <ul className='relative mt-6 flex flex-wrap gap-2'>
        <li className={chip}>{formatDollars(results.potCents)} pot, all of it back home</li>
      </ul>
    </>
  );
}

export function WinnerDeck({ results }: { results: NightResults }) {
  const { winners } = results;
  const [lead] = winners;
  const [backA, backB] = backCardColors(results);

  return (
    <div className='relative px-2 pt-6 pb-3 sm:px-4'>
      <div
        aria-hidden
        className='absolute inset-x-8 top-1 bottom-6 rotate-[-4deg] rounded-[40px] sm:inset-x-12'
        style={{ background: backA }}
      />
      <div
        aria-hidden
        className='absolute inset-x-6 top-3 bottom-4 rotate-[3deg] rounded-[40px] sm:inset-x-10'
        style={{ background: backB }}
      />
      <section
        aria-label='Winner'
        className='relative overflow-hidden rounded-[40px] bg-hero p-6 text-hero-ink shadow-hero sm:p-9'>
        <p className='text-xs font-extrabold tracking-[0.16em] text-hero-muted uppercase'>
          {winnerKicker(winners.length)}
        </p>
        {lead ? (
          <>
            <div className='relative mt-12 flex items-end'>
              {winners.map((seat, index) => (
                <span key={seat.playerId} className={index > 0 ? '-ml-5' : undefined}>
                  <Crowned seat={seat} size={winners.length > 1 ? 96 : 124} />
                </span>
              ))}
            </div>
            <h2 className='relative mt-6 text-4xl leading-[0.95] font-bold tracking-tight text-balance sm:text-6xl'>
              {winnerHeadline(winners.map((seat) => seat.name))}
              <span aria-hidden> 🏆</span>
            </h2>
            <p className='relative mt-3 text-6xl leading-none font-bold tracking-tight text-hero-figure tabular-nums sm:text-[112px]'>
              {formatNet(lead.netCents)}
              {winners.length > 1 && (
                <span className='ml-3 align-middle text-2xl tracking-normal sm:text-3xl'>each</span>
              )}
            </p>
            <WinnerChips results={results} />
          </>
        ) : (
          <NoWinner results={results} />
        )}
      </section>
    </div>
  );
}
