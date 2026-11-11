export default (plugin: any) => {
  const originalMe = plugin.controllers.user.me;
  plugin.controllers.user.me = async (context: any) => {
    await originalMe(context);
    const role = context.state.user?.role;
    if (context.body && role) {
      context.body.role = { id: role.id, name: role.name, type: role.type };
    }
  };
  return plugin;
};
