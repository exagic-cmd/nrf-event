const path = require('path');

module.exports = {
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'es', 'ja'],
    localeDetection: true, 
    //  localePrefix: 'always',
    
  },
  ns: ['common', 'affiliateProgram', 'auth', 'daytour', 'order-payment', 'transfer','order','payment'],
  defaultNS: 'common',
  localePath:path.resolve('./public/locales'),
};