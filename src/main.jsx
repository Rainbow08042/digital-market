import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Link, Route, Routes, useLocation, useParams } from 'react-router-dom';
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUpRight, ChevronDown, Grid2X2, List, Search, SlidersHorizontal, X } from 'lucide-react';
import gsap from 'gsap';
import Header from './components/Header';
import Footer from './components/Footer';
import EmployeeCard from './components/EmployeeCard';
import EmployeeStory from './components/EmployeeStory';
import Media from './components/Media';
import Home from './Home';
import { categories, employees } from './data/catalog';
import { employeeMedia } from './data/media';
import { employeeDetails } from './data/employeeDetails';
import './styles.css';

function RouteEffects() {
  const location = useLocation();
  const previousPath = useRef(null);
  useLayoutEffect(() => {
    const samePage = previousPath.current === location.pathname;
    previousPath.current = location.pathname;
    if (location.hash) {
      let frame = 0, cancelled = false;
      // Canvas font measurement and ScrollTrigger refresh both change the initial
      // layout. Resolve deep links after those two paint cycles have settled.
      document.fonts.ready.then(() => {
        if (cancelled) return;
        frame = requestAnimationFrame(() => {
          frame = requestAnimationFrame(() => {
            if (!cancelled) document.getElementById(location.hash.slice(1))?.scrollIntoView({
              behavior: samePage && !matchMedia('(prefers-reduced-motion: reduce)').matches ? 'smooth' : 'instant',
              block: 'start',
            });
          });
        });
      });
      return () => { cancelled = true; cancelAnimationFrame(frame); };
    }
    window.scrollTo({ top: 0, behavior: 'instant' });
    if (location.pathname !== '/' && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
      const context = gsap.context(() => gsap.from('#main-content main', { opacity: 0, y: 24, duration: .65, ease: 'power3.out' }));
      return () => context.revert();
    }
  }, [location.key, location.pathname, location.hash]);
  return null;
}

function Directory({ state, setState }) {
  const { selected, query, view, sort, limit } = state;
  const location = useLocation();
  useEffect(() => {
    document.title = '全部员工 | 数字超市';
    const category = new URLSearchParams(location.search).get('category');
    if (categories.some(item => item.id === category)) {
      setState(previous => previous.categoryLocationKey === location.key ? previous : {
        ...previous, selected: category, query: '', limit: 9, categoryLocationKey: location.key,
      });
    }
  }, [location.key, location.search, setState]);
  const update = (key, value) => setState(previous => ({ ...previous, [key]: value, ...(key !== 'view' && key !== 'limit' ? { limit: 9 } : {}) }));
  let matching = employees.filter(employee => (selected === 'all' || employee.category === selected) && `${employee.title} ${employee.name} ${employee.english} ${employee.description} ${employee.tags.join(' ')}`.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase()));
  if (sort === 'name') matching = [...matching].sort((a, b) => a.title.localeCompare(b.title, 'zh-CN'));
  if (sort === 'featured') matching = [...matching].sort((a, b) => Number(b.featured) - Number(a.featured));
  const visible = matching.slice(0, limit);
  return <main className="directory-page shell" id="top">
    <div className="directory-heading"><div><p className="eyebrow">DIGITAL MARKET / THE DIRECTORY</p><h1>全部员工<sup>{employees.length}</sup></h1></div><p>每一种专业，都有数字可能。<br />找到与你的工作同频的那一位。</p></div>
    <section id="catalog" aria-label="数字员工目录">
      <div className="category-tabs" role="group" aria-label="员工类别">{categories.map(category => <button key={category.id} aria-pressed={selected === category.id} className={selected === category.id ? 'active' : ''} onClick={() => update('selected', category.id)}>{category.name}{selected === category.id && <span>{category.id === 'all' ? employees.length : employees.filter(employee => employee.category === category.id).length}</span>}</button>)}</div>
      <div className="catalog-toolbar"><label className="search-field"><Search size={18} /><input value={query} onChange={event => update('query', event.target.value)} placeholder="搜索员工、技能或场景" aria-label="搜索数字员工" />{query && <button title="清空搜索" aria-label="清空搜索" onClick={() => update('query', '')}><X size={16} /></button>}</label>
        <div className="toolbar-right"><span className="result-count" aria-live="polite">共 <b>{matching.length}</b> 位数字员工</span><label className="sort-control"><SlidersHorizontal size={15} /><select value={sort} onChange={event => update('sort', event.target.value)} aria-label="员工排序"><option value="source">默认排序</option><option value="featured">精选优先</option><option value="name">名称排序</option></select><ChevronDown size={13} /></label><div className="view-toggle" role="group" aria-label="展示方式">{[['grid', Grid2X2, '网格视图'], ['list', List, '列表视图']].map(([mode, Icon, label]) => <button key={mode} title={label} aria-label={label} aria-pressed={view === mode} onClick={() => update('view', mode)}><Icon size={18} /></button>)}</div></div>
      </div>
      {matching.length ? <div className={`employee-grid ${view === 'list' ? 'is-list' : ''}`}>{visible.map(employee => <EmployeeCard key={employee.id} employee={employee} />)}</div> : <div className="empty-state"><Search size={32} /><h2>还没有找到匹配的数字员工</h2><p>试试其他关键词，或查看全部员工。</p><button className="outline-button" onClick={() => setState(previous => ({ ...previous, query: '', selected: 'all', limit: 9 }))}>查看全部员工<ArrowRight size={17} /></button></div>}
      {visible.length < matching.length ? <div className="load-more"><button className="outline-button" onClick={() => update('limit', limit + 9)}>发现更多员工<span>{visible.length} / {matching.length}</span><ArrowDown size={17} /></button></div> : matching.length > 0 && <p className="catalog-end">已展示全部 {matching.length} 位数字员工</p>}
    </section>
  </main>;
}

