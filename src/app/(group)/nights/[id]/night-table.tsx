import type { NightRsvp } from '@/nights/invites';
import { PlayerAvatar } from '@/players/player-avatar';
import { playerColor } from '@/players/player-color';

export const TABLE_SEATS = 10;

const SIZE = 310;
const TILT = 58;
const TURN = 22.5;
const CHIPS_PER_PLAYER = 2;
const OCTAGON = 'polygon(29% 0, 71% 0, 100% 29%, 100% 71%, 71% 100%, 29% 100%, 0 71%, 0 29%)';

function TableLayer({ inset, z, background }: { inset: number; z: number; background: string }) {
  return (
    <div
      style={{
        position: 'absolute',
        inset,
        clipPath: OCTAGON,
        background,
        transform: `translateZ(${z}px)`,
      }}
    />
  );
}

function PotChips({ count }: { count: number }) {
  return (
    <div style={{ position: 'absolute', left: '50%', top: '50%', transformStyle: 'preserve-3d' }}>
      {Array.from({ length: count }, (_, index) => (
        <div
          key={index}
          style={{
            position: 'absolute',
            width: 58,
            height: 58,
            marginLeft: -29,
            marginTop: -29,
            borderRadius: '50%',
            transform: `translateZ(${2 + index * 2.2}px)`,
            background:
              index === count - 1
                ? 'repeating-conic-gradient(#fff 0 16deg, #c2410c 16deg 60deg)'
                : index % 8 < 4
                  ? '#9a3412'
                  : '#7c2d12',
          }}
        />
      ))}
    </div>
  );
}

function Seat({ player, index }: { player: NightRsvp | undefined; index: number }) {
  const angle = ((index + 2.5) / TABLE_SEATS) * 2 * Math.PI + (TURN * Math.PI) / 180 / 2;
  return (
    <div
      style={{
        position: 'absolute',
        left: `${50 + 54 * Math.cos(angle)}%`,
        top: `${50 + 54 * Math.sin(angle)}%`,
        transformStyle: 'preserve-3d',
      }}>
      {player ? (
        <div
          style={{
            position: 'absolute',
            marginLeft: -24,
            marginTop: -48,
            transformOrigin: '50% 100%',
            transform: `rotateZ(${-TURN}deg) rotateX(${-TILT}deg)`,
          }}>
          <span
            className='block rounded-full p-0.5'
            style={{ background: playerColor(player.colorSlot).solid }}>
            <PlayerAvatar colorSlot={player.colorSlot} name={player.name} size={44} />
          </span>
        </div>
      ) : (
        <div
          style={{
            position: 'absolute',
            width: 34,
            height: 34,
            marginLeft: -17,
            marginTop: -17,
            borderRadius: '50%',
            border: '2px dashed rgba(255,255,255,.35)',
          }}
        />
      )}
    </div>
  );
}

export function NightTable({ going }: { going: NightRsvp[] }) {
  const seated = going.slice(0, TABLE_SEATS);
  const waiting = going.slice(TABLE_SEATS);

  return (
    <div aria-hidden className='flex h-full flex-col items-center justify-center gap-3 p-4 pb-8'>
      <div
        className='origin-center scale-[.72] min-[375px]:scale-[.8] sm:scale-100'
        style={{ perspective: 1100, width: SIZE, height: 260 }}>
        <div
          style={{
            position: 'relative',
            width: SIZE,
            height: SIZE,
            marginTop: -30,
            transformStyle: 'preserve-3d',
            transform: `rotateX(${TILT}deg) rotateZ(${TURN}deg)`,
          }}>
          {Array.from({ length: 16 }, (_, index) => (
            <TableLayer key={index} inset={18} z={index - 16} background='#2a1a10' />
          ))}
          <TableLayer inset={18} z={0} background='#5b3a22' />
          <TableLayer inset={34} z={1} background='#0f6b52' />
          <TableLayer inset={46} z={1.5} background='#12795d' />
          <PotChips count={seated.length * CHIPS_PER_PLAYER} />
          {Array.from({ length: TABLE_SEATS }, (_, index) => (
            <Seat key={index} player={seated[index]} index={index} />
          ))}
        </div>
      </div>
      {waiting.length > 0 && (
        <ul className='flex max-w-full flex-wrap justify-center gap-1.5'>
          {waiting.map((player) => (
            <li key={player.playerId}>
              <PlayerAvatar colorSlot={player.colorSlot} name={player.name} size={36} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
