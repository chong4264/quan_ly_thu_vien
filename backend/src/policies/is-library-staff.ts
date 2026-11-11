export default (context: { state: { user?: { role?: { type?: string } } } }) => {
  const type = context.state.user?.role?.type;
  return !!type && !["authenticated", "public", "reader"].includes(type);
};
