var config = require('config');

console.log('Load system configuration...')

var ServerConfig;
if (config.has('Server')){
	ServerConfig = config.get('Server');
	console.log('	Load server config (Done) !');
}

var DbConfig;
if (config.has('Database')){
	DbConfig = config.get('Database');
	console.log('	Load database config (Done) !');
}

var MapConfig;
if (config.has('ClientMap')){
	MapConfig = config.get('ClientMap');
	console.log('	Load map config (Done) !');
}

module.exports.ServerConfig = ServerConfig;
module.exports.DbConfig = DbConfig;
module.exports.MapConfig = MapConfig;