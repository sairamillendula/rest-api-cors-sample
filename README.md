Zuora CORS REST API Sample
==========================

This application is to show how to call Zuora REST API using CORS (cross origin resource sharing).

This sample application includes both server and client apps. 

The server side is using `Scala` + `Play`, implemented two services:

* create signature and token which are used by CORS
* list all credit cards of sample account.

The client is implemented with AngularJs, JQuery and Bootstrap, the assets are located in `public` folder.

The sample is also running on Heroku[http://zuora-cors-demo.herokuapp.com].

Prerequisites
-------------

* Scala 2.10.2
* Playframework 2.2.0

How to Run
-----------

After `scala` and `play` are installed, in application root directory:

> play run

Then, open your browser and access `http://localhost:9000` 
