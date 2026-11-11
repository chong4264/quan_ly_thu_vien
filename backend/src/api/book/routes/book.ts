/**
 * book route
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreRouter('api::book.book', {
  config: {
    create: { policies: ['global::is-library-staff'] },
    update: { policies: ['global::is-library-staff'] },
    delete: { policies: ['global::is-library-staff'] },
  },
});
