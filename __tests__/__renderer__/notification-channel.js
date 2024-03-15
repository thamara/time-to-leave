'use strict';

import assert from 'assert';
import jQuery from 'jquery';
import jsdom from 'jsdom';

import { searchLeaveByElement } from '../../renderer/notification-channel.js';

global.$ = jQuery(new jsdom.JSDOM().window);

describe('Notifications channel',  () =>
{
    it('Should get content of #leave-by element', done =>
    {
        $('body').append('<input id="leave-by" value="12:12" />');
        // Way to get the file considered for coverage
        searchLeaveByElement({
            sender: {
                send: (channel, value) =>
                {
                    assert.strictEqual(channel, 'RECEIVE_LEAVE_BY');
                    assert.strictEqual(value, '12:12');
                    done();
                }
            }
        });
    });
});
