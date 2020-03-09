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
- POST requests will not accept data except in JSON format, and will specify
  strict CORS headers as a hint to browsers.

When testing locally, you can simply disable CORS checking on your browser and
everything should behave as per normal, without having to launch a copy of the
web-backend.

For programmatic-access-only services, just ignore the CORS headers and you can
use the API endpoints as you please. The login endpoints will work without a
recaptcha but will be site-wide rate-limited. Please use descriptive user
agents.

For alternative frontends to redditloans which you don't want to PR you will
have to contact me to have you whitelisted in the CORS headers.
