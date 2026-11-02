import { useEffect, useRef } from 'react';

export default function Media({ item, alt = '', priority = false, className = '' }) {
  const ref = useRef(null);
  const videoSource = item?.video;
  useEffect(() => {
    if (!videoSource || !ref.current) return;
    const video = ref.current;
    const motion = matchMedia('(prefers-reduced-motion: reduce)');
    let visible = false;
    const update = () => {
      if (visible && !document.hidden && !motion.matches) video.play().catch(() => {});
      else video.pause();
    };
    const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; update(); });
    observer.observe(video);
    motion.addEventListener('change', update);
    document.addEventListener('visibilitychange', update);
    return () => {
      observer.disconnect(); video.pause();
      motion.removeEventListener('change', update);
      document.removeEventListener('visibilitychange', update);
    };
  }, [videoSource]);
  if (!item?.image && !videoSource) {
    return <div className={`media-placeholder ${className}`.trim()} aria-hidden="true" />;
  }
  return videoSource
    ? <video ref={ref} className={className} src={videoSource} poster={item?.image || undefined} muted loop playsInline preload="metadata" aria-label={alt || undefined} />
    : <img className={className} src={item.image} alt={alt} loading={priority ? 'eager' : 'lazy'} fetchPriority={priority ? 'high' : 'auto'} decoding="async" style={item.position ? { objectPosition: item.position } : undefined} />;
}
