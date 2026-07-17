<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  createWenguMember,
  deleteWenguMember,
  fetchWenguMembers,
  getWenguUser,
  isWenguAdmin,
  isWenguLoggedIn,
  loginWengu,
  logoutWengu,
  probeWenguAuthServer,
  resetWenguMemberPassword,
  setWenguMemberEnabled,
  type WenguMemberUser,
  type WenguServerProbe,
  wenguAuthTick,
} from '@/utils/wenguAuthStore'
import {
  describeWenguApiTarget,
  getBuildTimeWenguApiOrigin,
  getWenguApiOrigin,
  setWenguApiOriginOverride,
} from '@/utils/wenguApiOrigin'
import AiProviderSwitch from '@/components/AiProviderSwitch.vue'

const serverProbe = ref<WenguServerProbe | null>(null)
const probingServer = ref(false)
const showAdvancedApi = ref(false)
const apiOriginDraft = ref(getWenguApiOrigin())
const apiOriginTick = ref(0)
const locationOrigin = typeof location !== 'undefined' ? location.origin : ''
const isCloudflarePagesHost = locationOrigin.includes('pages.dev')
const currentApiTarget = computed(() => {
  void apiOriginTick.value
  return describeWenguApiTarget()
})

const username = ref('')
const password = ref('')
const loggingIn = ref(false)
const showPassword = ref(false)

const members = ref<WenguMemberUser[]>([])
const membersLoading = ref(false)
const newMemberName = ref('')
const newMemberPassword = ref('')

const currentUser = computed(() => {
  void wenguAuthTick.value
  return getWenguUser()
})

const loggedIn = computed(() => {
  void wenguAuthTick.value
  return isWenguLoggedIn()
})

const isAdmin = computed(() => {
  void wenguAuthTick.value
  return isWenguAdmin()
})

async function refreshServerProbe() {
  probingServer.value = true
  try {
    serverProbe.value = await probeWenguAuthServer()
  } finally {
    probingServer.value = false
  }
}

function onSaveApiOrigin() {
  const raw = apiOriginDraft.value.trim().replace(/\/$/, '')
  if (raw && !/^https?:\/\//i.test(raw)) {
    ElMessage.warning('请填写完整地址，例如 https://abc.trycloudflare.com')
    return
  }
  if (/xxxx\.trycloudflare\.com/i.test(raw)) {
    ElMessage.error('这是示例占位地址，请换成电脑终端里打印的真实隧道地址')
    return
  }
  setWenguApiOriginOverride(raw || null)
  apiOriginTick.value += 1
  ElMessage.success(raw ? `已保存 API 地址：${raw}` : '已改回默认（同源/构建配置）')
  void refreshServerProbe()
}

function onClearApiOrigin() {
  apiOriginDraft.value = getBuildTimeWenguApiOrigin()
  setWenguApiOriginOverride(null)
  apiOriginTick.value += 1
  void refreshServerProbe()
}

async function onLogin() {
  const u = username.value.trim()
  const p = password.value
  if (!u || !p) {
    ElMessage.warning('请输入用户名和密码')
    return
  }
  if (!serverProbe.value?.ok) {
    await refreshServerProbe()
    if (!serverProbe.value?.ok) {
      ElMessage.error(serverProbe.value?.message ?? '无法连接登录服务')
      return
    }
  }
  loggingIn.value = true
  try {
    const user = await loginWengu(u, p)
    password.value = ''
    ElMessage.success(`已登录：${user.username}${user.role === 'admin' ? '（管理员）' : ''}`)
    if (user.role === 'admin') void loadMembers()
  } catch (e) {
    ElMessage.error(e instanceof Error ? e.message : '登录失败')
  } finally {
    loggingIn.value = false
  }
}

async function onLogout() {
  try {
    await ElMessageBox.confirm('退出后语文 AI 功能将不可用，确定退出？', '退出登录', {
      type: 'warning',
      confirmButtonText: '退出',
      cancelButtonText: '取消',
    })
  } catch {
    return
  }
  await logoutWengu()
  username.value = ''
  password.value = ''
  members.value = []
  ElMessage.success('已退出登录')
}

async function loadMembers() {
  if (!isAdmin.value) return
  membersLoading.value = true
  try {
    members.value = await fetchWenguMembers()
  } catch (e) {
    ElMessage.error(e instanceof Error ? e.message : '加载用户失败')
  } finally {
    membersLoading.value = false
  }
}

async function onCreateMember() {
  const name = newMemberName.value.trim()
  const pass = newMemberPassword.value
  if (!name || !pass) {
    ElMessage.warning('请填写新成员用户名和密码')
    return
  }
  try {
    await createWenguMember(name, pass)
    newMemberName.value = ''
    newMemberPassword.value = ''
    ElMessage.success(`已创建成员：${name}`)
    await loadMembers()
  } catch (e) {
    ElMessage.error(e instanceof Error ? e.message : '创建失败')
  }
}

