import * as fs from 'fs';
import { siteConfig } from './testUsers';

function getCappedWorkerIndex(workerIndex: number): number {
  return workerIndex % siteConfig.workers; } // ← cap to available users

export function getTokenFromStorage(workerIndex: number): string {
  const cappedIndex = getCappedWorkerIndex(workerIndex);  // ← use capped
  const storageState = JSON.parse(
    fs.readFileSync(`storage/${siteConfig.name}/user-${cappedIndex}.json`, 'utf-8')
  );

  const origin = storageState.origins?.find((o: any) =>
    o.origin.includes('rahulshettyacademy.com')
  );

  const token = origin?.localStorage?.find((e: any) =>
    e.name === 'token'
  )?.value;

  if (!token) throw new Error(`❌ Token not found for worker ${workerIndex}`);

  return token;
}

export function getUserIdFromStorage(workerIndex: number): string {
  const cappedIndex = getCappedWorkerIndex(workerIndex);
  const storageState = JSON.parse(
    fs.readFileSync(`storage/${siteConfig.name}/user-${cappedIndex}.json`, 'utf-8')
  );

  const origin = storageState.origins?.find((o: any) =>
    o.origin.includes('rahulshettyacademy.com')
  );

  const userId = origin?.localStorage?.find((e: any) =>
    e.name === 'userId'  // ← matches what we saved
  )?.value;

  if (!userId) throw new Error(`❌ UserId not found for worker ${workerIndex}`);
  return userId;
}