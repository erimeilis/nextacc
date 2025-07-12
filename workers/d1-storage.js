// D1 Storage Worker for Cloudflare D1
// This worker handles storage operations for the d1Storage adapter

// Initialize the database
async function initializeDb(db) {
  try {
    console.log('Initializing database...');

    // Check if the storage table exists
    const tableExists = await db.prepare(
      "SELECT name FROM sqlite_master WHERE type='table' AND name='storage'"
    ).all();

    console.log('Table exists check result:', JSON.stringify(tableExists));

    // Create the table if it doesn't exist
    if (!tableExists.results || tableExists.results.length === 0) {
      console.log('Creating storage table...');
      await db.prepare("CREATE TABLE storage (key TEXT PRIMARY KEY, value TEXT)").run();
      console.log('Storage table created successfully');
    } else {
      console.log('Storage table already exists');
    }

    return true;
  } catch (error) {
    console.error('Error initializing database:', error);
    console.error('Error details:', JSON.stringify(error, Object.getOwnPropertyNames(error)));
    throw error;
  }
}

// Handle GET requests (getItem)
async function handleGet(request, env) {
  try {
    console.log('Handling GET request...');

    const url = new URL(request.url);
    const key = url.searchParams.get('key');
    console.log('Request key:', key);

    if (!key) {
      console.log('No key provided in request');
      return new Response(JSON.stringify({ error: 'Key is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Check if DB binding exists
    if (!env.DB) {
      console.error('DB binding is not available');
      return new Response(JSON.stringify({ error: 'Database not configured' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    console.log('Using D1 database directly...');

    // Initialize the database if needed
    console.log('Initializing database...');
    await initializeDb(env.DB);

    // Query the database for the key
    console.log('Querying database for key:', key);
    try {
      // Use D1's native prepare/bind/first methods
      const result = await env.DB.prepare("SELECT value FROM storage WHERE key = ?")
        .bind(key)
        .first()
        .then(row => row ? { value: row.value } : null);

      console.log('Query result:', result ? 'Found' : 'Not found');

      if (!result) {
        console.log('No value found for key:', key);
        return new Response(JSON.stringify({ value: null }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      // Parse the stored JSON value
      let parsedValue = null;
      try {
        parsedValue = JSON.parse(result.value);
        console.log('Successfully parsed stored value');
      } catch (e) {
        console.error('Error parsing stored value:', e);
        parsedValue = result.value;
      }

      console.log('Returning successful response');
      return new Response(JSON.stringify({ value: parsedValue }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    } catch (queryError) {
      console.error('Error querying database:', queryError);
      console.error('Query error details:', JSON.stringify(queryError, Object.getOwnPropertyNames(queryError)));
      throw queryError; // Re-throw to be caught by outer try-catch
    }
  } catch (error) {
    console.error('Error in GET handler:', error);
    console.error('Error details:', JSON.stringify(error, Object.getOwnPropertyNames(error)));
    return new Response(JSON.stringify({ error: 'Internal server error', message: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// Handle POST requests (setItem)
async function handlePost(request, env) {
  try {
    console.log('Handling POST request...');

    const url = new URL(request.url);
    const key = url.searchParams.get('key');
    console.log('Request key:', key);

    if (!key) {
      console.log('No key provided in request');
      return new Response(JSON.stringify({ error: 'Key is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Check if DB binding exists
    if (!env.DB) {
      console.error('DB binding is not available');
      return new Response(JSON.stringify({ error: 'Database not configured' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Get the value from the request body
    console.log('Parsing request body...');
    let body;
    try {
      body = await request.json();
      console.log('Request body parsed successfully');
    } catch (bodyError) {
      console.error('Error parsing request body:', bodyError);
      return new Response(JSON.stringify({ error: 'Invalid JSON in request body' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const valueToStore = JSON.stringify(body);

    console.log('Using D1 database directly...');

    // Initialize the database if needed
    console.log('Initializing database...');
    await initializeDb(env.DB);

    // Insert or replace the value in the database
    console.log('Inserting/replacing value in database for key:', key);
    try {
      // Use D1's native prepare/bind/run methods
      await env.DB.prepare("INSERT OR REPLACE INTO storage (key, value) VALUES (?, ?)")
        .bind(key, valueToStore)
        .run();
      console.log('Value stored successfully');

      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    } catch (queryError) {
      console.error('Error executing database query:', queryError);
      console.error('Query error details:', JSON.stringify(queryError, Object.getOwnPropertyNames(queryError)));
      throw queryError; // Re-throw to be caught by outer try-catch
    }
  } catch (error) {
    console.error('Error in POST handler:', error);
    console.error('Error details:', JSON.stringify(error, Object.getOwnPropertyNames(error)));
    return new Response(JSON.stringify({ error: 'Internal server error', message: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// Handle DELETE requests (removeItem)
async function handleDelete(request, env) {
  try {
    console.log('Handling DELETE request...');

    const url = new URL(request.url);
    const key = url.searchParams.get('key');
    console.log('Request key:', key);

    if (!key) {
      console.log('No key provided in request');
      return new Response(JSON.stringify({ error: 'Key is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Check if DB binding exists
    if (!env.DB) {
      console.error('DB binding is not available');
      return new Response(JSON.stringify({ error: 'Database not configured' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    console.log('Using D1 database directly...');

    // Initialize the database if needed
    console.log('Initializing database...');
    await initializeDb(env.DB);

    // Delete the key from the database
    console.log('Deleting key from database:', key);
    try {
      // Use D1's native prepare/bind/run methods
      await env.DB.prepare("DELETE FROM storage WHERE key = ?")
        .bind(key)
        .run();
      console.log('Key deleted successfully');

      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    } catch (queryError) {
      console.error('Error executing database query:', queryError);
      console.error('Query error details:', JSON.stringify(queryError, Object.getOwnPropertyNames(queryError)));
      throw queryError; // Re-throw to be caught by outer try-catch
    }
  } catch (error) {
    console.error('Error in DELETE handler:', error);
    console.error('Error details:', JSON.stringify(error, Object.getOwnPropertyNames(error)));
    return new Response(JSON.stringify({ error: 'Internal server error', message: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// Main fetch handler
export default {
  async fetch(request, env) {
    console.log('Worker received request:', request.method, request.url);

    try {
      // Add CORS headers to allow cross-origin requests
      const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      };

      // Handle OPTIONS requests (CORS preflight)
      if (request.method === 'OPTIONS') {
        console.log('Handling CORS preflight request');
        return new Response(null, {
          status: 204,
          headers: corsHeaders
        });
      }

      // Process the request
      console.log('Processing request...');
      const response = await handleRequest(request, env);

      // Add CORS headers to the response
      console.log('Adding CORS headers to response');
      const newResponse = new Response(response.body, response);

      Object.keys(corsHeaders).forEach(key => {
        newResponse.headers.set(key, corsHeaders[key]);
      });

      console.log('Returning response with status:', response.status);
      return newResponse;
    } catch (error) {
      console.error('Unhandled error in fetch handler:', error);
      console.error('Error details:', JSON.stringify(error, Object.getOwnPropertyNames(error)));

      // Return a generic error response with CORS headers
      const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Content-Type': 'application/json'
      };

      return new Response(JSON.stringify({ 
        error: 'Internal server error', 
        message: 'An unexpected error occurred processing your request',
        details: error.message
      }), {
        status: 500,
        headers: corsHeaders
      });
    }
  }
};

// Route requests to the appropriate handler
async function handleRequest(request, env) {
  console.log('Routing request...');
  console.log('Request method:', request.method);
  console.log('Request URL:', request.url);

  const url = new URL(request.url);
  const endpoint = url.pathname.split('/').pop();
  console.log('Endpoint:', endpoint);

  switch (request.method) {
    case 'GET':
      if (endpoint === 'get') {
        console.log('Routing to GET handler');
        return handleGet(request, env);
      }
      break;
    case 'POST':
      if (endpoint === 'set') {
        console.log('Routing to POST handler');
        return handlePost(request, env);
      }
      break;
    case 'DELETE':
      if (endpoint === 'remove') {
        console.log('Routing to DELETE handler');
        return handleDelete(request, env);
      }
      break;
  }

  console.log('No matching route found, returning 404');
  return new Response(JSON.stringify({ error: 'Not found', path: url.pathname, method: request.method }), {
    status: 404,
    headers: { 'Content-Type': 'application/json' }
  });
}
