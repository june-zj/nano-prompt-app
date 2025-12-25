<template>
  <!-- Generation Area (above filters) -->
  <section class="generation-section" v-if="show">
    <div class="container">
      <el-card class="generation-panel" shadow="never" v-loading="isGenerating">
        <div class="generation-header">
          <div class="generation-title">
            <span class="generation-badge">做同款</span>
            <h3>{{ selectedPrompt?.title }}</h3>
          </div>
          <el-button circle @click="$emit('close')">×</el-button>
        </div>

        <div class="generation-content">
          <!-- Left: Image upload (always available, up to 5 images) -->
          <div class="generation-left">
            <div class="prompt-label">上传参考图片（可选，最多5张）</div>
            <el-upload
              action="#"
              list-type="picture-card"
              :auto-upload="false"
              :limit="5"
              accept="image/*"
              :file-list="fileList"
              :on-change="handleUploadChange"
              :on-remove="handleUploadRemove"
              :on-preview="handleUploadPreview"
            >
              <div style="font-size: 20px; line-height: 1">+</div>
              <div style="font-size: 12px; margin-top: 6px">添加图片</div>
            </el-upload>
          </div>

          <!-- Right: Prompt and generate -->
          <div class="generation-right">
            <div class="prompt-edit-section">
              <div class="prompt-label">编辑提示词</div>
              <el-input
                :model-value="editablePrompt"
                @update:modelValue="$emit('update:editablePrompt', $event)"
                type="textarea"
                :autosize="{ minRows: 4, maxRows: 12 }"
                placeholder="输入或编辑提示词..."
              />
            </div>

            <el-alert
              v-if="errorMessage"
              :title="errorMessage"
              type="error"
              show-icon
              :closable="false"
              style="margin-top: 12px"
            />

            <div class="result-section" v-if="generatedImage">
              <div class="prompt-label">生成结果</div>
              <div class="result-image-wrapper">
                <img
                  :src="generatedImage"
                  alt="生成的图片"
                  class="result-image-thumb"
                  @click="$emit('preview', generatedImage)"
                />
                <div class="result-actions">
                  <el-button @click="$emit('preview', generatedImage)"
                    >查看大图</el-button
                  >
                  <el-button type="primary" @click="$emit('download')"
                    >下载图片</el-button
                  >
                </div>
              </div>
            </div>

            <div class="generation-actions">
              <el-button
                type="primary"
                @click="$emit('generate')"
                :loading="isGenerating"
                :disabled="!hasApiKey"
                style="width: 100%"
              >
                开始生成
              </el-button>
            </div>
          </div>
        </div>
      </el-card>
    </div>
  </section>
</template>

<script setup>
defineOptions({ name: "GenerationPanel" });

defineProps({
  show: {
    type: Boolean,
    default: false,
  },
  selectedPrompt: {
    type: Object,
    default: null,
  },
  editablePrompt: {
    type: String,
    default: "",
  },
  fileList: {
    type: Array,
    default: () => [],
  },
  isGenerating: {
    type: Boolean,
    default: false,
  },
  generatedImage: {
    type: String,
    default: "",
  },
  errorMessage: {
    type: String,
    default: "",
  },
  hasApiKey: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits([
  "close",
  "generate",
  "download",
  "preview",
  "update:editablePrompt",
  "update:fileList",
  "images-change",
]);

function syncImages(fileList) {
  emit("update:fileList", fileList);
  emit("images-change", fileList.map((f) => f.url).filter(Boolean));
}

function handleUploadChange(file, fileList) {
  const raw = file?.raw;
  if (!raw) {
    syncImages(fileList);
    return;
  }

  const reader = new FileReader();
  reader.onload = (e) => {
    file.url = e.target?.result;
    syncImages(fileList);
  };
  reader.readAsDataURL(raw);
}

function handleUploadRemove(file, fileList) {
  syncImages(fileList);
}

function handleUploadPreview(file) {
  if (file?.url) {
    emit("preview", file.url);
  }
}
</script>
