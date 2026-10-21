export const MEMBER_COOKIE = 'op_member';
export const PLAYER_COOKIE = 'op_player';

type AccessCookieOptions = {
  httpOnly: boolean;
  sameSite: 'lax';
  secure: boolean;
  maxAge: number;
  path: string;
};

export function accessCookieOptions(): AccessCookieOptions {
  return {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 400 * 24 * 60 * 60,
    path: '/',
  };
}
