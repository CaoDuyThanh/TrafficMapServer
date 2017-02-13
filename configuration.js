var config = require('config');

var ServerConfig;
if (config.has('Server')){
	ServerConfig = config.get('Server');
}

var DbConfig;
if (config.has('Database')){
	DbConfig = config.get('Database');
}

var MapConfig;
if (config.has('ClientMap')){
	MapConfig = config.get('ClientMap');
}

module.exports.ServerConfig = ServerConfig;
module.exports.DbConfig = DbConfig;
module.exports.MapConfig = MapConfig;