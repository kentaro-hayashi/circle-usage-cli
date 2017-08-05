'use strict';

const chai = require('chai');
const assert = chai.assert;
const CircleUsage = require('../lib/circle-usage');

const CIRCLE_TOKEN = process.env.CIRCLE_TOKEN;

describe('CircleUsage', function(){
  it('normality test', function(done){
    this.timeout(10000);
    const env = {
      PAGE: 100,
      CIRCLE_TOKEN: CIRCLE_TOKEN,
      MAX_MINUTE: 1500,
      STARTTIME: undefined,
      OUTPUT_FUNCTION: (str) => {
        assert.equal(typeof(str), 'string');
      },
    };

    const circleUsage = new CircleUsage(env);
    circleUsage.run().then(() => {
      done();
    });
  });
});