async function onToggleMember(row: WenguMemberUser) {
  try {
    await setWenguMemberEnabled(row.username, !row.enabled)
    ElMessage.success(row.enabled ? '已禁用' : '已启用')
    await loadMembers()
  } catch (e) {
    ElMessage.error(e instanceof Error ? e.message : '操作失败')
  }
}

async function onResetMember(row: WenguMemberUser) {
  try {
    const { value } = await ElMessageBox.prompt(`为「${row.username}」设置新密码`, '重置密码', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      inputType: 'password',
      inputValidator: (v) => (v && v.length >= 6 ? true : '密码至少 6 位'),
    })
    await resetWenguMemberPassword(row.username, value)
    ElMessage.success('密码已重置')
  } catch {
    /* cancelled */
  }
}

async function onDeleteMember(row: WenguMemberUser) {
  try {
    await ElMessageBox.confirm(`确定删除成员「${row.username}」？`, '删除成员', {
      type: 'warning',
      confirmButtonText: '删除',
      cancelButtonText: '取消',
    })
  } catch {
    return
  }
  try {
    await deleteWenguMember(row.username)
    ElMessage.success('已删除')
    await loadMembers()
  } catch (e) {
    ElMessage.error(e instanceof Error ? e.message : '删除失败')
  }
}

onMounted(() => {
  // 公网：清掉以前填的隧道地址，强制同源 Functions
  if (isCloudflarePagesHost) {
    setWenguApiOriginOverride(null)
    apiOriginDraft.value = ''
    apiOriginTick.value += 1
  }
  void refreshServerProbe()
  if (isAdmin.value) void loadMembers()
})
</script>

