<template>
  <!-- Cards Grid -->
  <section class="cards-section">
    <div class="container">
      <div v-if="prompts.length > 0" ref="gridRef" class="masonry-grid">
        <div
          v-for="item in prompts"
          :key="item.id"
          :ref="setItemRef"
          class="masonry-grid-item"
        >
          <el-card shadow="hover" @click="$emit('select', item)">
            <el-image
              :src="item.image"
              :alt="item.title"
              fit="contain"
              loading="lazy"
              @load="scheduleRefreshLayout"
              @error="scheduleRefreshLayout"
              style="width: 100%"
            />
            <div style="margin-top: 12px">
              <div class="card-title">{{ item.title }}</div>
            </div>
          </el-card>
        </div>
      </div>

      <el-empty v-else description="没有找到匹配的提示词" />
    </div>
  </section>
</template>

<script setup>
import {
  nextTick,
  onBeforeUnmount,
  onBeforeUpdate,
  onMounted,
  watch,
  ref,
} from "vue";

defineOptions({ name: "PromptGrid" });

const props = defineProps({
  prompts: {
    type: Array,
    default: () => [],
  },
});

defineEmits(["select"]);

const gridRef = ref(null);
const itemRefs = ref([]);
let resizeObserver;
let rafId = 0;

function setItemRef(el) {
  if (el) itemRefs.value.push(el);
}

function setSpanForItem(el) {
  const gridEl = gridRef.value;
  if (!gridEl) return;

  const styles = window.getComputedStyle(gridEl);
  const rowHeight =
    Number.parseFloat(styles.getPropertyValue("grid-auto-rows")) || 8;
  const rowGap = Number.parseFloat(styles.getPropertyValue("row-gap")) || 0;

  const height = el.offsetHeight;
  const span = Math.max(1, Math.ceil((height + rowGap) / (rowHeight + rowGap)));
  el.style.gridRowEnd = `span ${span}`;
}

async function refreshLayout() {
  await nextTick();

  if (!resizeObserver) return;
  resizeObserver.disconnect();
  for (const el of itemRefs.value) {
    setSpanForItem(el);
    resizeObserver.observe(el);
  }
}

function scheduleRefreshLayout() {
  if (rafId) cancelAnimationFrame(rafId);
  rafId = requestAnimationFrame(() => {
    rafId = 0;
    refreshLayout();
  });
}

onBeforeUpdate(() => {
  itemRefs.value = [];
});

onMounted(() => {
  resizeObserver = new ResizeObserver((entries) => {
    for (const entry of entries) {
      setSpanForItem(entry.target);
    }
  });

  scheduleRefreshLayout();
});

watch(
  () => props.prompts,
  () => {
    scheduleRefreshLayout();
  }
);

onBeforeUnmount(() => {
  if (rafId) cancelAnimationFrame(rafId);
  resizeObserver?.disconnect();
});
</script>

<style scoped>
.masonry-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  grid-auto-rows: 8px;
  gap: 14px;
  align-items: start;
}

.masonry-grid-item {
  width: 100%;
  align-self: start;
}

@media (max-width: 520px) {
  .masonry-grid {
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  }
}
</style>
