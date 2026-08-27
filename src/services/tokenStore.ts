class TokenStore {
  private token: string | null = null;
  private userId: string | null = null;
  private readonly TOKEN_KEY = 'sim_auth_token';
  private readonly USER_ID_KEY = 'sim_user_id';

  constructor() {
    this.token = localStorage.getItem(this.TOKEN_KEY);
    this.userId = localStorage.getItem(this.USER_ID_KEY);
  }

  setToken(token: string) {
    this.token = token;
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  getToken(): string | null {
    if (!this.token) {
      this.token = localStorage.getItem(this.TOKEN_KEY);
    }
    return this.token;
  }

  setUserId(userId: string) {
    this.userId = userId;
    localStorage.setItem(this.USER_ID_KEY, userId);
  }

  getUserId(): string | null {
    if (!this.userId) {
      this.userId = localStorage.getItem(this.USER_ID_KEY);
    }
    return this.userId;
  }

  clear() {
    this.token = null;
    this.userId = null;
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_ID_KEY);
  }
}

export const tokenStore = new TokenStore();
export default tokenStore;
