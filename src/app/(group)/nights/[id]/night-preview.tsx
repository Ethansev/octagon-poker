import type { NightResults } from '@/app/(group)/nights/[id]/load-night';
import { winnerHeadline, winnerKicker } from '@/app/(group)/nights/[id]/winner-copy';
import {
  PreviewAvatar,
  previewColors,
  PreviewFrame,
  PreviewKicker,
  PreviewMark,
} from '@/link-previews/preview-card';
import { formatDollars, formatNet } from '@/money/money';
import { formatNightTime, formatShortNightDate } from '@/nights/dates';
import type { NightDetail } from '@/nights/nights';
import { firstName } from '@/players/first-name';

const SHOWN_RESULTS = 4;
const SHOWN_SEATS = 5;

function clamp(lines: number): React.CSSProperties {
  return { display: 'block', lineClamp: lines };
}

function figureSize(figure: string): number {
  if (figure.length <= 7) return 132;
  return figure.length <= 10 ? 96 : 72;
}

function CardHeader({ groupName, aside }: { groupName: string; aside?: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
      <PreviewMark size={56} />
      <div style={{ display: 'flex', fontSize: 30, fontWeight: 800 }}>{groupName}</div>
      {aside && (
        <div
          style={{
            marginLeft: 'auto',
            maxWidth: 620,
            overflow: 'hidden',
            whiteSpace: 'nowrap',
            textOverflow: 'ellipsis',
            fontSize: 26,
            fontWeight: 600,
            color: previewColors.muted,
          }}>
          {aside}
        </div>
      )}
    </div>
  );
}

export function NightInviteCard({ groupName, night }: { groupName: string; night: NightDetail }) {
  const shown = night.seats.slice(0, SHOWN_SEATS);
  const more = night.seats.length - shown.length;
  const details = [
    night.startTime === null ? null : formatNightTime(night.startTime),
    night.buyInCents === null ? null : `${formatDollars(night.buyInCents)} buy-in`,
  ].filter((detail) => detail !== null);

  return (
    <PreviewFrame>
      <CardHeader groupName={groupName} />
      <div style={{ display: 'flex', flex: 1, alignItems: 'center', gap: 48, marginTop: 8 }}>
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0 }}>
          <PreviewKicker>Poker night</PreviewKicker>
          <div
            style={{
              display: 'flex',
              marginTop: 10,
              fontSize: 104,
              fontWeight: 800,
              letterSpacing: -3,
              lineHeight: 1.02,
            }}>
            {formatShortNightDate(night.date)}
          </div>
          {night.location && (
            <div
              style={{
                ...clamp(2),
                marginTop: 6,
                fontSize: night.location.length > 22 ? 40 : 56,
                fontWeight: 800,
                letterSpacing: -1,
                lineHeight: 1.12,
                color: previewColors.figure,
              }}>
              {`at ${night.location}`}
            </div>
          )}
          {details.length > 0 && (
            <div
              style={{
                display: 'flex',
                marginTop: 18,
                fontSize: 34,
                fontWeight: 600,
                color: previewColors.muted,
              }}>
              {details.join(' · ')}
            </div>
          )}
        </div>
        {shown.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, width: 320 }}>
            <PreviewKicker>{`Who’s in · ${night.seats.length}`}</PreviewKicker>
            {shown.map((seat) => (
              <div key={seat.playerId} style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <PreviewAvatar name={seat.playerName} colorSlot={seat.playerColorSlot} />
                <div
                  style={{
                    flex: 1,
                    overflow: 'hidden',
                    whiteSpace: 'nowrap',
                    textOverflow: 'ellipsis',
                    fontSize: 30,
                    fontWeight: 800,
                  }}>
                  {firstName(seat.playerName)}
                </div>
              </div>
            ))}
            {more > 0 && (
              <div
                style={{
                  display: 'flex',
                  fontSize: 26,
                  fontWeight: 600,
                  color: previewColors.muted,
                }}>
                {`+${more} more`}
              </div>
            )}
          </div>
        )}
      </div>
    </PreviewFrame>
  );
}

export function NightResultCard({
  groupName,
  night,
  results,
}: {
  groupName: string;
  night: NightDetail;
  results: NightResults;
}) {
  const headline = winnerHeadline(results.winners.map((winner) => firstName(winner.name)));
  const figure = results.winners[0] ? formatNet(results.winners[0].netCents) : null;
  const where = [night.location, formatShortNightDate(night.date)].filter(Boolean).join(' · ');

  return (
    <PreviewFrame>
      <CardHeader groupName={groupName} aside={where} />
      <div style={{ display: 'flex', flex: 1, alignItems: 'center', gap: 48, marginTop: 8 }}>
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0 }}>
          <PreviewKicker>{winnerKicker(results.winners.length)}</PreviewKicker>
          <div
            style={{
              ...clamp(2),
              marginTop: 10,
              fontSize: headline.length > 16 ? 56 : 76,
              fontWeight: 800,
              letterSpacing: -2,
              lineHeight: 1.05,
            }}>
            {headline}
          </div>
          {figure && (
            <div
              style={{
                display: 'flex',
                marginTop: 8,
                whiteSpace: 'nowrap',
                fontSize: figureSize(figure),
                fontWeight: 800,
                letterSpacing: -4,
                lineHeight: 1,
                color: previewColors.figure,
              }}>
              {figure}
            </div>
          )}
          <div
            style={{
              display: 'flex',
              marginTop: 18,
              fontSize: 34,
              fontWeight: 600,
              color: previewColors.muted,
            }}>
            {`${formatDollars(results.potCents)} pot · ${results.seats.length} ${results.seats.length === 1 ? 'player' : 'players'}`}
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, width: 420 }}>
          {results.seats.slice(0, SHOWN_RESULTS).map((seat) => (
            <div
              key={seat.playerId}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 16,
                padding: '10px 22px 10px 10px',
                borderRadius: 999,
                background: previewColors.chip,
              }}>
              <PreviewAvatar name={seat.name} colorSlot={seat.colorSlot} />
              <div
                style={{
                  flex: 1,
                  overflow: 'hidden',
                  whiteSpace: 'nowrap',
                  textOverflow: 'ellipsis',
                  fontSize: 28,
                  fontWeight: 800,
                }}>
                {firstName(seat.name)}
              </div>
              <div
                style={{
                  display: 'flex',
                  flexShrink: 0,
                  fontSize: 28,
                  fontWeight: 800,
                  color: seat.netCents > 0 ? previewColors.figure : previewColors.muted,
                }}>
                {formatNet(seat.netCents)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </PreviewFrame>
  );
}
