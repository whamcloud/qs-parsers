import {describe, it, expect} from '../jasmine.js';
import {always, flow} from 'intel-fp';
import {join, assign, like, ends, inList} from '../../source/input-to-qs-parser.js';
import * as parsely from 'intel-parsely';
import {inputToQsTokens} from '../../source/tokens.js';

const tokenizer = parsely.getLexer(inputToQsTokens);

const parseToStr = parsely.parse(always(''));

const choices = parsely.choice([inList, like, ends, assign]);
const expr = parsely.sepBy1(choices, join);
const emptyOrExpr = parsely.optional(expr);
const statusParser = parseToStr([emptyOrExpr, parsely.endOfString]);

const statusInputToQsParser = flow(tokenizer, statusParser, x => x.result);

describe('the input to qs parser', () => {
  var inputOutput = {
    '': '',
    'a': new Error('Expected one of in, contains, ends with, equals'),
    'a = ': new Error('Expected value got end of string'),
    'a b': new Error('Expected one of in, contains, ends with, equals'),
    'a = [1,2,3]': new Error('Expected value got startList at character 4'),
    'a in 3': new Error('Expected startList got value at character 5'),
    'a=b': 'a=b',
    'a in [1,2,3]': 'a__in=1,2,3',
    'a = b and c = d and x in [1]': 'a=b&c=d&x__in=1'
  };

  Object.keys(inputOutput).forEach(input => {
    var output = inputOutput[input];

    if (output instanceof Error)
      output = output.message;

    it('should parse ' + (input || ' empty input ') + ' to ' + output, function () {
      var result = statusInputToQsParser(input);

      if (result instanceof Error)
        result = result.message;

      expect(result).toBe(output);
    });
  });
});