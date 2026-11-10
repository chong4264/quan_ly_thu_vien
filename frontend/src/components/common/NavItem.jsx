import { Link, useLocation } from 'react-router-dom';

// Link có trạng thái active. `active` = các class áp dụng khi đang ở trang đó.
export default function NavItem({ to, active, className = '', children }) {
  const { pathname } = useLocation();
  const isActive = !!active && pathname === `/${to}`;
  const base = isActive
    ? className.split(' ').filter((c) => !/^(text-on-surface-variant|hover:)/.test(c)).join(' ')
    : className;
  return <Link to={`/${to}`} className={`${base} ${isActive ? active : ''}`.trim()}>{children}</Link>;
}
