const languages = {
    'de-DE': 'Deutsch',
    'en': 'English',
    'es': 'Español',
    'hi': 'हिंदी',
    'id': 'Bahasa Indonesia',
    'it': 'Italiano',
    'mr': 'मराठी',
    'nl': 'Nederlands',
    'pl': 'Polski',
    'pt-BR': 'Português - Brasil',
    'th-TH': 'ไทย',
    'zh-TW': '繁體中文'
};

/**
* Get supported language codes
*/
function getLanguagesCodes()
{
    return Object.keys(languages);
}

/**
* Returns the name of a given language code
*/
function getLanguageName(code)
{
    return languages[code];
}

module.exports = {
    fallbackLng: 'en',
    namespace: 'translation',
    getLanguagesCodes,
    getLanguageName
};