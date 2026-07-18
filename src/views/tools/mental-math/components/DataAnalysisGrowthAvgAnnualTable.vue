<script setup lang="ts">
import type { GrowthAvgAnnualTableSpec } from '@/utils/dataAnalysisGrowthAvgAnnualPractice'

defineProps<{
  table: GrowthAvgAnnualTableSpec
}>()
</script>

<template>
  <figure class="iy-table">
    <figcaption class="iy-table__title">
      {{ table.title
      }}<span v-if="table.unit" class="iy-table__unit">（单位：{{ table.unit }}）</span>
    </figcaption>
    <div class="iy-table__wrap">
      <table>
        <thead>
          <tr>
            <th v-for="(c, i) in table.columns" :key="i">{{ c }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(row, ri) in table.rows" :key="ri">
            <td v-for="(cell, ci) in row" :key="ci">{{ cell }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </figure>
</template>

<style scoped>
.iy-table {
  margin: 0.75rem 0 1rem;
  padding: 0.65rem 0.75rem;
  background: linear-gradient(160deg, #f7f4ef 0%, #eef3f6 55%, #f3ebe3 100%);
  border: 1px solid rgba(196, 92, 38, 0.16);
  border-radius: 8px;
}

.iy-table__title {
  margin: 0 0 0.45rem;
  font-size: 0.92rem;
  font-weight: 650;
  color: #2a2f36;
}

.iy-table__unit {
  margin-left: 0.35rem;
  font-size: 0.82rem;
  font-weight: 500;
  color: #64748b;
}

.iy-table__wrap {
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
  color: #1e293b;
}

th,
td {
  border: 1px solid rgba(196, 92, 38, 0.18);
  padding: 6px 10px;
  text-align: center;
}

th {
  background: rgba(196, 92, 38, 0.1);
  font-weight: 650;
}

td:first-child,
th:first-child {
  font-weight: 600;
}
</style>
