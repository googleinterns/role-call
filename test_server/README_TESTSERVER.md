# How to test

To start up a test server to serve the pre-compiled/pre-built angular package in the frontend folder, simply run `npm run test_prod`.

To compile the new changes into a prod build and then run the test server, simply run `npm run build_and_test_prod`.

If you'd like to run it through the default `ng serve` method, simply run `npm run serve`.

# About the server

The server is very simplistic in nature. First, it simply configures express to serve static files from the `frontend/rolecall/dist/rolecall` folder, which is where the angular build is compiled to when `ng build --prod` is run. This allows the server to serve the javascript runtimes needed to operate the app.

Then, it serves all other requests (with url selector `"/*"`) to `frontend/rolecall/dist/rolecall/index.html`. This means all urls will be passed the `index.html` file, which will then render the app based on the url of the request.

This demonstrates how we can serve the frontend through the same App Engine as the backend, or any server for that matter.

The server also logs all new connections to it. This ensures that the frontend is not accidentally using hrefs instead of routerLinks to handle page navigation, resulting in multiple requests for `index.html` when it is not necessary.