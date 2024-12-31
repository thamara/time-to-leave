'use strict';

import { MockClass } from '../__mocks__/Mock.mjs';

function getDataRecursive(array, keyList)
{
    if (keyList.length === 0)
    {
        throw new Error('Empty key list');
    }
    if (keyList.length === 1)
    {
        return array[keyList];
    }
    else
    {
        return getDataRecursive(array[keyList[0]], keyList.splice(1));
    }
}

function _getTranslationInLanguageData(languageData, key)
{
    const keyList = key.split('.');
    return getDataRecursive(languageData['translation'], keyList);
}

function _translatePage(language, languageData, windowName)
{
    $('html').attr('lang', language);

    function translateElement(element)
    {
        const attr = $(element).attr('data-i18n');
        if (typeof attr !== 'undefined' && attr !== false && attr.length > 0)
        {
            $(element).html(getTranslationInLanguageData(languageData, attr));
        }
    }

    const callback = (key, value) => { translateElement(value); };
    $('title').each(callback);
    $('body').each(callback);
    $('p').each(callback);
    $('label').each(callback);
    $('div').each(callback);
    $('span').each(callback);
    $('option').each(callback);
    $('th').each(callback);
    $('a').each(callback);
    $('button').each(callback);

    const titleAttr = `$${windowName}.title`;
    $(document).attr('title', `Time to Leave - ${getTranslationInLanguageData(languageData, titleAttr)}`);
}

// Enable mocking for some methods, export the mocked versions
const mocks = {'getTranslationInLanguageData': _getTranslationInLanguageData, 'translatePage': _translatePage};
export const getTranslationInLanguageData = (languageData, key) => mocks['getTranslationInLanguageData'](languageData, key);
export const translatePage = (language, languageData, windowName) => mocks['translatePage'](language, languageData, windowName);
export const i18nTranslatorMock = new MockClass(mocks);
