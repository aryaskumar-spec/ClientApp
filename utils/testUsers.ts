export interface TestUser {
  username: string;
  password: string;
  userId?: string; 
}

export interface SiteConfig {
  name: string;
  baseURL: string;
  apiBaseURL: string;
  loginEndpoint: string;
  users: TestUser[];
  workers: number;
}

export const siteConfig: SiteConfig = {
  name: 'client',
  baseURL: 'https://rahulshettyacademy.com/client/#/auth/login',
  apiBaseURL: 'https://rahulshettyacademy.com/api/ecom/',
  loginEndpoint: 'auth/login',
  users: [
    { username: 'aryas1@test.com', password: 'Aryas@123' },
    { username: 'aryas2@test.com', password: 'Aryas@123' },
    { username: 'aryas3@test.com', password: 'Aryas@123' },
    { username: 'aryas4@test.com', password: 'Aryas@123' },
    { username: 'aryas5@test.com', password: 'Aryas@123' },
    { username: 'aryas6@test.com', password: 'Aryas@123' },
    { username: 'aryas7@test.com', password: 'Aryas@123' },
    { username: 'aryas8@test.com', password: 'Aryas@123' },
    { username: 'aryas9@test.com', password: 'Aryas@123' },
    { username: 'aryas10@test.com', password: 'Aryas@123' },
  ],
  workers: 6
};