import { useLayoutEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowDownRight, ArrowRight, ArrowUpRight, AudioLines, Command, Layers3, ScanLine } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import FuzzyText from './components/FuzzyText';
import FluidBackground from './components/FluidBackground';
import EdgeGlow from './components/EdgeGlow';
import HeroScene from './components/HeroScene';
import Media from './components/Media';
import AboutGallery from './components/AboutGallery';
import CeoWorkspace from './components/CeoWorkspace';
import { employees, featuredEmployees } from './data/catalog';
import { media } from './data/media';
import { collectHomepageImageSources, preloadHomepageImages } from './utils/preloadHomepageMedia';
import { startLoadingFeedback } from './utils/loadingFeedback';

gsap.registerPlugin(ScrollTrigger);
const selected = featuredEmployees;
const selectedIds = new Set(selected.map(employee => employee.id));
const galleryEmployees = [employees[33], employees[10], employees[16], employees[8], employees[7]]
  .filter(employee => !selectedIds.has(employee.id));
const purposes = [
  { id: 'access', en: 'LOWER THE BARRIER', title: '降低使用门槛', statement: ['少一点门槛', '多一种可能'], text: 'AI 的专业能力，不该只属于熟悉技术的人。我们希望把复杂的工具和概念，整理成容易理解的选择，让普通人也能迈出使用 AI 的第一步。' },
  { id: 'needs', en: 'FROM INTENT TO OUTCOME', title: '从单点任务，走向业务闭环', statement: ['连接专业分工', '面向完整交付'], text: '我们希望连接需求理解、专业分工、过程协同与成果交付，让数字员工逐步融入完整的业务链路。让一个好的想法，不止得到一次回答，更拥有持续推进、验证与迭代的路径。' },
  { id: 'teams', en: 'SMALL TEAMS. GREATER POSSIBILITIES.', title: '让小团队，拥有组织级能力', statement: ['精干的团队', '更大的能力半径'], text: '决定团队上限的，不该只有人数。我们期待把研究、创作、运营与专业支持连接成可灵活组合的能力网络，让精干团队也能调动多领域资源，把更多精力投入判断、创新与业务增长。' },
  { id: 'time', en: 'BUILD CAPABILITY THAT COMPOUNDS', title: '让每次协作，沉淀为长期优势', statement: ['积累的不只是成果', '更是下一次的起点'], text: '真正值得建设的，是能够持续积累的组织能力。我们希望让项目中的知识、方法与经验逐步沉淀为可复用的工作资产，让下一次协作站在上一次的成果之上，使效率提升走向长期的竞争优势。' },
];
const fields = [
  { title: '办公与协作', en: 'WORK & COLLABORATION', category: 'office', text: '把重复事务交给数字同事，让日常工作有序发生。', tags: '文档管理 / 会议纪要 / 知识检索', icon: Command },
  { title: '创意与表达', en: 'CONTENT & CREATIVE', category: 'creative', text: '从一个想法，到文字、图像和视频，让灵感成为作品。', tags: '内容创作 / 设计 / 视频制作', icon: AudioLines },
  { title: '数据与研究', en: 'DATA & RESEARCH', category: 'research', text: '连接分散的信息，从数据与来源中，寻找问题的答案。', tags: '信息采集 / 行业研究 / 动态监测', icon: ScanLine },
  { title: '专业与服务', en: 'SPECIALIST & SERVICE', category: 'specialist', text: '从客户沟通到专业辅助，让每一种需求找到合适的能力。', tags: '客户服务 / 财务法务 / 专业助手', icon: Layers3 },
];

function SectionTitle({ children, split }) {
  return <h2 className={`section-title ${split ? 'has-mobile-lines' : ''}`} aria-label={children}>
    <span className="title-desktop"><FuzzyText>{children}</FuzzyText></span>
    {split && <span className="title-mobile">{split.map(line => <FuzzyText key={line}>{line}</FuzzyText>)}</span>}
  </h2>;
}

function Section({ id, index, label, title, split, children, className = '' }) {
  return <section className={`editorial-section ${className}`} id={id}>
    <FluidBackground /><div className="section-shell shell">
      <div className="section-ref" data-reveal><span>{index} / {label}</span></div>
      <SectionTitle split={split}>{title}</SectionTitle>{children}
    </div>
  </section>;
}

