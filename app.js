const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const https = require("https");

app.use(bodyParser.urlencoded({ extended: true }));
app.get("/", function (req, res) {
  res.sendFile(__dirname + "/index.html");
});

// Serve static files from the "WeatherApp" folder
app.use(express.static("WeatherApp"));

//----------------------- WORKING CITY API
app.post("/", function (req, res) {
  const cityName = req.body.cityName;
  // Set empty variables to be defined when input and API are determined
  let lat;
  let long;
  let dataUrl;
  // Set variabe for is zip to simlify lat and long syntax later
  let isZip = false;
  // if cityNme is a #, call this api
  if (!isNaN(Number(cityName))) {
    // Only set is zip true for Numeric input
    isZip = true;
    // !!!!!!!!!!ALWAYS USE CONSOLE LOG TO TEST!!!!!!!!
    // console.log("this should be a number");
    dataUrl = `https://api.openweathermap.org/geo/1.0/zip?zip=${cityName},US&appid=511d8dc691c3f462fc7290f379695d0c`;
    // if cityName is text, call this api
  } else {
    // console.log("this should be a string");
    dataUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${cityName},US&appid=511d8dc691c3f462fc7290f379695d0c`;
  }
  https.get(dataUrl, function (response) {
    response.on("data", function (data) {
      const jsondataPlug = JSON.parse(data);
      // console.log(jsondataPlug);
      // The error handling cannot go here because we have not yet pulled the data with the cod property (Move to line 61)
      // if (jsondataPlug.cod !== 200) {
      //   console.log(jsondataPlug);
      //   res.statusCode = 400;
      //   res.send();
      //   return;
      // }
      // But let's look into error handling for entering nivalid input here.
      // If else to tell the user if an invalid city or zipcode is entered
      // If an zip that does not have a matching latitude is entered, return message saying so
      if (isZip && !jsondataPlug.lat) {
        res.send(`<h1>I'm sorry, ${cityName} is an invalid zip code. 🙁</h1>`);
        return;
        // If a city is entered and the array does not exist (or is empty '=== 0'), return the message saying it is an invalid city
      } else if (!isZip && jsondataPlug.length === 0) {
        res.send(`<h1>I'm sorry, ${cityName} is an invalid city. 🙁</h1>`);
        return;
      }
      // At first, these two if else statements were separate, but now after adding error handling for invalid input, we can mush them together
      // if isZip = true, there is no array of lat and lon
      else if (isZip) {
        lat = jsondataPlug.lat;
        long = jsondataPlug.lon;
      } else {
        // if izZip = false, there IS an array of lat and lon
        lat = jsondataPlug[0].lat;
        long = jsondataPlug[0].lon;
      }
      const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${long}&appid=511d8dc691c3f462fc7290f379695d0c&units=imperial`;
      https.get(url, function (response) {
        response.on("data", function (data) {
          const jsondata = JSON.parse(data);
          // console.log(jsondata);
          // Error handling here because this jsondata is where the cod property lives
          //Error handling (If status code is not 200, log error code to console)
          if (jsondata.cod !== 200) {
            console.log(`Error Code: ${jsondata.cod}`);
            res.statusCode = 400;
            res.send();
            return;
          } else {
            const temp = jsondata.main.temp;
            const des = jsondata.weather[0].description;
            const icon = jsondata.weather[0].icon;
            const imageurl = "http://openweathermap.org/img/wn/" + icon + "@2x.png";
            res.write(`<h1>The temp in ${cityName} is ${temp} degrees</h1>`);
            res.write(`<p>The weather description is ${des} </p>`);
            res.write("<img src=" + imageurl + ">");
            res.send();
          }
        });
      });
    });
  });
});

app.listen(9000);
//__________________________STILL NEED TO ADD ERROR HANDLING FOR IF CITY/ZIP IS NOT FOUND

// ______________________ API INFO LINK: https://openweathermap.org/api/geocoding-api

// _______________________________________________NOT WORKING BUT LATEST ATTEMPT AT UPDATE_______________________________________________
// const express = require("express");
// const app = express();
// const bodyParser = require("body-parser");
// const https = require("https");

// app.use(bodyParser.urlencoded({ extended: true }));
// app.get("/", function (req, res) {
//   res.sendFile(__dirname + "/index.html");
// });

// app.use(express.static("WeatherApp")); // Serve static files from the "public" folder

// app.get("/", function (req, res) {
//   res.sendFile(__dirname + "/WeatherApp/index.html");
// });

// app.post("/", function (req, res) {
//   const location = req.body.cityName;
//   let lat;
//   let long;
//   if (typeof Number(location) === "number") {
//     const locationUrl = `https://api.openweathermap.org/geo/1.0/zip?zip=${location},US&appid=511d8dc691c3f462fc7290f379695d0c`;
//     https.get(locationUrl, function (response) {
//       response.on("data", function (data) {
//         const jsondata = JSON.parse(data);
//         lat = jsondata.lat;
//         long = jsondata.lon;
//       });
//     });
//   } else if (typeof Number(location) === "string") {
//     const locationUrl = `http://api.openweathermap.org/geo/1.0/direct?q={city name},{state code},US&limit=1&appid=511d8dc691c3f462fc7290f379695d0c`;
//     https.get(locationUrl, function (response) {
//       response.on("data", function (data) {
//         const jsondata = JSON.parse(data);
//         lat = jsondata.lat;
//         long = jsondata.lon;
//       });
//     });
//   }

//   const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${long}&appid=511d8dc691c3f462fc7290f379695d0c&units=imperial`;
//   https.get(url, function (response) {
//     response.on("data", function (data) {
//       const jsondata = JSON.parse(data);
//       const temp = jsondata.main.temp;
//       const des = jsondata.weather[0].description;
//       const icon = jsondata.weather[0].icon;
//       const imageurl = "http://openweathermap.org/img/wn/" + icon + "@2x.png";
//       res.write(`<h1>The temp in ${location} is ${temp} degrees</h1>`);
//       res.write(`<p>The weather description is ${des} </p>`);
//       res.write("<img src=" + imageurl + ">");
//       res.send();
//     });
//   });
// });
// app.listen(9000);

//________________________________________________The following code works seperately_________________________________________________
// -----------------we need to find a way to make the zip run when numbers are entered, and city when text is enetered
// const express = require("express");
// const app = express();
// const bodyParser = require("body-parser");
// const https = require("https");
// const fetch = require("node- fetch")

// app.use(bodyParser.urlencoded({ extended: true }));
// app.get("/", function (req, res) {
//   res.sendFile(__dirname + "/index.html");
// });

// app.use(express.static("WeatherApp")); // Serve static files from the "public" folder

// // app.get("/", function (req, res) {
// //   res.sendFile(__dirname + "/WeatherApp/index.html");
// // });

// _____________________________________________________ WORKING CITY API_____________________________________________________
// app.post("/", function (req, res) {
//   const cityName = req.body.cityName;
//   let lat;
//   let long;
//   const dataUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${cityName},US&appid=511d8dc691c3f462fc7290f379695d0c`;
//   https.get(dataUrl, function (response) {
//     response.on("data", function (data) {
//       const jsondataPlug = JSON.parse(data);
//       lat = jsondataPlug[0].lat;
//       long = jsondataPlug[0].lon;
//       const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${long}&appid=511d8dc691c3f462fc7290f379695d0c&units=imperial`;
//       https.get(url, function (response) {
//         response.on("data", function (data) {
//           const jsondata = JSON.parse(data);
//           const temp = jsondata.main.temp;
//           const des = jsondata.weather[0].description;
//           const icon = jsondata.weather[0].icon;
//           const imageurl = "http://openweathermap.org/img/wn/" + icon + "@2x.png";
//           res.write(`<h1>The temp in ${cityName} is ${temp} degrees</h1>`);
//           res.write(`<p>The weather description is ${des} </p>`);
//           res.write("<img src=" + imageurl + ">");
//           res.send();
//         });
//       });
//     });
//   });
// });

// _______________________________________________WORKING ZIP CODE API___________________________________________________
// app.post("/", function (req, res) {
//   const cityName = req.body.cityName;
//   let lat;
//   let long;
//   const dataUrl = `https://api.openweathermap.org/geo/1.0/zip?zip=${cityName},US&appid=511d8dc691c3f462fc7290f379695d0c`;
//   https.get(dataUrl, function (response) {
//     response.on("data", function (data) {
//       const jsondataPlug = JSON.parse(data);
//       lat = jsondataPlug.lat;
//       long = jsondataPlug.lon;
//       const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${long}&appid=511d8dc691c3f462fc7290f379695d0c&units=imperial`;
//       https.get(url, function (response) {
//         response.on("data", function (data) {
//           const jsondata = JSON.parse(data);
//           const temp = jsondata.main.temp;
//           const des = jsondata.weather[0].description;
//           const icon = jsondata.weather[0].icon;
//           const imageurl = "http://openweathermap.org/img/wn/" + icon + "@2x.png";
//           res.write(`<h1>The temp in ${cityName} is ${temp} degrees</h1>`);
//           res.write(`<p>The weather description is ${des} </p>`);
//           res.write("<img src=" + imageurl + ">");
//           res.send();
//         });
//       });
//     });
//   });
// });

// app.listen(9000);

// ____________________________________________________ WORKING INITIAL (CLASS) CODE___________________________________
// const express = require("express");
// const app = express();
// const bodyParser = require("body-parser");
// const https = require("https");

// app.use(bodyParser.urlencoded({ extended: true }));
// app.get("/", function (req, res) {
//   console.log("In first route!🫣");
//   res.sendFile(__dirname + "/index.html");
// });

// app.use(express.static("WeatherApp")); // Serve static files from the "WeatherApp" folder
// // app.get("/", function (req, res) {
// //   console.log("In second route!🫣");
// //   res.sendFile(__dirname + "/WeatherApp/index.html");
// // });

// app.post("/", function (req, res) {
//   //this function is taking in a request and creating the response
//   const cityName = req.body.cityName;
//   // THis is important to do when looking at what info is being posted: console.log(req);
//   // An api is just a url that holds data (we call the api to retrieve, execute, update, or delete data )
//   const url = `https://api.openweathermap.org/data/2.5/weather?lat=35.22709&lon=-80.84313&appid=314bcd2ca38da9a25591907407356bc7&units=imperial`;
//   https.get(url, function (response) {
//     response.on("data", function (data) {
//       const jsondata = JSON.parse(data);
//       console.log(jsondata);
//       const temp = jsondata.main.temp;
//       const des = jsondata.weather[0].description;
//       const icon = jsondata.weather[0].icon;
//       const imageurl = "http://openweathermap.org/img/wn/" + icon + "@2x.png";
//       res.write(`<h1>The temp in ${cityName} is ${temp} degrees</h1>`);
//       res.write(`<p>The weather description is ${des} </p>`);
//       res.write("<img src=" + imageurl + ">");
//       res.send();
//     });
//   });
// });
