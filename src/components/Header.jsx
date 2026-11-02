import { useEffect, useRef, useState } from 'react';
import { ArrowUpRight, Menu, X } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

export function Brand() {
  return <Link className="brand" to="/" aria-label="数字超市首页"><span className="brand-row"><strong>DMKT</strong><span>数字超市</span></span><small>DIGITAL / MARKET</small></Link>;
}

export default function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(window.scrollY > 24);
  const location = useLocation();
  const button = useRef(null);
  useEffect(() => { setOpen(false); }, [location]);
  useEffect(() => {
    const scroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener('scroll', scroll, { passive: true });
    return () => window.removeEventListener('scroll', scroll);
  }, []);
  useEffect(() => {
    if (!open) return;
    const key = event => { if (event.key === 'Escape') { setOpen(false); button.current?.focus(); } };
    document.addEventListener('keydown', key);
    return () => document.removeEventListener('keydown', key);
  }, [open]);
  const links = [['/#about', '关于'], ['/#ceo-workspace', 'CEO 工作台'], ['/#works', '项目初衷'], ['/#capabilities', '能力领域']];
  return <>
    <header className={`site-header shell ${scrolled || location.pathname !== '/' ? 'is-scrolled' : ''}`}><Brand /><nav className="desktop-nav" aria-label="主导航">{links.map(([to, title]) => <Link key={to} to={to}>{title}</Link>)}</nav><Link to="/employees" className="contact-link">全部员工<ArrowUpRight size={16} /></Link><button ref={button} className="menu-button" aria-label={open ? '关闭菜单' : '打开菜单'} aria-expanded={open} aria-controls="mobile-menu" onClick={() => setOpen(!open)}>{open ? <X /> : <Menu />}</button></header>
    {open && <nav className="mobile-menu" id="mobile-menu" aria-label="移动端导航">{[...links, ['/employees', '全部员工']].map(([to, title]) => <Link key={to} to={to} onClick={() => setOpen(false)}>{title}<ArrowUpRight size={20} /></Link>)}</nav>}
  </>;
}
