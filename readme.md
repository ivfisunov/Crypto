# Crypto 

Service provides REST API and WS broadcasting for getting information about 
crypto currencies exchange rate.  

Requirements: Docker, docker-compose

To start service:  
``` 
// with npm
npm start

// with docker
docker-compose up 
```

## Project structure:

#### Scheduler service
Service collect data from cryptocompare.com and stores it in PostgreSQL. New data fetches  
every two minutes with data storage time for two hours. It also provides websocket API  
allowing to get currencies rate online every two minutes.  
``` http://localhost:4501/socket.io ```  


#### REST API
Service provides endpoint to get crypto currencies exchange rate.  
``` http://localhost:4500/price?fsyms=BTC,ETH&tsyms=USD,EUR ```  
Service fetches data from cryptocompare.com, cache data for one minute in Redis.  
If there is an error getting data from remote, service returns data from PostgreSQL.  

