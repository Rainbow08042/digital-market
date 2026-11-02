import { useEffect, useRef } from 'react';
import Media from './Media';

export default function HeroScene({ item }) {
  const ref = useRef(null);

  useEffect(() => {
    const scene = ref.current;
    let visible = true;
    const update = () => {
      scene.classList.toggle('is-paused', !visible || document.hidden);
    };
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      update();
    });
    observer.observe(scene);
    document.addEventListener('visibilitychange', update);
    update();
    return () => {
      observer.disconnect();
      document.removeEventListener('visibilitychange', update);
    };
  }, []);

  return <div className="hero-scene" ref={ref} aria-hidden="true">
    <Media item={item} priority />
  </div>;
}
