<template>
  <el-container class="app" direction="vertical">
    <!-- Header -->
    <el-header height="auto" style="padding: 0">
      <AppHeader
        :search-query="searchQuery"
        :has-api-key="hasApiKey"
        :show-history="imageHistory.length > 0"
        @update:searchQuery="searchQuery = $event"
        @open-history="showHistoryModal = true"
        @open-api-key="showApiKeyModal = true"
      />
    </el-header>

    <el-main style="padding: 0; height: calc(100vh - 32px)">
      <GenerationPanel
        :show="!!selectedPrompt && !showDetailModal"
        :selected-prompt="selectedPrompt"
        :editable-prompt="editablePrompt"
        :file-list="uploadFileList"
        :is-generating="isGenerating"
        :generated-image="generatedImage"
        :error-message="errorMessage"
        :has-api-key="hasApiKey"
        @close="clearSelectedPrompt"
        @update:editablePrompt="editablePrompt = $event"
        @update:fileList="uploadFileList = $event"
        @images-change="uploadedImages = $event"
        @generate="generateImage"
        @download="downloadImage"
        @preview="previewImage = $event"
      />

      <FilterBar v-model="activeCategory" :categories="categories" />

      <PromptGrid :prompts="filteredPrompts" @select="openPromptDetail" />

      <el-footer style="padding: 0">
        <AppFooter
          :developer-group-q-r="developerGroupQR"
          :customer-service-q-r="customerServiceQR"
        />
      </el-footer>
    </el-main>

    <ApiKeyDialog
      v-model="showApiKeyModal"
      :api-key-input="apiKeyInput"
      @update:apiKeyInput="apiKeyInput = $event"
      @save="saveApiKey"
    />

    <PromptDetailDialog
      v-model="showDetailModal"
      :prompt="selectedPrompt"
      @close="closeDetailModal"
      @copy="copyPrompt"
      @start-generation="startGeneration"
    />

    <HistoryDialog
      v-model="showHistoryModal"
      :items="imageHistory"
      @preview="viewHistoryImage"
      @delete="deleteHistoryItem"
      @clear="clearHistory"
    />

    <ImagePreviewDialog
      :model-value="!!previewImage"
      :image="previewImage || ''"
      @update:modelValue="
        (v) => {
          if (!v) previewImage = null;
        }
      "
    />
  </el-container>
</template>

<script setup>
import { computed, nextTick, onMounted, ref } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { categories, prompts } from "../data/prompts.js";
import developerGroupQR from "../assets/qrcode/developer-group.png";
import customerServiceQR from "../assets/qrcode/customer-service.png";

import AppHeader from "./AppHeader.vue";
import FilterBar from "./FilterBar.vue";
import PromptGrid from "./PromptGrid.vue";
import GenerationPanel from "./GenerationPanel.vue";
import AppFooter from "./AppFooter.vue";
import ApiKeyDialog from "./dialogs/ApiKeyDialog.vue";
import PromptDetailDialog from "./dialogs/PromptDetailDialog.vue";
import HistoryDialog from "./dialogs/HistoryDialog.vue";
import ImagePreviewDialog from "./dialogs/ImagePreviewDialog.vue";

defineOptions({ name: "AppMain" });

const searchQuery = ref("");
const activeCategory = ref("all");
const apiKey = ref("");
const apiKeyInput = ref("");

const showApiKeyModal = ref(false);
const showDetailModal = ref(false);
const showHistoryModal = ref(false);

const selectedPrompt = ref(null);
const editablePrompt = ref("");
const uploadedImages = ref([]);
const uploadFileList = ref([]);

const isGenerating = ref(false);
const generatedImage = ref("");
const errorMessage = ref("");

const imageHistory = ref([]);
const previewImage = ref(null);

const hasApiKey = computed(() => !!apiKey.value);

const filteredPrompts = computed(() => {
  let result = prompts;

  if (activeCategory.value !== "all") {
    result = result.filter((p) => p.category === activeCategory.value);
  }

  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase();
    result = result.filter(
      (p) =>
        p.title.toLowerCase().includes(query) ||
        p.prompt.toLowerCase().includes(query) ||
        p.prompt.includes(query) ||
        p.categoryLabel.includes(query)
    );
  }

  return result;
});

onMounted(() => {
  const savedKey = localStorage.getItem("nano-banana-api-key");
  if (savedKey) {
    apiKey.value = savedKey;
  }
  loadImageHistory();
});

function showToast(message) {
  ElMessage({
    message,
    duration: 2000,
  });
}

