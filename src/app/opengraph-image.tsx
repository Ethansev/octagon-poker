import {
  previewColors,
  PreviewFrame,
  PreviewKicker,
  PreviewMark,
  previewSize,
  renderPreview,
} from '@/link-previews/preview-card';

export const alt = 'You’re invited to Octagon Poker';
export const size = previewSize;
export const contentType = 'image/png';

export default function Image() {
  return renderPreview(
    <PreviewFrame>
      <div style={{ display: 'flex', flex: 1, alignItems: 'center', gap: 64 }}>
        <PreviewMark size={240} />
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <PreviewKicker>You’re invited</PreviewKicker>
          <div
            style={{
              display: 'flex',
              marginTop: 10,
              fontSize: 96,
              fontWeight: 800,
              letterSpacing: -3,
              lineHeight: 1.05,
            }}>
            Octagon Poker
          </div>
          <div
            style={{
              display: 'flex',
              marginTop: 14,
              fontSize: 36,
              fontWeight: 600,
              color: previewColors.muted,
            }}>
            The private record book for our home game
          </div>
        </div>
      </div>
    </PreviewFrame>,
  );
}
