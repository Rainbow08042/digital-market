import { ArrowDown, ArrowUpRight, BarChart3, Building2, Factory, FileCheck2, Monitor, Smartphone } from 'lucide-react';
import { Link } from 'react-router-dom';
import './CeoWorkspace.css';

const sources = [
  { title: '业务信息', icon: BarChart3, items: ['销售与回款', '财务与现金流', '采购与库存'] },
  { title: '组织信息', icon: Building2, items: ['部门与人员', '项目进展', '跨部门协作'] },
  { title: '生产信息', icon: Factory, items: ['排产与进度', '质量与设备', '交付动态'] },
];

export default function CeoWorkspace() {
  return <div className="ceo-workspace">
    <div className="ceo-intro"><div><p className="section-eyebrow">ONE VIEW. INFORMED DECISIONS.</p><h3>一处看全局，<br />随时掌握企业运转。</h3></div><p>连接业务、组织与生产信息，<br />让分散的部门汇报，成为有来源、可追踪的经营全景。<br /><span>电脑看全局，手机掌握重点。</span></p></div>
    <div className="ceo-sources">{sources.map(({ title, icon: Icon, items }, index) => <article key={title}><div className="ceo-source-heading"><Icon size={23} strokeWidth={1.4} /><span>0{index + 1} / INPUT</span></div><h4>{title}</h4><ul>{items.map(item => <li key={item}>{item}</li>)}</ul></article>)}</div>
    <div className="ceo-processing"><span className="ceo-flow-arrow"><ArrowDown size={20} /></span><p>智能体协作处理</p><ol>{['实时采集', '关联核对', '自动总结', '跨部门汇总'].map((step, index) => <li key={step}><span>0{index + 1}</span>{step}</li>)}</ol><span className="ceo-flow-arrow"><ArrowDown size={20} /></span></div>
    <div className="ceo-views">
      <article className="ceo-desktop"><header><Monitor size={18} /><span>电脑端 / 企业经营全景</span><small>来源可查 · 更新时间保留</small></header><div className="ceo-desktop-body"><aside><b>CEO 工作台</b><span className="is-active">经营全景</span><span>部门与生产</span><span>重点事项</span><span>信息来源</span></aside><div className="ceo-overview"><div className="ceo-overview-heading"><h4>企业经营全景</h4><span>从全局，到每一项依据</span></div><div className="ceo-view-modules"><div><BarChart3 size={22} /><h5>经营摘要</h5><p>销售、回款与现金流<br />关键变化与异常线索</p></div><div><Factory size={22} /><h5>部门与生产动态</h5><p>项目、排产与交付进展<br />跨部门事项协同</p></div></div><div className="ceo-evidence"><FileCheck2 size={23} /><div><h5>重点事项与来源</h5><p>事项 → 来源记录 → 更新时点 → 复核负责人</p></div></div></div></div></article>
      <article className="ceo-mobile"><header><Smartphone size={18} /><span>手机端</span></header><div className="ceo-phone"><div className="ceo-phone-camera" /><p>CEO 工作台</p><h4>经营重点，<br />随时在手。</h4><ul><li>同步经营摘要<span>掌握关键变化</span></li><li>随时查看全局<span>连接部门与生产动态</span></li><li>重要事项直达<span>查看来源，跟进复核</span></li></ul></div></article>
    </div>
    <div className="ceo-responsibilities"><p><strong>FDE 部署</strong><span>连接业务、组织与生产系统，配置数据口径、访问权限和同步规则。</span></p><p><strong>人工职责</strong><span>员工复核异常，负责人跟进事项，CEO 决定经营动作。</span></p></div>
    <div className="ceo-footer"><p>让信息少一层转述，让判断多一份依据。</p><Link to="/employees">认识参与协作的数字员工<ArrowUpRight size={18} /></Link></div>
    <a className="text-link" href="/ceo-workspace/CEO工作台.html">进入 CEO 工作台<ArrowUpRight size={18} /></a>
  </div>;
}

