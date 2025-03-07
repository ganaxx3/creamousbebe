// Serverless function for Netlify to handle API requests
const { createClient } = require('@supabase/supabase-js');

exports.handler = async (event, context) => {
  // CORS headers to allow requests from any origin
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
  };

  // Handle preflight OPTIONS request
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  // Create Supabase client using environment variables
  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  );

  // Parse the path to determine the endpoint
  const path = event.path.replace(/\/\.netlify\/functions\/api/, '');
  const segments = path.split('/').filter(Boolean);

  try {
    // Handle matchup requests
    if (segments[0] === 'matchups' && segments[1]) {
      const championName = segments[1];
      
      const { data, error } = await supabase
        .from('champion_matchups')
        .select('*')
        .eq('champion_name', championName);

      if (error) {
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({ error: 'Erro ao buscar matchup' })
        };
      }

      // Return default object if no data found
      if (!data || data.length === 0) {
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({
            champion_name: championName,
            description: '',
            spells: '',
            difficulty: '',
            runes: ''
          })
        };
      }

      // Format and return the matchup data
      const matchup = data[0];
      const formattedMatchup = {
        ...matchup,
        spells: matchup.spells || '',
        description: matchup.description || '',
        difficulty: matchup.difficulty || '',
        runes: matchup.runes || ''
      };

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(formattedMatchup)
      };
    }

    // Handle environment variables request
    if (path === '/env') {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          SUPABASE_URL: process.env.SUPABASE_URL,
          SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY
        })
      };
    }

    // Default response for unhandled routes
    return {
      statusCode: 404,
      headers,
      body: JSON.stringify({ error: 'Rota não encontrada' })
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message })
    };
  }
};