function Detail() {
  const { id } = useParams();
  const employee = employees.find(item => item.id === id);
  useEffect(() => { document.title = employee ? `${employee.title} | 数字超市` : '未找到员工 | 数字超市'; }, [employee]);
  if (!employee) return <NotFound />;
  const category = categories.find(item => item.id === employee.category);
  const related = employees.filter(item => item.category === employee.category && item.id !== id).slice(0, 3);
  return <main className="detail-page shell" id="top" key={id} data-detail-theme={employeeDetails[id]?.theme}>
    <nav className="breadcrumbs" aria-label="面包屑导航"><Link to="/employees"><ArrowLeft size={15} />全部员工</Link><span>/</span><span>{category.name}</span><span>/</span><span>{employee.title}</span></nav>
    <section className="detail-hero"><div className="detail-art"><Media item={employeeMedia(employee)} priority /><span>DM / {employee.number}</span></div><div className="detail-heading"><p className="eyebrow">{category.name} / DIGITAL EMPLOYEE</p><p className="detail-english">{employee.english}</p><h1>{employee.title}</h1><p className="detail-summary">{employee.summary}</p><div className="tags">{employee.tags.map(tag => <span key={tag}>{tag}</span>)}</div><dl className="detail-facts"><div><dt>员工编号</dt><dd>DM-{employee.number}</dd></div><div><dt>能力领域</dt><dd>{category.name}</dd></div></dl><a className="outline-button" href="#overview">了解这位员工<ArrowDown size={18} /></a></div></section>
    <EmployeeStory employee={employee} detail={employeeDetails[id]} />
    <section className="related-section"><div className="related-heading"><div><h2>更多同领域员工</h2></div><Link className="text-link" to="/employees">返回全部员工<ArrowUpRight size={18} /></Link></div><div className="employee-grid">{related.map(item => <EmployeeCard key={item.id} employee={item} />)}</div></section>
  </main>;
}

function NotFound() {
  return <main className="not-found shell"><p className="eyebrow">404 / NOT FOUND</p><h1>这位数字同事<br />暂时不在这里。</h1><Link to="/employees" className="outline-button">返回全部员工<ArrowUpRight size={20} /></Link></main>;
}

function App() {
  const [catalogState, setCatalogState] = useState({ selected: 'all', query: '', view: 'grid', sort: 'source', limit: 9 });
  return <BrowserRouter><a href="#main-content" className="skip-link">跳到主要内容</a><Header /><div id="main-content" tabIndex={-1}><Routes><Route path="/" element={<Home />} /><Route path="/employees" element={<Directory state={catalogState} setState={setCatalogState} />} /><Route path="/employee/:id" element={<Detail />} /><Route path="*" element={<NotFound />} /></Routes></div><Footer /><RouteEffects /></BrowserRouter>;
}

createRoot(document.getElementById('root')).render(<App />);
