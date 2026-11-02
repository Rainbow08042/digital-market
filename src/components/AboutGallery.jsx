import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import { media } from '../data/media';

export default function AboutGallery({ employees }) {
  const [active, setActive] = useState(0);
  const refs = useRef([]);
  const selected = employees[active];

  const keydown = (event, index) => {
    let target;
    if (['ArrowRight', 'ArrowDown'].includes(event.key)) target = (index + 1) % employees.length;
    if (['ArrowLeft', 'ArrowUp'].includes(event.key)) target = (index + employees.length - 1) % employees.length;
    if (event.key === 'Home') target = 0;
    if (event.key === 'End') target = employees.length - 1;
    if (target !== undefined) {
      event.preventDefault(); setActive(target); refs.current[target]?.focus();
    }
  };
  return <div className="portrait-gallery portrait-gallery--ui" data-reveal>
    <div className="portrait-accordion" role="group" aria-label="数字同事画廊">
      {employees.map((employee, index) => {
        const item = media.portraits[index];
        return <button key={employee.id} ref={node => { refs.current[index] = node; }}
          className={`portrait-panel ${active === index ? 'is-active' : ''} ${item.kind === 'concept' ? 'is-concept' : ''}`}
          aria-label={`展开${employee.title}`} aria-pressed={active === index}
          onPointerEnter={() => { if (matchMedia('(hover:hover)').matches) setActive(index); }}
          onFocus={() => setActive(index)} onClick={() => setActive(index)}
          onKeyDown={event => keydown(event, index)} style={{ flexBasis: active === index ? '52%' : '12%' }}>
          <span className="portrait-presentation">
            <span className="portrait-result-window">
              <img src={item.image} alt={`${employee.title}${item.kind === 'concept' ? '工作场景概念图' : '完整工作台界面概念演示'}`} loading="lazy" decoding="async" />
            </span>
          </span>
        </button>;
      })}
    </div>
    <div className="portrait-meta"><span>DIGITAL MARKET / {selected.english}</span><span>0{active + 1} / 05</span></div>
    <div className="portrait-actions">
      <Link className="portrait-detail" to={`/employee/${selected.id}`}>{selected.title}<ArrowUpRight size={16} /></Link>
    </div>
    <p className="portrait-concept-note">{selected.summary} · 工作场景概念图</p>
  </div>;
}
