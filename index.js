var Promise=require('bluebird'),
  http=require('http'),
  weatherUrl='http://api.openweathermap.org/data/2.5/weather?units=imperial&q=',
  cities=['LA','NY','SF'],
  citySuffix=',US';

function weatherIn(options){
  function weatherInPromise(resolve,reject){
    var location=options.city+citySuffix,
      url=weatherUrl+location;
    http.get(url,function(response){
      if(response.statusCode!==200){
        return reject(new Error('Bad response status code: '+response.statusCode));
      }
      response.setEncoding('utf8');
      response.on('data',function(weatherReport){
        options.weatherReport=JSON.parse(weatherReport);
        resolve(options);
      });
    }).on('error',function(error){
      reject(error);
    });
  }
  return new Promise(weatherInPromise);
}

var promises=[];
cities.forEach(function(city){
  promises.push(weatherIn({city:city}).catch(function(error){
    console.log('Caught error %s.',error);
  }));
});

Promise.all(promises)
  .then(function(optionsList){
    optionsList.forEach(function(options){
      if(!options) return;
      console.log('The weather is %s, in %s.',
        options.weatherReport.weather[0].description.toLowerCase(),
        options.weatherReport.name);
    });
  })
  .catch(function(error){
    console.log('Caught %s getting weather reports.',error);
    process.exit(1);
  })
  .finally(function(){
    process.exit(0);
  });
