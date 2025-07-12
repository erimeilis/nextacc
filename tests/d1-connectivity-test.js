// Test script for D1 storage connectivity
// This script tests if the D1 storage is working correctly

// Set the environment variable to the actual worker URL
// Replace this with your actual worker URL if different
process.env.NEXT_PUBLIC_D1_WORKER_URL = 'https://d1-storage.eri-42e.workers.dev';

// Import the storage adapter
import { d1Storage } from '../stores/d1Storage';

// Test data
const testKey = 'test-connectivity-key';
const testData = { test: 'data for D1 connectivity test', timestamp: Date.now() };

// Main test function
async function testD1Connectivity() {
  console.log('Starting D1 connectivity test...');
  
  try {
    // Test setItem
    console.log('Testing setItem...');
    await d1Storage.setItem(testKey, testData);
    console.log('✅ setItem successful');
    
    // Test getItem
    console.log('Testing getItem...');
    const retrievedData = await d1Storage.getItem(testKey);
    console.log('Retrieved data:', retrievedData);
    
    if (JSON.stringify(retrievedData) === JSON.stringify(testData)) {
      console.log('✅ getItem successful - data matches');
    } else {
      console.log('❌ getItem test failed - data does not match');
      console.log('Expected:', testData);
      console.log('Received:', retrievedData);
    }
    
    // Test removeItem
    console.log('Testing removeItem...');
    await d1Storage.removeItem(testKey);
    console.log('✅ removeItem called');
    
    // Verify item was removed
    const afterRemoval = await d1Storage.getItem(testKey);
    if (afterRemoval === null) {
      console.log('✅ removeItem successful - item was removed');
    } else {
      console.log('❌ removeItem test failed - item still exists');
      console.log('Item after removal:', afterRemoval);
    }
    
    console.log('D1 connectivity test completed successfully!');
  } catch (error) {
    console.error('❌ D1 connectivity test failed with error:', error);
  }
}

// Run the test
testD1Connectivity().catch(error => {
  console.error('Unhandled error in test:', error);
});

// Instructions to run this test:
// 1. Make sure the D1 worker is deployed (see workers/README.md)
// 2. Run the test: node tests/d1-connectivity-test.js
