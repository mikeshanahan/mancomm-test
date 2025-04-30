# mancomm-test
Web scraper Lambda function with API Gateway integration using Crawlee.

For this code challenge the goal was to create a scraping tool that pulled data from the Osha Interpretations site, load it into a mongodb, and offer an api interface to query these records.

My approach was first to create this scraping service and set it up in lambda to run once per hour looking for any new links that hadn't been successfully scraped and if there is a new link scrape it and store the results in our mongodb.

From there I outlined the basic service layers to query this data from mongo and expose them through a basic api router which is available through a separate lambda responsible for querying this data.

To test the functionality I have a few basic test scripts which rely on a mongodb connection (which can be run locally using the included docker compose script). 
The two scripts let you test scraping a single url to ensure that the crawlee, cheerio, and selectors are working as expected.
The flow for getting this data is as follows:
    1. Have an interpretation url to scrape (this can either be fed individually like this test case or through the larger sync service which loops through all links from all years)
    2. Use crawlee to queue up this url to retreive the html content
    3. Load that html content into a cheerio object so that we can use selectors to parse the data
    4. There is a standard interface for defining selectors which aligns with the expected data model for the interpretation collection, these selectors are looped through with cheerio to extract their data
    5. Once the data is extracted it's loaded into the corresponding mongodb collection


The query ability is based around a single query string input. From this we build a pipeline as follows to find all possible matches


$and: [
    {
    $or: [
        { url: { $regex: escapedQuery, $options: 'i' } },
        { title: { $regex: escapedQuery, $options: 'i' } },
        { content: { $regex: escapedQuery, $options: 'i' } },
        { standardNumberLinks: { $elemMatch: { $regex: escapedQuery, $options: 'i' } } }
    ]
    },
    { successful: true }
]

The successful flag is used to ensure only valid records are returned to the user.

For this query to work you must specify the 'content' attribute as a text based index. For now this was done through the UI but a 'db setup' script would be useful to ensure configuration across local and deployed environments.

This pipeline returns a paginated response with any result that matches any of those query conditions and also indicates the total number of records found allowing the user to paginate through their results as needed.

The API pattern is setup to route these requests through a basic router implementation that takes all requests from API gateway through a {proxy+} endpoint and deserializes them into a ParsedRequest object which is then passed to the appropriate handler as determined by the method and request path.

From there the request is parsed by an individual api class responsible for handling the interpretation api requests (there are only 2 - the search and a get by id).

This pattern allows for individual namespaces to own their own specific deserialization and routing logic. More helper methods could reduce bloat but as this project only requires the single api context so that was not included.

Additionally I put a small middleware in place which expects an authorization token before the user can search or retrieve interpretation records. This is just hard coded now to look for a specific user id and has a hardcoded jwt secret key for validating the token.

The way this app is deployed to lambda is just ok, ideally the logic in src is broken into a shared component or npm package and then a separate directory for handling the event invoked component. The shared component would be built into a lambda layer or installed as another package which is then reused across each individual invoked lambda such as the api (triggered by api gateway), the scraper (triggered by eventbridge) and a potential db setup component (triggered by a direct call to lambda during deployments).

But for now handling this lambda layer build seemed excessive so instead I packed everything into a single app and just defined specific handlers for each usecase. This means each lambda has the same copy of this code but has a different lambda handler target and trigger for it's respective purpose.

Deployment is handled through AWS SAM which is the fastest way to deploy a small app of this type.

You can not run this app locally as there is no support for that but in the future I might recommend a local proxy with express or using the AWS SAM local invoke features to allow the api to be run and hit locally for querying these documents.


For the frontend it is a basic react + vite + bootstrap application that uses axios and tan stack to perform the queries to the backend. For brevity the user is asked to manually enter their authentication token which can be generated using the test utility here:
backend/tests/test-token-generator.js

After that they can type in their query and the results will highlight and truncate to the matching text from their input. There are links to the standard references and original interpretation if needed.



## Running the app

You can test the querying by spinning up the frontend and inputting a valid auth token (one is saved in the token test file in the backend directory).

 - from ./frontend run 'npm install' and 'npm run dev'

To deploy the app you must have your AWS credentials pasted in the terminal and have the sam cli installed. Then navigate to the backend directory and run
'npm install' and 'npm deploy'
This will handle putting everything together and deploying your app.
 * note you will need to change the samconfig.toml to match the needed mongodb credentials and s3 bucket used for deployment.

There is a health check endpoint that does not require authentication, you can hit that from this url:
https://e69g8qnd92.execute-api.us-east-1.amazonaws.com/Prod/health/check

## Future improvements

This code challenge purposefully left out important details that would otherwise drive this implementation. Probably the largest missing peice is alignment with the required data model and regLogic format as mentioned in the document. I assume this is applied directly to the 'content' portion of these interpretations but it isn't clear without more details exactly how that should be parsed/reaarranged.

Additionally I don't have a lot information with how this information should be retreived. Is the common usecase that someone has a question and wants to find an answer? Do they have a title or reference number they're looking up? 

To me this seems like a great candidate for vector based searching. If each of these documents was also processed through an embedding tool offered by current LLM providers, we could better search the user's query based on semantic similarity to the content of these documents as opposed to direct text matching.

If the purpose is only to re-present this information in an altered format that would depend entirely on the parsing engine that takes this raw text and formats it into regLogic. Each interpretation has a slightly different format so the parsing would have to be built quite flexibly. I attempted to write some regex to look for the format 'question: {question text}' which would allow a user to also search on a specific question answered in the content but the variability of these interpretations made this unreliable so it was left out.

There is also plenty more hardening for this code and it's patterns and how it is deployed but that depends on the greater context of the system and other services/data that must be present.

Also the deployed scraping function is not working in lambda so the data was loaded by running the sync test locally. The issue is simply with crawlee trying to create and access it's storage files in the lambda environment.
I tried to make a configuration utility to point it to the /tmp directory which has write access in lambda but it would always still try to work in the root directory. After 30 min of debugging I moved on from solving this for now.

Lastly, formatting, unit tests, and these niceities are also exluded in this code challenge but would be recommended as a next step.

## Loom video

Here is a link to a loom video to see the app working and it's deployed state in AWS/MongoDB

https://www.loom.com/share/439b15302b444ed3b65fd9546d3de348?sid=6d5b25ba-6c7f-4ed6-8f8a-86cccdbf5263