<template>
  <section class="mode-section wengu-auth" id="practice-deepseek-auth" aria-label="语文 AI 登录">
    <h3 class="mode-section__title">语文 AI 登录</h3>
    <p class="mode-section__hint">
      口算无需登录。语文 AI 在此登录即可。
      <strong>公网推荐</strong>：家人打开同一个 <code>pages.dev</code> 地址，登录后出门也能用（云端服务，无需开家里电脑、无需填隧道）。
      管理员账号与电脑端相同（Cloudflare Secrets / <code>server/.env</code>）。
    </p>
    <p class="mode-section__hint wengu-auth__risk">
      本工具仅家庭可信人员使用；请在 DeepSeek / 火山方舟后台设置调用限额。
      模型可在下方手动切换（默认 DeepSeek，不自动降级）。
    </p>

    <AiProviderSwitch />

    <div
      v-if="serverProbe"
      class="install-card"
      :class="serverProbe.ok ? 'install-card--ok' : 'install-card--warn'"
    >
      <p class="install-card__title">服务状态</p>
      <p class="install-card__text">{{ serverProbe.message }}</p>
      <p v-if="!serverProbe.ok" class="install-card__text wengu-auth__note">
        <template v-if="isCloudflarePagesHost">
          你电脑上的 <code>server/.env</code> <strong>不会</strong>自动带到公网站点。
          请在本机执行 <code>npm run sync:cf-secrets</code>（需先 <code>npx wrangler login</code>），
          或到 Cloudflare Pages → Settings → Variables and secrets 手动添加：
          <code>DEEPSEEK_API_KEY</code>、<code>DOUBAO_API_KEY</code>、<code>DOUBAO_MODEL_ID</code>、
          <code>WENGU_ADMIN_PASSWORD</code>，然后重新部署。
          手机请强制刷新或清缓存后再打开。
        </template>
        <template v-else>
          本地请运行 <code>npm run serve:install</code>；公网请配置 Cloudflare Secrets。
        </template>
      </p>
      <el-button size="small" :loading="probingServer" @click="refreshServerProbe">重新检测</el-button>
      <el-button size="small" text type="primary" @click="showAdvancedApi = !showAdvancedApi">
        {{ showAdvancedApi ? '收起高级选项' : '高级：自定义 API 地址' }}
      </el-button>
    </div>

    <div v-if="showAdvancedApi" class="install-card">
      <p class="install-card__title">自定义 API（一般不需要）</p>
      <p class="install-card__text">
        默认已同源调用本站服务。仅在特殊调试时填写其他地址。
      </p>
      <div class="wengu-auth__form" style="margin-top: 10px">
        <el-input
          v-model="apiOriginDraft"
          clearable
          placeholder="留空 = 本站同源"
          @keydown.enter.prevent="onSaveApiOrigin"
        />
        <div class="wengu-auth__member-actions">
          <el-button type="primary" size="small" @click="onSaveApiOrigin">保存并检测</el-button>
          <el-button size="small" @click="onClearApiOrigin">清除</el-button>
        </div>
        <p class="install-card__text wengu-auth__note">当前目标：<code>{{ currentApiTarget }}</code></p>
      </div>
    </div>

    <div v-if="loggedIn && currentUser" class="install-card install-card--ok">
      <p class="install-card__title">已登录</p>
      <p class="install-card__text">
        当前用户：<code>{{ currentUser.username }}</code>
        <span v-if="currentUser.role === 'admin'">（管理员）</span>
      </p>
      <div class="wengu-auth__actions">
        <el-button type="danger" plain size="small" @click="onLogout">退出登录</el-button>
      </div>
    </div>

    <div v-else class="install-card">
      <p class="install-card__title">登录</p>
      <div class="wengu-auth__form">
        <el-input
          v-model="username"
          autocomplete="username"
          placeholder="用户名"
          clearable
          @keydown.enter.prevent="onLogin"
        />
        <el-input
          v-model="password"
          :type="showPassword ? 'text' : 'password'"
          autocomplete="current-password"
          placeholder="密码"
          clearable
          @keydown.enter.prevent="onLogin"
        >
          <template #append>
            <el-button @click="showPassword = !showPassword">{{ showPassword ? '隐藏' : '显示' }}</el-button>
          </template>
        </el-input>
        <el-button type="primary" :loading="loggingIn" :disabled="!username.trim() || !password" @click="onLogin">
          登录
        </el-button>
      </div>
      <p class="install-card__text wengu-auth__note">
        <template v-if="loggedIn && currentUser?.role === 'admin'">
          管理员登录保存在本机 localStorage，有效期约 7 天，关标签后无需重登。
        </template>
        <template v-else>
          成员登录保存在 sessionStorage（关标签即失效，约 2 小时过期）；离开语文练习区也会自动清除。
        </template>
        禁用成员后其旧 Token 立即失效。
      </p>
    </div>

    <div v-if="loggedIn && isAdmin" class="install-card wengu-auth__admin">
      <p class="install-card__title">成员管理（管理员）</p>
      <p class="install-card__text">为家人/学员创建账号；被禁用的账号无法登录。</p>

      <div class="wengu-auth__form wengu-auth__form--inline">
        <el-input v-model="newMemberName" placeholder="新用户名" clearable />
        <el-input
          v-model="newMemberPassword"
          type="password"
          placeholder="初始密码（≥6 位）"
          clearable
          show-password
        />
        <el-button type="primary" plain @click="onCreateMember">添加成员</el-button>
        <el-button :loading="membersLoading" @click="loadMembers">刷新</el-button>
      </div>

      <div v-if="members.length" class="wengu-auth__member-list">
        <div v-for="row in members" :key="row.username" class="wengu-auth__member-row">
          <span>
            <code>{{ row.username }}</code>
            <span v-if="!row.enabled" class="wengu-auth__disabled-tag">已禁用</span>
          </span>
          <span class="wengu-auth__member-actions">
            <el-button size="small" link type="primary" @click="onToggleMember(row)">
              {{ row.enabled ? '禁用' : '启用' }}
            </el-button>
            <el-button size="small" link type="primary" @click="onResetMember(row)">重置密码</el-button>
            <el-button size="small" link type="danger" @click="onDeleteMember(row)">删除</el-button>
          </span>
        </div>
      </div>
      <p v-else-if="!membersLoading" class="install-card__text">暂无成员，可上方添加。</p>
    </div>
  </section>
</template>

<style scoped>
.wengu-auth {
  margin-top: 8px;
}

.wengu-auth__risk {
  margin-top: 8px;
  color: var(--el-color-warning);
}

.install-card {
  margin-top: 14px;
  padding: 14px 16px;
  border: 1px solid var(--app-border-soft);
  border-radius: 12px;
  background: var(--app-surface-alt);
}

.install-card--ok {
  border-color: color-mix(in srgb, var(--el-color-success) 40%, var(--app-border-soft));
  background: color-mix(in srgb, var(--el-color-success-light-9) 45%, transparent);
}

.install-card--warn {
  border-color: color-mix(in srgb, var(--el-color-warning) 45%, var(--app-border-soft));
  background: color-mix(in srgb, var(--el-color-warning-light-9) 40%, transparent);
}

.install-card__title {
  margin: 0 0 8px;
  font-size: 15px;
  font-weight: 700;
}

.install-card__text {
  margin: 0;
  font-size: 13px;
  line-height: 1.55;
  color: var(--app-text-muted);
}

.wengu-auth__form {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.wengu-auth__form--inline {
  margin-top: 12px;
}

.wengu-auth__actions {
  margin-top: 10px;
}

.wengu-auth__note {
  margin-top: 10px;
}

.wengu-auth__member-list {
  margin-top: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.wengu-auth__member-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 8px 10px;
  border-radius: 8px;
  background: color-mix(in srgb, var(--app-surface) 70%, transparent);
  font-size: 13px;
}

.wengu-auth__member-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.wengu-auth__disabled-tag {
  margin-left: 8px;
  color: var(--el-color-danger);
  font-size: 12px;
}
</style>
