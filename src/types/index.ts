export type GameGroup = {
  id: number;
  name: string;
};

export type ISODateString = `${number}-${number}-${number}`; // YYYY-MM-DD

export type Game = {
  id: number;
  name?: string;
  buy_in: number;
  date: ISODateString;
  game_group_id: number;
};

export type NewGameInput = Omit<Game, 'id'>;

// TODO: probably move this to the actions file
export type NewGameResponse = {
  success: boolean;
  game?: Game;
  message?: string;
  error?: Error;
};

export type PlayerSession = {
  id: number;
  game_id: number;
  player_id: number;
  rebuys: number;
  buy_in: number;
  total_cashout: number;
};

export type Player = {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  net_earnings: number;
  biggest_win: number;
  biggest_loss: number;
  average_earnings_per_session: number;
  win_rate: number;
  games_played: number;
};

export type GameWithPlayers = Game & {
  players: Player[];
};

export type PlayerWithGames = Player & {
  games: Game[];
};

export type PlayerWithGameGroups = Player & {
  game_groups: GameGroup[];
};

export type GameGroupWithPlayers = GameGroup & {
  players: Player[];
};
