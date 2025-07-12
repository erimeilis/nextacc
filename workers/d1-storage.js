// Cloudflare Worker for D1 storage operations
// This worker handles storage operations (get, set, delete) for the D1 database

export default {
  async fetch(request, env) {
    // Set up CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    // Handle OPTIONS request for CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: corsHeaders,
      });
    }

    // Parse the URL to get the method and key
    const url = new URL(request.url);
    const method = url.searchParams.get('method');
    const key = url.searchParams.get('key');

    // Validate the method and key
    if (!method) {
      return new Response(JSON.stringify({ error: 'Method is required' }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      });
    }

    try {
      // Handle different methods
      if (method === 'getItem' && key) {
        // Get item from D1
        const stmt = env.DB.prepare('SELECT value FROM store WHERE key = ?');
        const result = await stmt.bind(key).first();

        return new Response(JSON.stringify({ value: result ? JSON.parse(result.value) : null }), {
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders,
          },
        });
      } else if (method === 'setItem' && key) {
        // Parse the request body to get the value
        let value;
        if (request.method === 'POST') {
          const body = await request.json();
          value = body.value;
        }

        if (value === undefined) {
          return new Response(JSON.stringify({ error: 'Value is required for setItem' }), {
            status: 400,
            headers: {
              'Content-Type': 'application/json',
              ...corsHeaders,
            },
          });
        }

        // Store the value as a JSON string
        const stringValue = JSON.stringify(value);

        // Upsert the value in D1
        const stmt = env.DB.prepare(
          'INSERT INTO store (key, value) VALUES (?, ?) ON CONFLICT (key) DO UPDATE SET value = ?'
        );
        await stmt.bind(key, stringValue, stringValue).run();

        return new Response(JSON.stringify({ success: true }), {
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders,
          },
        });
      } else if (method === 'removeItem' && key) {
        // Delete item from D1
        const stmt = env.DB.prepare('DELETE FROM store WHERE key = ?');
        await stmt.bind(key).run();

        return new Response(JSON.stringify({ success: true }), {
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders,
          },
        });
      } else {
        return new Response(JSON.stringify({ error: 'Invalid method or missing key' }), {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders,
          },
        });
      }
    } catch (error) {
      // Log the error and return a 500 response
      console.error('D1 storage error:', error);

      return new Response(JSON.stringify({ error: 'Internal server error' }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      });
    }
  },
};
