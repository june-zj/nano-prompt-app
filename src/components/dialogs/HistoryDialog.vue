<template>
  <el-dialog
    :model-value="modelValue"
    @update:modelValue="$emit('update:modelValue', $event)"
    title="生成历史记录"
    append-to-body
  >
    <div v-if="items.length > 0" class="history-grid">
      <div
        v-for="(item, index) in items"
        :key="item?.timestamp || index"
        class="history-item"
        @click="$emit('preview', item)"
      >
        <el-image :src="item.image" class="history-thumb" />

        <div class="history-actions" @click.stop>
          <el-button
            link
            size="small"
            class="history-action-btn"
            @click="downloadItem(item)"
          >
            <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
              <path
                fill="currentColor"
                d="M12 3a1 1 0 0 1 1 1v8.59l2.3-2.3a1 1 0 1 1 1.4 1.42l-4.01 4a1 1 0 0 1-1.38.02l-4.02-4a1 1 0 1 1 1.41-1.42L11 12.6V4a1 1 0 0 1 1-1Zm-7 14a1 1 0 0 1 1 1v1h12v-1a1 1 0 1 1 2 0v2a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-2a1 1 0 0 1 1-1Z"
              />
            </svg>
          </el-button>

          <el-button
            link
            size="small"
            type="danger"
            class="history-action-btn"
            @click="$emit('delete', index)"
          >
            <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
              <path
                fill="currentColor"
                d="M9 3a1 1 0 0 0-1 1v1H5a1 1 0 1 0 0 2h1v13a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V7h1a1 1 0 1 0 0-2h-3V4a1 1 0 0 0-1-1H9Zm1 2h4v0h-4ZM8 7h8v13H8V7Zm3 3a1 1 0 0 1 1 1v6a1 1 0 1 1-2 0v-6a1 1 0 0 1 1-1Zm4 0a1 1 0 0 1 1 1v6a1 1 0 1 1-2 0v-6a1 1 0 0 1 1-1Z"
              />
            </svg>
          </el-button>
        </div>
      </div>
    </div>

    <el-empty v-else description="暂无生成记录" />

    <!-- <template #footer>
      <el-button v-if="items.length > 0" @click="$emit('clear')"
        >清空历史</el-button
      >
      <el-button type="primary" @click="$emit('update:modelValue', false)"
        >关闭</el-button
      >
    </template> -->
  </el-dialog>
</template>

<script setup>
defineOptions({ name: "HistoryDialog" });

defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  items: {
    type: Array,
    default: () => [],
  },
});

defineEmits(["update:modelValue", "preview", "delete", "clear"]);

function dataUrlToBlob(dataUrl) {
  const [meta, base64] = dataUrl.split(",");
  const mime =
    meta.match(/data:(.*?);base64/)?.[1] || "application/octet-stream";
  const binary = atob(base64);
  const len = binary.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i += 1) bytes[i] = binary.charCodeAt(i);
  return new Blob([bytes], { type: mime });
}

async function downloadItem(item) {
  const url = item?.image;
  if (!url) return;

  const filename = `nano-banana-${item?.timestamp || Date.now()}.png`;

  try {
    let blob;

    if (url.startsWith("data:")) {
      blob = dataUrlToBlob(url);
    } else {
      const res = await fetch(url, { mode: "cors" });
      if (!res.ok) throw new Error(`fetch failed: ${res.status}`);
      blob = await res.blob();
    }

    const objectUrl = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = objectUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(objectUrl);
  } catch (e) {
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
</script>

<style scoped>
.history-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 12px;
  overflow: auto;
  padding: 2px;
}

.history-item {
  position: relative;
  cursor: pointer;
}

.history-thumb {
  width: 100%;
  aspect-ratio: 1 / 1;
  display: block;
  border-radius: 10px;
  overflow: hidden;
}

.history-thumb :deep(img),
.history-thumb :deep(.el-image__inner) {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.history-actions {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-top: 6px;
  background: #fff;
  width: 100%;
  height: 30px;
  position: absolute;
  bottom: 0;
  opacity: 0;
  transition: opacity 0.3s ease-in-out;
}

.history-item:hover .history-actions {
  opacity: 0.8;
}

.history-action-btn {
  padding: 0;
}

@media (max-width: 900px) {
  .history-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}

@media (max-width: 680px) {
  .history-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 480px) {
  .history-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
