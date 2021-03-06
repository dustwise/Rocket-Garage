const nest = require('nesthydrationjs')();

const db  = require ('../../db/db'),
      jwt = require('jsonwebtoken');

const garageDefinition = [{
  owner_details : {
    uid : 'uid',
    steamID : 'steamID',
    username : 'username'
  },
  garages : [{
    gid : 'gid',
    header : 'header',
    subheader : 'subheader',
    platform : 'platform',
    primaryGarage : 'primaryGarage',
    items : [{
      name : 'name',
      color : 'color',
      cert : 'cert',
      uiid : 'uiid',
      itemType : 'itemType',
      postType : 'postType',
      rarity : 'rarity'
    }]
  }]
}];

exports.findOrCreateUser = (userSteamID) => {
  return db('users')
  .select('steamID', 'uid', 'username')
  .where('steamID', "=", userSteamID)
  .then(user => {
    if(user.length != 1){
      console.log("User not found, making a new one!");
      return db('users')
      .insert({ steamID : userSteamID }, ['uid', 'steamID', 'username']);
    }
    console.log("User found!");
    return [{ uid : user[0].uid, steamID : user[0].steamID, username : user[0].username }];
  })
}

exports.generateJWT = (payload) => {
 return jwt.sign(payload, 'testSecret123');
}

exports.getUidByUsername = (username) => {
  return db('users')
    .where('username', '=', username)
    .select('uid')
}

exports.getGarages = (uid) => {
  return db('garages')
  .where('garages.user_id', '=', uid)
  .join('users', 'garages.user_id', '=', 'users.uid')
  .join('user_items', 'user_items.garage_id', '=', 'garages.gid')
  .join('items', 'user_items.item', '=', 'items.iid')
  .leftOuterJoin('paints', 'user_items.paint', '=', 'paints.pid')
  .leftOuterJoin('certs', 'user_items.cert', '=', 'certs.cid')
  .select('garages.header as header', 'garages.subheader as subheader', 'garages.platform as platform', 'garages.primaryGarage as primaryGarage', 'garages.gid as gid',
          'items.name as name', 'paints.color as color', 'certs.type as cert', 'user_items.uiid as uiid', 'items.type as itemType', 'user_items.postType as postType', 
          'garages.user_id as uid', 'users.steamID as steamID', 'users.username as username', 'items.rarity as rarity')
  .then(data => {
    return nest.nest(data, garageDefinition);
  })
}           