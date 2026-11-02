import { ArrowUp } from 'lucide-react';
import { Brand } from './Header';

export default function Footer() {
  return <footer className="site-footer shell"><Brand /><span>© 2026 DIGITAL MARKET</span><button title="回到顶部" onClick={() => window.scrollTo({ top: 0, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' })}>回到顶部<ArrowUp size={16} /></button></footer>;
}
