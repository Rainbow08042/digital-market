import records from './employees.json';
import { employeeDescriptions } from './employeeDescriptions';

export const categories = [
  { id: 'all', name: '全部员工', en: 'ALL AGENTS', color: '#c8f76b' },
  { id: 'office', name: '办公协作', en: 'WORK & COLLABORATION', color: '#c8f76b', brief: '让日常事务，有序发生。', tags: ['文档管理', '会议纪要', '知识检索'] },
  { id: 'creative', name: '内容创作', en: 'CONTENT & CREATIVE', color: '#c2a2f2', brief: '把每一个灵感，变成作品。', tags: ['视频制作', '图文创作', '翻译配音'] },
  { id: 'research', name: '数据研究', en: 'DATA & RESEARCH', color: '#7cd6ef', brief: '从海量信息中，找到答案。', tags: ['网页采集', '行业研究', '动态监测'] },
  { id: 'service', name: '客户服务', en: 'CUSTOMER EXPERIENCE', color: '#f3a28f', brief: '每一次沟通，都更有温度。', tags: ['智能客服', '客户管理', '多渠道支持'] },
  { id: 'finance', name: '财务法务', en: 'FINANCE & LEGAL', color: '#f2d482', brief: '把复杂信息，整理得清晰。', tags: ['票据提取', '财务分析', '法律研究'] },
  { id: 'specialist', name: '专业助手', en: 'SPECIALIST AGENTS', color: '#99b9fc', brief: '让专业能力，触手可及。', tags: ['教育学习', '医疗记录', '开发辅助'] },
];

// Editorial copy is separate from the retained source records.
export const featuredEmployeeIds = ['employee-35', 'employee-39', 'employee-07', 'employee-18', 'employee-41'];

