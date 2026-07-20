<script setup lang="ts">
import type { ProbabilityDiagramPreset } from '@/utils/probabilityPractice'

defineProps<{
  preset: ProbabilityDiagramPreset
  caption?: string
}>()
</script>

<template>
  <div class="prob-geo">
    <!-- 经典真题 3：非对称到达 -->
    <svg
      v-if="preset === 'courier-wait'"
      class="prob-geo__svg"
      viewBox="0 0 240 200"
      role="img"
      aria-label="几何概率坐标示意图"
    >
      <!-- 坐标轴 -->
      <line x1="40" y1="170" x2="210" y2="170" stroke="#334155" stroke-width="1.5" />
      <line x1="40" y1="170" x2="40" y2="15" stroke="#334155" stroke-width="1.5" />
      <polygon points="210,170 202,166 202,174" fill="#334155" />
      <polygon points="40,15 36,23 44,23" fill="#334155" />
      <!-- 样本矩形 -->
      <rect x="40" y="40" width="150" height="75" fill="#e2e8f0" opacity="0.5" stroke="#94a3b8" />
      <!-- 失败阴影 -->
      <polygon points="40,40 40,115 95,115 190,40" fill="#f59e0b" opacity="0.5" />
      <line
        x1="40"
        y1="115"
        x2="190"
        y2="40"
        stroke="#0f766e"
        stroke-width="2"
        stroke-dasharray="5 3"
      />
      <text x="145" y="32" text-anchor="middle" font-size="11" fill="#0f766e">y = x + w</text>
      <text x="95" y="75" text-anchor="middle" font-size="12" fill="#9a3412" font-weight="700">
        阴影：失败
      </text>
      <text x="115" y="145" text-anchor="middle" font-size="11" fill="#475569">样本矩形</text>
      <text x="205" y="185" font-size="11" fill="#334155">x 送达</text>
      <text x="8" y="25" font-size="11" fill="#334155">y</text>
      <text x="8" y="100" font-size="11" fill="#334155">到家</text>
      <text x="36" y="185" font-size="10" fill="#64748b">0</text>
    </svg>

    <!-- 对称会面 -->
    <svg
      v-else-if="preset === 'meet-square'"
      class="prob-geo__svg"
      viewBox="0 0 220 220"
      role="img"
    >
      <line x1="35" y1="185" x2="195" y2="185" stroke="#334155" stroke-width="1.5" />
      <line x1="35" y1="185" x2="35" y2="25" stroke="#334155" stroke-width="1.5" />
      <rect x="45" y="45" width="130" height="130" fill="#f8fafc" stroke="#94a3b8" stroke-width="1.5" />
      <polygon
        points="45,45 45,85 95,175 175,175 175,135 85,45"
        fill="#0d9488"
        opacity="0.35"
      />
      <text x="110" y="120" text-anchor="middle" font-size="12" fill="#0f766e" font-weight="700">
        会面带
      </text>
      <text x="62" y="60" font-size="10" fill="#64748b">错过</text>
      <text x="155" y="165" font-size="10" fill="#64748b">错过</text>
      <text x="190" y="200" font-size="11" fill="#334155">x</text>
      <text x="12" y="30" font-size="11" fill="#334155">y</text>
    </svg>

    <!-- 等公交 / 降雨：线段 -->
    <svg
      v-else-if="preset === 'bus-line'"
      class="prob-geo__svg"
      viewBox="0 0 260 90"
      role="img"
    >
      <line x1="30" y1="45" x2="230" y2="45" stroke="#94a3b8" stroke-width="4" stroke-linecap="round" />
      <line x1="30" y1="45" x2="110" y2="45" stroke="#0d9488" stroke-width="8" stroke-linecap="round" />
      <circle cx="30" cy="45" r="5" fill="#0f766e" />
      <circle cx="230" cy="45" r="5" fill="#0f766e" />
      <text x="70" y="28" text-anchor="middle" font-size="12" fill="#0f766e" font-weight="700">
        有利段
      </text>
      <text x="170" y="28" text-anchor="middle" font-size="12" fill="#64748b">其余</text>
      <text x="30" y="72" text-anchor="middle" font-size="11" fill="#64748b">起点</text>
      <text x="230" y="72" text-anchor="middle" font-size="11" fill="#64748b">终点</text>
      <text x="130" y="88" text-anchor="middle" font-size="11" fill="#475569">
        P = 有利长度 ÷ 总长度
      </text>
    </svg>

    <!-- 木棒折三角 -->
    <svg
      v-else-if="preset === 'stick-triangle'"
      class="prob-geo__svg"
      viewBox="0 0 220 190"
      role="img"
    >
      <polygon points="30,160 190,160 110,30" fill="#f1f5f9" stroke="#94a3b8" stroke-width="1.5" />
      <polygon points="70,160 150,160 110,95" fill="#0d9488" opacity="0.45" />
      <text x="110" y="140" text-anchor="middle" font-size="12" fill="#0f766e" font-weight="700">
        能成三角
      </text>
      <text x="110" y="55" text-anchor="middle" font-size="11" fill="#64748b">全部折法</text>
      <text x="110" y="182" text-anchor="middle" font-size="11" fill="#475569">
        中间色块面积 = 大三角的 1/4
      </text>
    </svg>

    <!-- 正方形 x+y≤边长（半区） -->
    <svg
      v-else-if="preset === 'square-region'"
      class="prob-geo__svg"
      viewBox="0 0 220 220"
      role="img"
    >
      <!-- 轴 -->
      <line x1="40" y1="180" x2="195" y2="180" stroke="#334155" stroke-width="1.5" />
      <line x1="40" y1="180" x2="40" y2="25" stroke="#334155" stroke-width="1.5" />
      <polygon points="195,180 187,176 187,184" fill="#334155" />
      <polygon points="40,25 36,33 44,33" fill="#334155" />
      <!-- 正方形：左下 (0,0)= (40,180)，右下 (a,0)=(160,180)，左上 (0,a)=(40,60)，右上 (a,a)=(160,60) -->
      <rect x="40" y="60" width="120" height="120" fill="#f8fafc" stroke="#64748b" stroke-width="1.8" />
      <!-- 有利三角：(0,0)(a,0)(0,a) -->
      <polygon points="40,180 160,180 40,60" fill="#f59e0b" opacity="0.45" />
      <!-- 对角线 x+y=a -->
      <line x1="160" y1="180" x2="40" y2="60" stroke="#0f766e" stroke-width="2.2" />
      <text x="118" y="100" font-size="11" fill="#0f766e" font-weight="700">x+y=边长</text>
      <text x="78" y="155" text-anchor="middle" font-size="12" fill="#9a3412" font-weight="700">
        有利区
      </text>
      <text x="130" y="90" text-anchor="middle" font-size="11" fill="#64748b">不利</text>
      <text x="32" y="195" font-size="11" fill="#334155">(0,0)</text>
      <text x="155" y="195" font-size="11" fill="#334155">(边长,0)</text>
      <text x="2" y="64" font-size="11" fill="#334155">(0,边长)</text>
      <text x="190" y="195" font-size="12" fill="#334155">x</text>
      <text x="12" y="30" font-size="12" fill="#334155">y</text>
      <text x="100" y="212" text-anchor="middle" font-size="11" fill="#475569">
        橙色三角面积 = 正方形一半
      </text>
    </svg>

    <!-- 正方形小三角 x+y≤边长/2 -->
    <svg
      v-else-if="preset === 'square-region-small'"
      class="prob-geo__svg"
      viewBox="0 0 220 220"
      role="img"
    >
      <line x1="40" y1="180" x2="195" y2="180" stroke="#334155" stroke-width="1.5" />
      <line x1="40" y1="180" x2="40" y2="25" stroke="#334155" stroke-width="1.5" />
      <rect x="40" y="60" width="120" height="120" fill="#f8fafc" stroke="#64748b" stroke-width="1.8" />
      <!-- 小三角直角边约为大正方形一半：从 (40,180) 到 (100,180) 到 (40,120) -->
      <polygon points="40,180 100,180 40,120" fill="#f59e0b" opacity="0.5" />
      <line x1="100" y1="180" x2="40" y2="120" stroke="#0f766e" stroke-width="2" />
      <text x="62" y="168" text-anchor="middle" font-size="11" fill="#9a3412" font-weight="700">
        小有利区
      </text>
      <text x="32" y="195" font-size="11" fill="#334155">(0,0)</text>
      <text x="190" y="195" font-size="12" fill="#334155">x</text>
      <text x="12" y="30" font-size="12" fill="#334155">y</text>
      <text x="100" y="212" text-anchor="middle" font-size="11" fill="#475569">
        小三角直角边 = 边长/2 → 面积占 1/8
      </text>
    </svg>

    <!-- 方内圆 -->
    <svg v-else class="prob-geo__svg" viewBox="0 0 200 200" role="img">
      <rect x="40" y="40" width="120" height="120" fill="#f8fafc" stroke="#64748b" stroke-width="1.8" />
      <circle
        cx="100"
        cy="100"
        r="60"
        fill="#0d9488"
        opacity="0.35"
        stroke="#0f766e"
        stroke-width="1.8"
      />
      <text x="100" y="104" text-anchor="middle" font-size="13" fill="#0f766e" font-weight="700">
        圆内
      </text>
      <text x="100" y="185" text-anchor="middle" font-size="11" fill="#475569">
        P = 圆面积 / 正方形面积 = π/4
      </text>
    </svg>

    <p v-if="caption" class="prob-geo__caption">{{ caption }}</p>
  </div>
</template>

<style scoped>
.prob-geo {
  margin: 10px 0 4px;
  padding: 10px 12px 12px;
  border-radius: 12px;
  background: linear-gradient(160deg, #f0fdfa 0%, #f8fafc 60%, #fff7ed 100%);
  border: 1px solid color-mix(in srgb, #0d9488 22%, #e2e8f0);
  display: flex;
  flex-direction: column;
  align-items: center;
}

.prob-geo__svg {
  width: min(100%, 300px);
  height: auto;
  display: block;
}

.prob-geo__caption {
  margin: 8px 0 0;
  max-width: 320px;
  font-size: 13px;
  line-height: 1.55;
  color: #334155;
  text-align: center;
}
</style>
