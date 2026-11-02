// Approved project artwork; unfinished modules retain empty media slots.
const artwork = '/media/digital-market/';
const emptyMedia = { image: null, video: null };
export const media = {
  hero: { image: '/media/digital-market/storefront.webp', video: '/media/digital-market/storefront-loop-v1.mp4', position: '60% 50%' },
  covers: [
    'employee-35-sales-crm-v1.webp', 'employee-39-business-analysis-v3.webp',
    'cover-04-enterprise-support.webp', 'cover-03-industry-researcher.webp',
    'employee-41-procurement-comparison-v3.webp',
  ].map(image => ({ image: artwork + image, video: null })),
  // Replace individual paths here when revised ABOUT artwork is approved.
  portraits: [
    'employee-34-social-image-stories-v2.webp', 'employee-11-travel-planner-v1.webp',
    'employee-17-private-meeting-v1.webp', 'employee-09-invoice-processing-v1.webp',
    'employee-08-change-monitoring-v1.webp',
  ].map(image => ({ image: artwork + image, kind: 'concept', video: null })),
  projects: Array.from({ length: 4 }, () => ({ ...emptyMedia })),
  purposes: [
    { image: artwork + 'purpose-01-access-v1.webp', video: null, alt: '一位普通来访者走向开放的 DMKT 入口，表达降低 AI 使用门槛的项目初衷' },
    { image: artwork + 'purpose-02-outcome-orchestration-v2.webp', video: null, alt: '企业项目工作台将需求规划、过程协同与模型成果连接起来，表达走向完整业务交付的愿景' },
    { image: artwork + 'purpose-03-elastic-organization-v2.webp', video: null, alt: '精干团队在连接打样、研究与内容制作的协作空间中讨论项目，表达组织级能力支持的愿景' },
    { image: artwork + 'purpose-04-compounding-capability-v4.webp', video: null, alt: '项目档案、方法手册与模型围绕知识工作台逐层展开，表达将协作经验沉淀为长期工作资产的愿景' },
  ],
  employees: {
    'employee-39': { image: artwork + 'employee-39-business-analysis-v3.webp', video: null },
    'employee-40': { image: artwork + 'employee-40-website-security-v3.webp', video: null },
    'employee-41': { image: artwork + 'employee-41-procurement-comparison-v3.webp', video: null },
    'employee-02': { image: artwork + 'employee-02-web-extraction-v1.webp', video: null },
    'employee-08': { image: artwork + 'employee-08-change-monitoring-v1.webp', video: null },
    'employee-10': { image: artwork + 'employee-10-news-observer-v1.webp', video: null },
    'employee-14': { image: artwork + 'employee-14-web-research-v1.webp', video: null },
    'employee-15': { image: artwork + 'employee-15-dynamic-web-crawler-v1.webp', video: null },
    'employee-06': { image: artwork + 'employee-06-accountant-v1.webp', video: null },
    'employee-09': { image: artwork + 'employee-09-invoice-processing-v1.webp', video: null },
    'employee-19': { image: artwork + 'employee-19-financial-research-v1.webp', video: null },
    'employee-20': { image: artwork + 'employee-20-personal-finance-v1.webp', video: null },
    'employee-21': { image: artwork + 'employee-21-legal-research-v1.webp', video: null },
    'employee-22': { image: artwork + 'employee-22-contract-litigation-v1.webp', video: null },
    'employee-23': { image: artwork + 'employee-23-after-sales-v1.webp', video: null },
    'employee-35': { image: artwork + 'employee-35-sales-crm-v1.webp', video: null },
    'employee-04': { image: artwork + 'employee-04-interactive-classroom-v1.webp', video: null },
    'employee-11': { image: artwork + 'employee-11-travel-planner-v1.webp', video: null },
    'employee-25': { image: artwork + 'employee-25-learning-tutor-v1.webp', video: null },
    'employee-26': { image: artwork + 'employee-26-medical-notes-v1.webp', video: null },
    'employee-27': { image: artwork + 'employee-27-clinical-trials-v1.webp', video: null },
    'employee-36': { image: artwork + 'employee-36-code-executor-v1.webp', video: null },
    'employee-07': { image: artwork + 'cover-04-enterprise-support.webp', video: null },
    'employee-18': { image: artwork + 'cover-03-industry-researcher.webp', video: null },
    'employee-12': { image: artwork + 'employee-12-video-workflow-v1.webp', video: null },
    'employee-13': { image: artwork + 'employee-13-short-video-creator-v1.webp', video: null },
    'employee-30': { image: artwork + 'employee-30-translation-localization-v1.webp', video: null },
    'employee-31': { image: artwork + 'employee-31-social-media-operations-v1.webp', video: null },
    'employee-32': { image: artwork + 'employee-32-video-dubbing-v1.webp', video: null },
    'employee-33': { image: artwork + 'employee-33-long-video-clips-v1.webp', video: null },
    'employee-34': { image: artwork + 'employee-34-social-image-stories-v2.webp', video: null },
    'employee-16': { image: artwork + 'cover-02-presentation-designer.webp', video: null },
    'employee-28': { image: artwork + 'cover-05-video-editor.webp', video: null },
    'employee-01': { image: artwork + 'cover-01-browser-automation.webp', video: null },
    'employee-03': { image: artwork + 'employee-03-document-archivist-v1.webp', video: null },
    'employee-05': { image: artwork + 'employee-05-knowledge-assistant-v1.webp', video: null },
    'employee-17': { image: artwork + 'employee-17-private-meeting-v1.webp', video: null },
    'employee-24': { image: artwork + 'employee-24-recruitment-v1.webp', video: null },
    'employee-29': { image: artwork + 'employee-29-administrative-operations-v1.webp', video: null },
    'employee-37': { image: artwork + 'employee-37-desktop-operator-v1.webp', video: null },
    'employee-38': { image: artwork + 'employee-38-organization-command-v1.webp', video: null },
  },
};

export function employeeMedia(employee) {
  return media.employees[employee.id] || emptyMedia;
}
