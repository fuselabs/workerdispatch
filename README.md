# guthrie

This repo is based largely on the [heroku mobile app template][heroku] which uses

- ionic
- postgres
- nodeJS
- Express
- and launches to Heroku

We started with a [mobile template][mobile] heroku provides on Github. 
I suggest you start with that, make 2 copies of their "client" folder 
(one called "customerClient" and another "workerClient") 
and then copy the files from this repository in to replace them. 
If you get a question about replacing, skipping, etc... **replace** it.

Then run the sqlQuery.sql script (or copy/paste it into the postgres shell) 
and start the server (usually by being in the directory with `server.js` and running 
`node server.js` or if you're doing development replacing `node` with `nodemon`).

[mobile]:https://github.com/heroku/mobile-template1