function saveApiKey() {
  if (apiKeyInput.value.trim()) {
    apiKey.value = apiKeyInput.value.trim();
    localStorage.setItem("nano-banana-api-key", apiKey.value);
    showToast("API Key 已保存");
  }
  showApiKeyModal.value = false;
}

function openPromptDetail(prompt) {
  selectedPrompt.value = prompt;
  showDetailModal.value = true;
}

function closeDetailModal() {
  showDetailModal.value = false;
}

function clearSelectedPrompt() {
  selectedPrompt.value = null;
  editablePrompt.value = "";
  uploadedImages.value = [];
  uploadFileList.value = [];
  generatedImage.value = "";
  errorMessage.value = "";
}

function copyPrompt() {
  if (!selectedPrompt.value) return;

  navigator.clipboard
    .writeText(selectedPrompt.value.prompt)
    .then(() => showToast("提示词已复制到剪贴板"))
    .catch(() => showToast("复制失败，请手动复制"));
}

function startGeneration() {
  if (!hasApiKey.value) {
    showToast("请先设置 API Key");
    showApiKeyModal.value = true;
    return;
  }

  editablePrompt.value = selectedPrompt.value?.prompt || "";
  uploadedImages.value = [];
  uploadFileList.value = [];
  generatedImage.value = "";
  errorMessage.value = "";
  showDetailModal.value = false;

  nextTick(() => {
    const generationSection = document.querySelector(".generation-section");
    if (generationSection) {
      generationSection.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  });
}

async function generateImage() {
  if (!hasApiKey.value) {
    showToast("请先设置 API Key");
    return;
  }

  if (!editablePrompt.value.trim()) {
    errorMessage.value = "请输入提示词";
    return;
  }

  isGenerating.value = true;
  errorMessage.value = "";
  generatedImage.value = "";

  try {
    const requestBody = {
      model: "nano-banana-pro",
      prompt: editablePrompt.value,
    };

    const images = uploadedImages.value.filter(Boolean);
    if (images.length > 0) {
      requestBody.image = images;
    }

    const response = await fetch(
      "https://api.chatfire.site/v1/images/generations",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey.value}`,
        },
        body: JSON.stringify(requestBody),
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.error?.message || `请求失败: ${response.status}`
      );
    }

    const data = await response.json();

    if (data.data && data.data[0]) {
      generatedImage.value = data.data[0].url || data.data[0].b64_json;
      if (data.data[0].b64_json) {
        generatedImage.value = `data:image/png;base64,${data.data[0].b64_json}`;
      }
      saveToHistory();
      showToast("图片生成成功！");
    } else {
      throw new Error("未能获取生成的图片");
    }
  } catch (error) {
    errorMessage.value = error?.message || "生成失败，请稍后重试";
  } finally {
    isGenerating.value = false;
  }
}

function loadImageHistory() {
  try {
    const history = localStorage.getItem("nano-banana-history");
    if (history) {
      imageHistory.value = JSON.parse(history);
    }
  } catch (e) {
    imageHistory.value = [];
  }
}

function saveToHistory() {
  if (!generatedImage.value || !selectedPrompt.value) return;

  const historyItem = {
    title: selectedPrompt.value.title,
    prompt: editablePrompt.value,
    image: generatedImage.value,
    timestamp: Date.now(),
  };

  imageHistory.value.unshift(historyItem);
  if (imageHistory.value.length > 50) {
    imageHistory.value = imageHistory.value.slice(0, 50);
  }

  try {
    localStorage.setItem(
      "nano-banana-history",
      JSON.stringify(imageHistory.value)
    );
  } catch (e) {
    if (imageHistory.value.length > 10) {
      imageHistory.value = imageHistory.value.slice(0, 10);
      localStorage.setItem(
        "nano-banana-history",
        JSON.stringify(imageHistory.value)
      );
    }
  }
}

function deleteHistoryItem(index) {
  imageHistory.value.splice(index, 1);
  localStorage.setItem(
    "nano-banana-history",
    JSON.stringify(imageHistory.value)
  );
  showToast("已删除");
}

function clearHistory() {
  ElMessageBox.confirm("确定要清空所有历史记录吗？", "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  })
    .then(() => {
      imageHistory.value = [];
      localStorage.removeItem("nano-banana-history");
      showToast("历史记录已清空");
    })
    .catch(() => {});
}

function viewHistoryImage(item) {
  previewImage.value = item.image;
}

function downloadImage() {
  if (!generatedImage.value) return;

  const link = document.createElement("a");
  link.href = generatedImage.value;
  link.download = `nano-banana-${Date.now()}.png`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  showToast("图片下载中...");
}
</script>
