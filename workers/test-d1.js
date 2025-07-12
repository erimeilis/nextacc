// Test script for D1 storage worker
// This script tests the basic operations (get, set, remove) against the D1 worker

// Get the worker URL from the environment variable or use a default
const workerUrl = process.env.NEXT_PUBLIC_D1_WORKER_URL || 'https://d1-storage.your-account.workers.dev'

// Test data
const testKey = 'test-key-' + Date.now()
const testValue = {message: 'Hello, D1!', timestamp: Date.now()}

// Helper function to make requests to the worker
async function fetchFromWorker(method, key, value) {
    const url = new URL(workerUrl)
    url.searchParams.append('method', method)
    if (key) {
        url.searchParams.append('key', key)
    }

    const options = {
        method: method === 'getItem' ? 'GET' : 'POST',
        headers: {
            'Content-Type': 'application/json'
        }
    }

    // For setItem, include the value in the request body
    if (method === 'setItem' && value !== undefined) {
        options.body = JSON.stringify({value})
    }

    try {
        const response = await fetch(url.toString(), options)

        if (!response.ok) {
            throw new Error(`D1 storage operation failed: ${response.statusText}`)
        }

        // For getItem, return the value from the response
        if (method === 'getItem') {
            const data = await response.json()
            return data.value
        }

        return null
    } catch (error) {
        console.error('D1 storage error:', error)
        throw error
    }
}

// Run the tests
async function runTests() {
    console.log('Testing D1 storage worker...')
    console.log(`Worker URL: ${workerUrl}`)
    console.log(`Test key: ${testKey}`)
    console.log(`Test value:`, testValue)

    try {
        // Test setItem
        console.log('\nTesting setItem...')
        await fetchFromWorker('setItem', testKey, testValue)
        console.log('✅ setItem successful')

        // Test getItem
        console.log('\nTesting getItem...')
        const retrievedValue = await fetchFromWorker('getItem', testKey)
        console.log('Retrieved value:', retrievedValue)

        // Check if the retrieved value matches the test value
        const isMatch = JSON.stringify(retrievedValue) === JSON.stringify(testValue)
        if (isMatch) {
            console.log('✅ getItem successful - values match')
        } else {
            console.log('❌ getItem failed - values do not match')
            console.log('Expected:', testValue)
            console.log('Received:', retrievedValue)
        }

        // Test removeItem
        console.log('\nTesting removeItem...')
        await fetchFromWorker('removeItem', testKey)
        console.log('✅ removeItem successful')

        // Verify that the item was removed
        console.log('\nVerifying item was removed...')
        const removedValue = await fetchFromWorker('getItem', testKey)
        if (removedValue === null) {
            console.log('✅ Item was successfully removed')
        } else {
            console.log('❌ Item was not removed')
            console.log('Retrieved value after removal:', removedValue)
        }

        console.log('\nAll tests completed!')
    } catch (error) {
        console.error('\n❌ Tests failed:', error)
    }
}

// Run the tests
runTests()
