'use strict';

const request = require('request');
const moment = require('moment');

let CircleUsage = function(env){
  if(!(this instanceof CircleUsage)) {
    return new CircleUsage(env);
  }
  this._CIRCLE_TOKEN = env.CIRCLE_TOKEN;
  this._MAX_MINUTE   = env.MAX_MINUTE;
  this._PAGE         = env.PAGE;
  this._print        = env.OUTPUT_FUNCTION;
  if(env.SRARTTIME){
    this._STARTTIME = moment(env.SRARTTIME);
    this._ENDTIME = moment([this._STARTTIME.year(), this._STARTTIME.month() + 1, 1]).subtract(1, 'seconds');
  }else{
    this._STARTTIME = moment([moment().year(), moment().month(), 1]);
    this._ENDTIME = moment();
  }
};

CircleUsage.prototype._generateOption = function (offset){
  let options = {
    url: 'https://circleci.com/api/v1.1/recent-builds?circle-token=' + this._CIRCLE_TOKEN,
    method: 'GET',
    body: '',
    json: true,
  };
  options.url = options.url + '&limit=' + this._PAGE + '&offset=' + offset;
  return options;
};

CircleUsage.prototype._getRecentBuilds = function (offset){
  return new Promise((resolve, reject) => {
    request(this._generateOption(offset), (error, response, responseData) => {
      if(error){
        reject(error);
        return null;
      }else{
        if(!Array.isArray(responseData) || responseData.length === 0){
          resolve(0);
          return null;
        }
        let secondSum = 0;
        responseData.forEach((data) => {
          if(this._STARTTIME.isBefore(data.queued_at) && this._ENDTIME.isAfter(data.queued_at)){
            secondSum += (data.build_time_millis / 1000);
          }
        });
        this._getRecentBuilds(offset + this._PAGE).then((nextSecondSum) => {
          resolve(nextSecondSum + secondSum);
          return null;
        });
        return null;
      }
    });
  });
};

CircleUsage.prototype.run = function(){
  return this._getRecentBuilds(0).then((second) => {
    const minute = second / 60;
    if(this._MAX_MINUTE){
      this._print(`Circle CI usage: ${Math.floor(minute)}min/${this._MAX_MINUTE}min (${Math.floor(minute * 100 / this._MAX_MINUTE)}%)`);
    }else{
      this._print(`Circle CI usage: ${Math.floor(minute)}min`);
    }
    return null;
  });
};

module.exports = CircleUsage;
