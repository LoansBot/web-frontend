# LoansBot - Web Frontend

This repository contains the static web front-end assets which you see when you
visit https://redditloans.com. All of the HTML and JS served changes only with
updates to this repository; everything dynamic is done through API endpoints.

This uses React to component-tize the front-end, but does not use any
preprocessors. The entire website is meant to function if you were to open it
on a local web-browser.

## CSRF

To protect against cross-site request forgery with this technique, the web
backend promises the following:

- GET requests never manipulate resources
- POST requests will not accept data except in JSON format
- No cookies; always use credentials=omit

With these it's very easy to serve a front-end anywhere that interacts with
our backend. Just ensure that it's extremely clear to the user that you aren't
the official front-end, and include a prominent link to the official one at
least once in a users lifetime.
