import type { Core } from '@strapi/strapi';
import { docs, UID, UnauthorizedError } from './library';

export async function findUserPatron(strapi: Core.Strapi, user: any) {
  if (!user?.id) throw new UnauthorizedError('Vui lòng đăng nhập');
  const [patron] = await docs(strapi, UID.patron).findMany({
    filters: { user: { id: { $eq: user.id } } },
    populate: { patronType: true },
    limit: 1,
  });
  return patron ?? null;
}

export function userProfile(user: any, patron: any) {
  return {
    displayName: patron?.fullName || user.username,
    linked: !!patron,
    patron: patron && {
      documentId: patron.documentId,
      fullName: patron.fullName,
      studentCode: patron.studentCode,
      className: patron.className,
      cardBarcode: patron.cardBarcode,
      phone: patron.phone,
      address: patron.address,
      cardStatus: patron.cardStatus,
      cardExpiresAt: patron.cardExpiresAt,
      patronType: patron.patronType && {
        name: patron.patronType.name,
        maxBooks: patron.patronType.maxBooks,
        loanDays: patron.patronType.loanDays,
        maxRenewals: patron.patronType.maxRenewals,
        renewDays: patron.patronType.renewDays,
      },
    },
  };
}