function useHomeMotion(ref) {
  useLayoutEffect(() => {
    document.title = '数字超市 DIGITAL MARKET';
    const root = ref.current;
    const controller = new AbortController();
    const sources = collectHomepageImageSources(media);
    root.dataset.homeMediaTotal = String(sources.length);
    root.dataset.homeMediaStatus = 'loading';
    root.dataset.homeMediaProgress = '0%';
    document.documentElement.classList.add('motion-opening');
    const overlay = root.querySelector('.opening-sequence');
    overlay.style.visibility = 'visible';
    const feedback = startLoadingFeedback(root, controller.signal);
    const mediaReady = preloadHomepageImages(sources, {
      signal: controller.signal,
      onProgress: progress => feedback.update(progress),
    });
    const waitForLayout = () => new Promise(resolve => {
      requestAnimationFrame(() => requestAnimationFrame(resolve));
    });
    const resourcesReady = Promise.all([mediaReady, document.fonts.ready]).then(async ([result]) => {
      await waitForLayout();
      if (controller.signal.aborted) return result;
      await feedback.complete();
      if (!controller.signal.aborted) {
        root.dataset.homeMediaStatus = result.failed ? 'ready-with-errors' : 'ready';
        root.dataset.homeMediaFailures = JSON.stringify(result.failures);
        if (window.location.hash || matchMedia('(prefers-reduced-motion: reduce)').matches) {
          overlay.style.visibility = 'hidden';
          document.documentElement.classList.remove('motion-opening');
        }
      }
      return result;
    });
    const context = gsap.context(() => {
      const mm = gsap.matchMedia();
      mm.add('(prefers-reduced-motion: no-preference)', motionContext => {
        let active = true;
        const mobile = innerWidth <= 700;
        const from = (selector, values, trigger = selector) => {
          gsap.from(selector, { autoAlpha: 0, duration: 1.45, ease: 'power3.out', ...values,
            scrollTrigger: { trigger, start: 'top 86%', once: true } });
        };
        if (!window.location.hash) {
          resourcesReady.then(() => {
            if (controller.signal.aborted || !active) return;
            // Register delayed animations with the live matchMedia context.
            motionContext.add(() => {
            document.documentElement.classList.add('motion-opening');
            const openingIndex = root.querySelector('.opening-index');
            if (openingIndex) openingIndex.textContent = 'DIGITAL MARKET / 01';
            const intro = gsap.timeline({ defaults: { ease: 'power3.out' },
              onComplete: () => document.documentElement.classList.remove('motion-opening') });
            intro.set('.opening-sequence', { visibility: 'visible' })
              .to('.opening-brand,.opening-status,.opening-ambient,.opening-scanner', { opacity: 0, duration: .35 }, 0)
              .fromTo('.opening-index', { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: .45 }, .08)
              .to('.opening-line', { scaleX: 1, duration: .45 }, .14)
              .to('.opening-index,.opening-line', { opacity: 0, duration: .25 }, .92)
              .to('.opening-panel', { scaleY: 0, transformOrigin: 'top', duration: 1.55, stagger: .13, ease: 'power4.inOut' }, .94)
              .from('.hero-scene', { clipPath: 'inset(100% 0 0 0)', scale: media.hero.video ? 1 : 1.045, duration: 2.25, ease: 'expo.inOut' }, .95)
              .fromTo(document.querySelector('.site-header'), { opacity: 0, y: -18 }, { opacity: 1, y: 0, duration: 1, clearProps: 'opacity' }, 1.12)
              .from('.hero-profile-top', { y: 35, opacity: 0, duration: .95 }, 1.26)
              .from('.hero-name-lockup', { y: 110, scaleX: .66, opacity: 0, duration: 1.55, ease: 'expo.out', transformOrigin: 'left' }, 1.34)
              .from('.hero-panel-rule', { scaleX: .22, transformOrigin: 'left', opacity: 0, duration: .9 }, 1.66)
              .from('.hero-summary p', { y: 34, opacity: 0, stagger: .13, duration: 1 }, 1.9)
              .fromTo('.hero-works-cta', { x: -18, y: 55, opacity: 0 }, { x: 0, y: 0, opacity: 1, duration: 1.1, clearProps: 'transform' }, 2.12)
              .from('.hero-releases', { y: 70, opacity: 0, clipPath: 'inset(100% 0 0 0)', duration: 1.35 }, 2.2)
              .set('.opening-sequence', { visibility: 'hidden' }, 2.8);
            });
          });
        }
        if (!mobile && !media.hero.video) gsap.to('.hero-scene', { yPercent: 4, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 1.2 } });
        gsap.utils.toArray('.section-title').forEach(title => from(title, { y: mobile ? 92 : 145, scaleX: mobile ? .72 : .62, transformOrigin: 'left', clipPath: 'inset(0 0 100% 0)', duration: 1.65 }));
        from('.portrait-gallery', { y: 110, clipPath: 'inset(0 100% 0 0)', duration: 1.6 });
        from('.about-copy > *', { y: 55, stagger: .11 }, '.about-copy');
        from('.stat', { y: 65, stagger: .18 }, '.stats');
        gsap.utils.toArray('.project-card').forEach(card => {
          from(card, { y: 135, scale: .955, clipPath: 'inset(0 0 100% 0)', duration: 1.55 });
          const image = card.querySelector('.project-media');
          if (image) gsap.fromTo(image, { yPercent: -4 }, { yPercent: 4, ease: 'none', scrollTrigger: { trigger: card, start: 'top bottom', end: 'bottom top', scrub: 1.1 } });
        });
        from('.strength-glow', { y: 105, scaleY: .88, stagger: .17, duration: 1.35 }, '.strength-grid');
        from('.contact-kicker,.contact-statement,.contact-bottom', { y: 86, stagger: .2 }, '.contact-kicker');
        gsap.utils.toArray('.section-ref,.works-intro,.capability-intro').forEach(element => from(element, { y: 32 }));
        return () => {
          active = false;
          if (root.dataset.homeMediaStatus !== 'loading') {
            overlay.style.visibility = 'hidden';
            document.documentElement.classList.remove('motion-opening');
          }
        };
      });
      return () => mm.revert();
    }, ref);
    const refresh = () => { if (!controller.signal.aborted) ScrollTrigger.refresh(); };
    document.fonts.ready.then(refresh);
    window.addEventListener('load', refresh);
    const resizeObserver = new ResizeObserver(refresh);
    resizeObserver.observe(ref.current);
    return () => {
      controller.abort();
      context.revert(); resizeObserver.disconnect(); window.removeEventListener('load', refresh);
      document.documentElement.classList.remove('motion-opening');
    };
  }, [ref]);
}

