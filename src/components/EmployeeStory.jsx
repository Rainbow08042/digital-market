import { useState } from 'react';
import { Image, LoaderCircle } from 'lucide-react';

function StoryImage({ asset }) {
  const [state, setState] = useState('loading');
  return <figure className="detail-story-image" data-state={state}>
    <a className="detail-screen-link" href={asset.src} target="_blank" rel="noreferrer" aria-label="在新标签页查看完整场景图">
      <img src={asset.src} alt={asset.alt} width="1586" height="992" loading="lazy" decoding="async" onLoad={event => {
        event.currentTarget.decode().then(() => setState('ready')).catch(() => setState('error'));
      }} onError={() => setState('error')} />
      {state !== 'ready' && <span className="detail-screen-status">{state === 'loading' ? <><LoaderCircle size={22} aria-hidden="true" />正在加载场景图</> : '图片暂未显示，点击打开原图'}</span>}
    </a>
    <figcaption><span>{asset.caption}</span><a href={asset.src} target="_blank" rel="noreferrer">查看大图</a></figcaption>
  </figure>;
}

function ImagePlaceholder({ brief, label }) {
  return <figure className="detail-image-placeholder">
    <div className="detail-image-space"><Image size={28} strokeWidth={1} aria-hidden="true" /><span>配图待补</span><p>{brief}</p></div>
    <figcaption>{label}</figcaption>
  </figure>;
}

export default function EmployeeStory({ employee, detail }) {
  return <>
    <nav className="detail-chapters" aria-label="详情章节">
      <a href="#overview">岗位价值</a><a href="#scenarios">应用场景</a><a href="#workflow">协作流程</a><a href="#deliverables">交付示例</a><a href="#possibilities">扩展愿景</a>
    </nav>
    <section className="detail-story-section" id="overview" aria-labelledby="overview-title">
      <header><h2 id="overview-title">为什么需要这位同事</h2></header>
      <div className="detail-story-body"><p className="detail-thesis">{detail.headline}</p><p>{detail.problem}</p><p>{detail.value}</p><details className="detail-capability"><summary>查看岗位能力介绍</summary><p>{employee.description}</p></details></div>
    </section>
    <section className="detail-story-section" id="scenarios" aria-labelledby="scenarios-title">
      <header><h2 id="scenarios-title">从这些工作开始</h2><p>选择一个具体场景，让价值看得见。</p></header>
      <div className="detail-story-body detail-scenarios">{detail.scenarios.map(([title, text]) => <article key={title}><h3>{title}</h3><p>{text}</p></article>)}</div>
    </section>
    <section className="detail-story-section" id="workflow" aria-labelledby="workflow-title">
      <header><h2 id="workflow-title">一项工作，如何协作</h2><p>说清输入、处理和确认，才能顺畅交接。</p></header>
      <div className="detail-story-body"><ol className="detail-steps">{detail.steps.map((step, index) => <li key={step}><span aria-hidden="true">0{index + 1}</span><p>{step}</p></li>)}</ol>{detail.imageAssets?.[0] ? <StoryImage key={detail.imageAssets[0].src} asset={detail.imageAssets[0]} /> : <ImagePlaceholder brief={detail.images[0]} label="建议配图：协作流程示意" />}</div>
    </section>
    <section className="detail-story-section" id="deliverables" aria-labelledby="deliverables-title">
      <header><h2 id="deliverables-title">把工作变成可检查的交付</h2><p>用具体材料说明结果，方便接手与复核。</p></header>
      <div className="detail-story-body"><ul className="detail-outputs">{detail.outputs.map(output => <li key={output}>{output}</li>)}</ul><div className="detail-example"><h3>一个场景示例</h3><dl><div><dt>任务</dt><dd>{detail.example[0]}</dd></div><div><dt>交付思路</dt><dd>{detail.example[1]}</dd></div></dl></div>{detail.imageAssets?.[1] ? <StoryImage key={detail.imageAssets[1].src} asset={detail.imageAssets[1]} /> : <ImagePlaceholder brief={detail.images[1]} label="建议配图：交付内容样例" />}</div>
    </section>
    <section className="detail-story-section" id="possibilities" aria-labelledby="possibilities-title">
      <header><h2 id="possibilities-title">从一个岗位，走向更多可能</h2><p>可逐步探索的方向</p></header>
      <div className="detail-story-body"><p className="detail-future">{detail.future}</p></div>
    </section>
  </>;
}
