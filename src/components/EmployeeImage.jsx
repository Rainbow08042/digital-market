import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { LoaderCircle, RotateCcw } from 'lucide-react';
import Media from './Media';

function ImageAttempt({ source, employee, onRetry, children }) {
  const imageRef = useRef(null), artRef = useRef(null);
  const [state, setState] = useState('loading');
  useEffect(() => {
    const image = imageRef.current;
    let disposed = false;
    const failed = () => { if (!disposed) setState('error'); };
    const loaded = async () => {
      try {
        await image.decode();
        if (!disposed) setState('ready');
      } catch { failed(); }
    };
    image.addEventListener('load', loaded);
    image.addEventListener('error', failed);
    if (image.complete) {
      if (image.naturalWidth) loaded();
      else failed();
    }
    return () => {
      disposed = true;
      image.removeEventListener('load', loaded);
      image.removeEventListener('error', failed);
    };
  }, [source]);
  useEffect(() => {
    if (state !== 'loading') return;
    const art = artRef.current;
    let visible = false;
    const update = () => { art.dataset.imageActive = String(visible && !document.hidden); };
    const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; update(); });
    observer.observe(art);
    document.addEventListener('visibilitychange', update);
    return () => { observer.disconnect(); document.removeEventListener('visibilitychange', update); };
  }, [state]);
  return <div className="employee-art" ref={artRef} data-image-state={state} aria-busy={state === 'loading'}>
    <Link className="employee-image-link" to={`/employee/${employee.id}`} tabIndex={-1} aria-hidden="true">
      <img ref={imageRef} src={source} alt="" loading="lazy" decoding="async" />
    </Link>
    {state === 'loading' && <div className="employee-image-loading" aria-hidden="true">
      <span className="employee-image-scan" />
      <span className="employee-image-indicator"><LoaderCircle size={20} /><small>正在加载图片</small></span>
    </div>}
    {state === 'error' && <div className="employee-image-error">
      <span>图片暂未加载成功</span>
      <button type="button" onClick={onRetry} aria-label="重试加载图片"><RotateCcw size={14} />重试</button>
    </div>}
    {children}
  </div>;
}

export default function EmployeeImage({ item, employee, children }) {
  const [attempt, setAttempt] = useState(0);
  if (!item?.image || item.video) return <div className="employee-art">
    <Link className="employee-image-link" to={`/employee/${employee.id}`} tabIndex={-1} aria-hidden="true"><Media item={item} /></Link>
    {children}
  </div>;
  const source = attempt ? `${item.image}${item.image.includes('?') ? '&' : '?'}retry=${attempt}` : item.image;
  const retry = event => {
    if (document.activeElement === event.currentTarget) {
      event.currentTarget.closest('.employee-card')?.querySelector('.employee-copy')?.focus({ preventScroll: true });
    }
    setAttempt(value => value + 1);
  };
  return <ImageAttempt key={source} source={source} employee={employee} onRetry={retry}>
    {children}
  </ImageAttempt>;
}