export default function Home() {
  const ref = useRef(null);
  useHomeMotion(ref);
  return <main id="top" ref={ref}>
    <div className="opening-sequence" aria-hidden="true">
      <div className="opening-panels"><i className="opening-panel" /><i className="opening-panel" /><i className="opening-panel" /></div>
      <div className="opening-ambient"><i /><i /><i /><i /></div>
      <div className="opening-brand"><span>DMKT</span><small>DIGITAL MARKET</small></div>
      <span className="opening-index">LOADING / 0%</span>
      <span className="opening-track"><span className="opening-line" /><span className="opening-scanner" /></span>
      <span className="opening-status">正在连接资源 / CONNECTING</span>
    </div>
    <section className="hero" aria-label="数字超市首页">
      <HeroScene item={media.hero} /><div className="hero-scrim" aria-hidden="true" />
      <div className="hero-stage shell">
        <p className="hero-side-index" aria-hidden="true">DIGITAL MARKET / STOREFRONT / 01</p>
        <div className="hero-profile">
          <div className="hero-profile-top"><p className="hero-disciplines"><span>走进数字超市</span><span>发现工作的更多可能</span></p><p className="hero-profile-index">DIGITAL<br />MARKET / 01</p></div>
          <div className="hero-name-lockup"><h1 aria-label="数字超市 DIGITAL MARKET"><FuzzyText hero>DMKT</FuzzyText></h1><span>数<br />字<br />超<br />市</span></div>
          <div className="hero-panel-rule"><i /><span>HUMAN × INTELLIGENCE</span></div>
          <div className="hero-summary"><p>办公协作 / 内容创作 / 数据研究</p><p>专业助手 / 客户服务 / 财务法务</p><p>把时间留给创造，把可能交给数字同事。</p></div>
          <Link to="/employees" className="hero-works-cta"><strong>SELECTED<br />EMPLOYEES</strong><span>探索员工<ArrowDownRight size={34} strokeWidth={1.35} /></span></Link>
        </div>
        <div className="hero-releases">
          <div className="hero-releases-heading"><strong>精选员工</strong><span>SELECTED EMPLOYEES / 05</span></div>
          <div className="hero-release-grid">{selected.map((employee, index) => <EdgeGlow className="hero-release-glow" edgeSensitivity={18} glowRadius={20} glowIntensity={.62} key={employee.id}><Link to={`/employee/${employee.id}`} className="hero-release-card" aria-label={`查看${employee.title}详情`}><Media item={media.covers[index]} priority /><span><i>0{index + 1}</i><b>{employee.title}</b><ArrowUpRight size={15} /></span></Link></EdgeGlow>)}</div>
          <div className="hero-footer-meta"><Link to="/#about">向下探索 / SCROLL<ArrowDownRight size={15} /></Link><span>PEOPLE / IDEAS / POSSIBILITIES</span></div>
        </div>
      </div>
    </section>
    <Section id="about" index="01" label="ABOUT" title="ABOUT">
      <div className="about-layout"><AboutGallery employees={galleryEmployees} /><div className="about-copy">
        <p className="section-eyebrow">MORE THAN ONE POSSIBILITY</p><h3>从一位同事开始<br />不止一种可能</h3>
        <p className="about-lead">这里是数字超市<br />能力各有所长，协作自有可能。</p>
        <p>从一套图文、一份行程，到一次会议、一张票据，再到网页里的细微变化。不同的工作场景，对应不同的专业能力。</p>
        <p>汇集 {employees.length} 位数字员工，覆盖办公、创作、研究、服务、财务法务与专业辅助。认识他们的能力，也找到与你的工作同频的那一位。</p>
        <div className="employee-shortlist"><p>五种场景，认识五位数字同事</p><div>{galleryEmployees.map(employee => <Link key={employee.id} to={`/employee/${employee.id}`}><span>{employee.title}</span><span className="specular-icon" title="查看详情"><ArrowUpRight size={14} /></span></Link>)}</div></div>
      </div></div>
      <div className="stats"><div className="stat"><strong>{employees.length}<span>位</span></strong><p>各有所长的数字员工</p></div><div className="stat"><strong>06<span>类</span></strong><p>面向不同工作的能力领域</p></div><div className="stat stat-note"><strong>HUMAN IDEAS. DIGITAL POWER.</strong><Link to="/employees">认识你的数字同事<ArrowUpRight size={15} /></Link></div></div>
    </Section>
    <Section id="ceo-workspace" index="02" label="CEO 工作台" title="CEO WORKSPACE" split={['CEO', 'WORKSPACE']}><CeoWorkspace /></Section>
    <Section id="works" index="03" label="OUR PURPOSE" title="WHY WE BUILD" split={['WHY WE', 'BUILD']}>
      <div className="works-intro"><h3>让专业能力<br />不再遥不可及</h3><p>为普通人，也为小团队<br />让 AI 更容易理解、更容易开始</p></div>
      <p className="purpose-intro" data-reveal>数字超市的初衷，是让更多人有机会用上 AI 的专业能力。我们希望从发现、理解到尝试，减少每一步的障碍，让技术更贴近日常需求，让普通人和小团队都能找到适合自己的起点。</p>
      <div className="project-grid purpose-grid">{purposes.map((purpose, index) => <article key={purpose.id} className={`project-card purpose-card project-${index + 1}`} aria-labelledby={`purpose-${purpose.id}`}>
        <EdgeGlow className="project-glow" edgeSensitivity={22} glowRadius={30} glowIntensity={.74}>{media.purposes[index]?.image
          ? <div className="project-image-wrap purpose-image"><Media item={media.purposes[index]} className="project-media" alt={media.purposes[index].alt || purpose.title} /></div>
          : <div className="project-image-wrap purpose-statement"><span className="purpose-number">0{index + 1} / OUR PURPOSE</span><span className="purpose-line">{purpose.statement[0]}<br />{purpose.statement[1]}</span><small>DIGITAL MARKET / WHY WE BUILD</small></div>}
        </EdgeGlow>
        <div className="project-caption"><div><p>{purpose.en}</p><h3 id={`purpose-${purpose.id}`}>{purpose.title}</h3><p className="purpose-copy">{purpose.text}</p></div><i>0{index + 1}</i></div>
      </article>)}</div>
    </Section>
    <Section id="capabilities" index="04" label="CAPABILITIES" title="CAPABILITIES">
      <div className="capability-intro"><h3>让专业能力<br />进入日常工作</h3><p>从一个任务出发<br />找到合适的数字搭档</p></div>
      <div className="strength-grid">{fields.map((field, index) => <EdgeGlow className="strength-glow" glowRadius={26} glowIntensity={.68} key={field.category}><Link to={`/employees?category=${field.category}`} className="strength-card"><div className="strength-top"><field.icon /><span>0{index + 1}</span></div><div><h3>{field.title}</h3><p className="strength-en">{field.en}</p><p className="strength-copy">{field.text}</p></div><p className="strength-tags">{field.tags}<ArrowUpRight size={15} /></p></Link></EdgeGlow>)}</div>
    </Section>
    <Section id="contact" index="05" label="EXPLORE TOGETHER" title="MEET YOUR TEAM" split={['MEET YOUR', 'TEAM']} className="contact-section">
      <p className="contact-kicker">YOUR NEXT COLLEAGUE IS HERE</p><div className="contact-statement"><h3>下一位同事<br />在这里相遇。</h3></div>
      <div className="contact-bottom"><p>{employees.length} 位数字员工，等待与你的工作产生连接。</p><Link to="/employees"><span>探索全部员工</span><strong>进入数字超市<ArrowRight size={20} /></strong></Link></div>
    </Section>
  </main>;
}