const display = [
  ['浏览器自动化员工', 'BROWSER USE', 'office', '把重复的网页操作，交给你的数字同事。', ['网页操作', '自然语言', '流程自动化']],
  ['智能网页采集员', 'FIRECRAWL', 'research', '从复杂网页到清晰数据，让信息主动汇聚。', ['网页采集', '结构化数据', 'MCP']],
  ['企业资料管家', 'PAPERLESS-NGX', 'office', '让散落的文件，成为随时可用的知识。', ['资料归档', '全文检索', '标签分类']],
  ['多智能体互动课堂', 'OPENMAIC', 'specialist', '一份学习材料，开启一间互动课堂。', ['互动教学', '课程生成', '数字助教']],
  ['企业知识库员工', 'LLAMAINDEX', 'office', '连接企业知识，让每一个问题都有据可查。', ['知识库', 'RAG 问答', '数据连接']],
  ['AI 会计员工', 'KLAUDIA', 'finance', '从票据到账本，让财务数据更有条理。', ['账本查询', '智能对账', '票据识别']],
  ['企业智能客服', 'AGENTDESK', 'service', '读懂每一个提问，连接知识与服务。', ['知识问答', '人工协同', '工单跟踪']],
  ['网页变化监测员', 'CHANGEDETECTION', 'research', '关键信息一有变化，及时发现。', ['竞品监测', '信息追踪', '变化提醒']],
  ['财务票据处理员', 'DOCUMIND', 'finance', '让每一张票据，转化为可用的数据。', ['票据识别', '字段提取', '财务归档']],
  ['AI 热点观察员', 'AIHOT', 'research', '聚合行业信源，整理值得关注的每日动态。', ['热点聚合', '内容摘要', '行业日报']],
  ['AI 旅行规划师', 'AI TRAVEL AGENT', 'specialist', '从一个目的地，开始一份专属行程。', ['行程规划', '旅行研究', '日历导出']],
  ['视频创意工作流', 'HYPIT', 'creative', '把创意转成可编辑、可复用的视频工作流。', ['视频工作流', '素材生成', '可编辑']],
  ['AI 短视频创作员', 'MONEYPRINTER TURBO', 'creative', '从一句主题，到脚本、字幕与成片。', ['短视频', '自动字幕', '智能配乐']],
  ['网页研究与采集员', 'CRAWL4AI', 'research', '采集、清洗、研究，把网页变成知识。', ['网页研究', '数据清洗', '结构化提取']],
  ['动态网页采集员', 'SCRAPY PLAYWRIGHT', 'research', '深入动态页面，整理需要的信息。', ['动态网页', '批量采集', '浏览器渲染']],
  ['演示文稿设计师', 'PRESENTON', 'creative', '从零散想法，到一份完整的演示。', ['PPT 生成', '模板编辑', '方案汇报']],
  ['保密会议纪要员', 'MEETILY', 'office', '专注当下的讨论，留下清晰的会议记录。', ['本地转写', '会议摘要', '隐私保护']],
  ['行业研究员', 'GPT RESEARCHER', 'research', '从一个问题出发，带回有来源的研究。', ['行业研究', '来源引用', '报告生成']],
  ['金融研究分析师', 'FINROBOT', 'finance', '连接市场数据，辅助专业研究。', ['金融研究', '数据分析', '研究报告']],
  ['个人财务分析师', 'PERSONAL CFO', 'finance', '梳理账单与预算，看清每一笔收支。', ['现金流', '预算分析', '月度报告']],
  ['法律研究助理', 'LAWGLANCE', 'finance', '检索法律文档，整理问题与法源。', ['法律检索', '文档问答', '分析草稿']],
  ['合同与诉讼助理', 'LEGAL ASSISTANT', 'finance', '梳理合同与案件，为专业判断准备资料。', ['合同分析', '法律研究', '文书整理']],
  ['多渠道售后专员', 'AI CUSTOMER SUPPORT', 'service', '连接多个服务渠道，让沟通保持连贯。', ['多渠道', '售后服务', '语义检索']],
  ['招聘协调员', 'CANDISIFT', 'office', '整理简历与岗位，辅助更细致的招聘判断。', ['简历解析', '岗位匹配', '候选人摘要']],
  ['个性化学习导师', 'LLM TUTOR', 'specialist', '围绕你的学习目标，讲解、练习与反馈。', ['个性化学习', '课程辅导', '学习反馈']],
  ['医疗记录助理', 'OPENSCRIBE', 'specialist', '整理临床对话，辅助形成结构化记录。', ['临床记录', '语音转写', '文书草稿']],
  ['临床试验匹配助理', 'TRIALTHREAD', 'specialist', '整理试验信息，为进一步沟通提供线索。', ['试验检索', '条件解析', '匹配说明']],
  ['视频制作与剪辑师', 'OPENMONTAGE', 'creative', '让素材有叙事，让镜头有节奏。', ['智能剪辑', '镜头编排', '视频制作']],
  ['行政运营协作者', 'CHIEF OF STAFF', 'office', '连接研究、会议与沟通，协助日常协作。', ['行政协作', '邮件草稿', '会议整理']],
  ['翻译与本地化编辑', 'TRANSLATION AGENT', 'creative', '跨越语言，也保留表达的细节。', ['多语翻译', '术语一致', '风格修订']],
  ['社交媒体运营员', 'SOCIAL MEDIA AGENT', 'creative', '把品牌信息，变成适合每个平台的表达。', ['社媒文案', '内容改写', '排期草稿']],
  ['视频翻译与配音员', 'PYVIDEOTRANS', 'creative', '为视频添加另一种语言的声音。', ['视频翻译', '字幕制作', '智能配音']],
  ['长视频切片员', 'AUTOCLIP', 'creative', '发现长视频里的亮点，整理成短内容。', ['内容切片', '竖屏适配', '发布文案']],
  ['小红书图文创作员', 'REDINK', 'creative', '从主题大纲，到完整的图文作品。', ['图文生成', '封面设计', '内容大纲']],
  ['AI 销售客户管理员', 'TWENTY', 'service', '整理客户、商机与跟进，让关系更有序。', ['客户管理', '商机跟进', '销售提醒']],
  ['代码执行员工', 'OPEN INTERPRETER', 'specialist', '把任务转成代码，辅助处理数据与文件。', ['代码执行', '数据处理', '自动化脚本']],
  ['电脑操作员工', 'OPENADAPT', 'office', '连接桌面应用，协助重复的办公操作。', ['桌面操作', '任务规划', '文件处理']],
  ['智行中枢', 'WORKBUDDY', 'office', '让 AI 能够行动，让组织有序管理。', ['组织协作', '行动授权', '智能体管理']],
  ['经营分析员', 'BUSINESS ANALYST', 'research', '汇总经营日报，发现变化，跟进每一项异常。', ['经营日报', '门店分析', '异常跟踪']],
  ['网站安全分析师', 'WEBSITE SECURITY ANALYST', 'specialist', '从授权检查到整改复测，让安全问题有据可查。', ['授权检测', '风险梳理', '整改复测']],
  ['采购比价员', 'PROCUREMENT ANALYST', 'office', '对齐供应商报价，让每一次采购比较都有依据。', ['供应商询价', '采购比价', '条款核对']],
];

function repositoryUrl(raw) {
  // Only already well-formed HTTPS GitHub links are activated.
  try {
    const url = new URL(raw);
    return url.protocol === 'https:' && url.hostname === 'github.com' ? url.href : null;
  } catch {
    return null;
  }
}

export const employees = records.map((record, index) => {
  const [title, english, category, summary, tags] = display[index];
  return {
    ...record, title, english, category, summary, tags,
    description: employeeDescriptions[record.id] || record.description,
    number: String(index + 1).padStart(2, '0'),
    color: categories.find(c => c.id === category).color,
    image: null,
    repository: repositoryUrl(record.sourceRepository),
    featured: featuredEmployeeIds.includes(record.id),
  };
});

export const featuredEmployees = featuredEmployeeIds.map(id => employees.find(employee => employee.id === id));
