/* 
Lambda API router to process requests from API gateway to the api router
*/

import { deserializeRequest, corsHeaders } from '../api/deserializer';
import { router } from '../api/main';
import { MongoClient } from '../vendors/mongodb/mongo-client';
import { Settings } from '../config/settings';

export const handler = async (event: any, _: any): Promise<any> => {
  // Connect to MongoDB
  const mongoClient = MongoClient.getInstance();
  await mongoClient.connect(Settings.mongo.uri, Settings.mongo.dbName);

  // Format request object
  let request = deserializeRequest(event);
  
  if (request.method === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({})
    };
  }
  
  try {
    const response = await router(request);
    return {
      ...response,
      headers: { ...corsHeaders, ...(response.headers || {}) }
    };
  } catch (error) {
    console.error('API Error:', error);
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'Internal Server Error' })
    };
  }
}
