import type { ProjectIntroSection } from './types'

/** 始终挂在介绍最底部，不随菜单开关隐藏。 */
export const PROJECT_INTRO_STACK: ProjectIntroSection = {
  id: 'stack',
  title: '用到的技术',
  summary: '前端怎么搭、怎么安装、内容和账号数据走哪一层。',
  leaves: [
    {
      title: '前端',
      text: 'Vue 3 + TypeScript。Vite 开发与打包，Vue Router 按模块分路由，界面组件用 Element Plus。',
    },
    {
      title: '安装',
      text: '按 PWA 安装：manifest 和 Service Worker，浏览器里打开后可以装到手机或桌面主屏，和网页共用同一套页面。',
    },
    {
      title: '讲义与导出',
      text: '正文用 Markdown 渲染（marked），展示前用 DOMPurify 过滤。导出 Word 走 docx，版式跟阅读预览对齐。',
    },
    {
      title: '服务端',
      text: '开发时本地 Node 提供登录、讲义目录和 AI 转发。部署用 Cloudflare Pages Functions。接口密钥只放服务端环境变量，不写进前端、不进 Git。',
    },
    {
      title: '数据怎么放',
      text: '公开讲义走服务端；私密讲义仅管理员可见。练习记录、错题、题库正文留在本机或按账号隔离，不作为公开仓库内容提交。',
    },
  ],
}
