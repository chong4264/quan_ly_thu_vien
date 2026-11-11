export default (context: { state: { user?: { role?: { type?: string } } } }) => {
  return context.state.user?.role?.type === "librarian";
};
