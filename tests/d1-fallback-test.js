// Test script for D1 storage fallback mechanism
// This script simulates a scenario where D1 is unavailable and tests if the fallback to IndexedDB works

// Mock environment variables
process.env.NEXT_PUBLIC_D1_WORKER_URL = 'https://non-existent-worker.workers.dev';

// Import the storage adapters
import { d1Storage } from '../stores/d1Storage';
import { idbStorage } from '../stores/idbStorage';

// Mock IndexedDB storage for testing
jest.mock('../stores/idbStorage', () => ({
  idbStorage: {
    getItem: jest.fn().mockResolvedValue({ test: 'data from IndexedDB' }),
    setItem: jest.fn().mockResolvedValue(undefined),
    removeItem: jest.fn().mockResolvedValue(undefined),
  },
}));

describe('D1 Storage Fallback Tests', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();

    // Mock fetch to simulate D1 being unavailable
    global.fetch = jest.fn().mockRejectedValue(new Error('D1 unavailable'));
  });

  test('getItem falls back to IndexedDB when D1 is unavailable', async () => {
    const result = await d1Storage.getItem('test-key');

    // Verify that fetch was called (attempt to use D1)
    expect(global.fetch).toHaveBeenCalled();

    // Verify that IndexedDB fallback was used
    expect(idbStorage.getItem).toHaveBeenCalledWith('test-key');

    // Verify that we got the data from IndexedDB
    expect(result).toEqual({ test: 'data from IndexedDB' });
  });

  test('setItem falls back to IndexedDB when D1 is unavailable', async () => {
    const testData = { test: 'data to store' };
    await d1Storage.setItem('test-key', testData);

    // Verify that fetch was called (attempt to use D1)
    expect(global.fetch).toHaveBeenCalled();

    // Verify that IndexedDB fallback was used
    expect(idbStorage.setItem).toHaveBeenCalledWith('test-key', testData);
  });

  test('removeItem falls back to IndexedDB when D1 is unavailable', async () => {
    await d1Storage.removeItem('test-key');

    // Verify that fetch was called (attempt to use D1)
    expect(global.fetch).toHaveBeenCalled();

    // Verify that IndexedDB fallback was used
    expect(idbStorage.removeItem).toHaveBeenCalledWith('test-key');
  });
});

// Instructions to run this test:
// 1. Make sure Jest is installed: npm install --save-dev jest
// 2. Run the test: npx jest tests/d1-fallback-test.js
