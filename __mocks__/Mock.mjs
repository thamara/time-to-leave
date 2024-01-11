'use strict';

class MockClass
{
    /**
     * Construct passing a dictionary of strings to Functions.
     * @param {Dictionary<string, Function>} mocks
     */
    constructor(mocks)
    {
        this._mocks = mocks;
        this._mocked = {};
        this._originals = {};
        for (const [methodName, method] of Object.entries(this._mocks))
        {
            this._mocked[methodName] = false;
            this._originals[methodName] = method;
        }
    }

    /**
     * Test related function to enable mocking exported methods
     * @param {string} methodName
     * @param {Function} stub
     */
    mock(methodName, stub)
    {
        if (!(methodName in this._mocks))
        {
            throw Error('Mocking not set for this method');
        }
        else
        {
            this._mocks[methodName] = stub;
            this._mocked[methodName] = true;
        }
    }

    /**
     * Test related function to get mocking exported methods
     * @param {string} methodName
     */
    getMock(methodName)
    {
        if (!(methodName in this._mocks))
        {
            throw Error('Mocking not set for this method');
        }
        else
        {
            if (!this._mocked[methodName])
            {
                throw Error('Method not mocked');
            }
            return this._mocks[methodName];
        }
    }

    /**
     * Restore a single mocked method
     * @param {string} methodName
     */
    restoreMock(methodName)
    {
        if (!(methodName in this._mocks))
        {
            throw Error('Mocking not set for this method');
        }
        else
        {
            if (!this._mocked[methodName])
            {
                throw Error('Method not mocked');
            }
            this._mocks[methodName] = this._originals[methodName];
            this._mocked[methodName] = false;
        }
    }

    /**
     * Restore all mocked methods
     */
    restoreAll()
    {
        for (const [methodName, isMocked] of Object.entries(this._mocked))
        {
            if (isMocked)
            {
                this.restoreMock(methodName);
            }
        }
    }
}

export {
    MockClass,
};
