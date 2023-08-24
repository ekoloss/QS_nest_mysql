export interface IAuthAccessOptions {
  role?: ('admin' | 'user')[];
  mode?: 'guest' | 'authorised' | 'any';
  useOTT?: boolean;
}
