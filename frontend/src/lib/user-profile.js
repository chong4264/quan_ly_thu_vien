export const displayName = (user) => user?.profile?.displayName || user?.username || 'Tài khoản';

export const roleName = (user) => {
  if (user?.role?.type === 'librarian') return 'Thủ thư';
  const patronType = user?.profile?.patron?.patronType?.name;
  if (patronType) return patronType.replace(/Sinh viên/g, 'Sinh viên').replace(/Giảng viên/g, 'Giảng viên');
  return 'Độc giả';
};
