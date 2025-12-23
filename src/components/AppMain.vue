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

    <el-main style="padding: 0">
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
    </el-main>
  </el-container>
</template>

<script>
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

export default {
  name: "AppMain",
  components: {
    AppHeader,
    FilterBar,
    PromptGrid,
    GenerationPanel,
    AppFooter,
    ApiKeyDialog,
    PromptDetailDialog,
    HistoryDialog,
    ImagePreviewDialog,
  },
  data() {
    return {
      categories,
      prompts,
      searchQuery: "",
      activeCategory: "all",
      apiKey: "",
      apiKeyInput: "",
      showApiKeyModal: false,
      showDetailModal: false,
      showHistoryModal: false,
      selectedPrompt: null,
      editablePrompt: "",
      uploadedImages: [],
      uploadFileList: [],
      isGenerating: false,
      generatedImage: "",
      errorMessage: "",
      imageHistory: [],
      previewImage: null,
      developerGroupQR,
      customerServiceQR,
    };
  },
  computed: {
    hasApiKey() {
      return !!this.apiKey;
    },
    filteredPrompts() {
      let result = this.prompts;

      if (this.activeCategory !== "all") {
        result = result.filter((p) => p.category === this.activeCategory);
      }

      if (this.searchQuery.trim()) {
        const query = this.searchQuery.toLowerCase();
        result = result.filter(
          (p) =>
            p.title.toLowerCase().includes(query) ||
            p.prompt.toLowerCase().includes(query) ||
            p.prompt.includes(query) ||
            p.categoryLabel.includes(query)
        );
      }

      return result;
    },
  },
  mounted() {
    const savedKey = localStorage.getItem("nano-banana-api-key");
    if (savedKey) {
      this.apiKey = savedKey;
    }
    this.loadImageHistory();
  },
  methods: {
    saveApiKey() {
      if (this.apiKeyInput.trim()) {
        this.apiKey = this.apiKeyInput.trim();
        localStorage.setItem("nano-banana-api-key", this.apiKey);
        this.showToast("API Key 已保存");
      }
      this.showApiKeyModal = false;
    },
    openPromptDetail(prompt) {
      this.selectedPrompt = prompt;
      this.showDetailModal = true;
    },
    closeDetailModal() {
      this.showDetailModal = false;
    },
    clearSelectedPrompt() {
      this.selectedPrompt = null;
      this.editablePrompt = "";
      this.uploadedImages = [];
      this.uploadFileList = [];
      this.generatedImage = "";
      this.errorMessage = "";
    },
    copyPrompt() {
      if (this.selectedPrompt) {
        navigator.clipboard
          .writeText(this.selectedPrompt.prompt)
          .then(() => this.showToast("提示词已复制到剪贴板"))
          .catch(() => this.showToast("复制失败，请手动复制"));
      }
    },
    startGeneration() {
      if (!this.hasApiKey) {
        this.showToast("请先设置 API Key");
        this.showApiKeyModal = true;
        return;
      }
      this.editablePrompt = this.selectedPrompt?.prompt || "";
      this.uploadedImages = [];
      this.uploadFileList = [];
      this.generatedImage = "";
      this.errorMessage = "";
      this.showDetailModal = false;
      this.$nextTick(() => {
        const generationSection = document.querySelector(".generation-section");
        if (generationSection) {
          generationSection.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        }
      });
    },
    async generateImage() {
      if (!this.hasApiKey) {
        this.showToast("请先设置 API Key");
        return;
      }

      if (!this.editablePrompt.trim()) {
        this.errorMessage = "请输入提示词";
        return;
      }

      this.isGenerating = true;
      this.errorMessage = "";
      this.generatedImage = "";

      try {
        const requestBody = {
          model: "nano-banana-pro",
          prompt: this.editablePrompt,
        };

        const images = this.uploadedImages.filter((img) => img);
        if (images.length > 0) {
          requestBody.image = images;
        }

        const response = await fetch(
          "https://api.chatfire.site/v1/images/generations",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${this.apiKey}`,
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
          this.generatedImage = data.data[0].url || data.data[0].b64_json;
          if (data.data[0].b64_json) {
            this.generatedImage = `data:image/png;base64,${data.data[0].b64_json}`;
          }
          this.saveToHistory();
          this.showToast("图片生成成功！");
        } else {
          throw new Error("未能获取生成的图片");
        }
      } catch (error) {
        this.errorMessage = error.message || "生成失败，请稍后重试";
      } finally {
        this.isGenerating = false;
      }
    },
    loadImageHistory() {
      try {
        const history = localStorage.getItem("nano-banana-history");
        if (history) {
          this.imageHistory = JSON.parse(history);
        }
      } catch (e) {
        this.imageHistory = [];
      }
    },
    saveToHistory() {
      if (!this.generatedImage || !this.selectedPrompt) return;

      const historyItem = {
        title: this.selectedPrompt.title,
        prompt: this.editablePrompt,
        image: this.generatedImage,
        timestamp: Date.now(),
      };

      this.imageHistory.unshift(historyItem);
      if (this.imageHistory.length > 50) {
        this.imageHistory = this.imageHistory.slice(0, 50);
      }

      try {
        localStorage.setItem(
          "nano-banana-history",
          JSON.stringify(this.imageHistory)
        );
      } catch (e) {
        if (this.imageHistory.length > 10) {
          this.imageHistory = this.imageHistory.slice(0, 10);
          localStorage.setItem(
            "nano-banana-history",
            JSON.stringify(this.imageHistory)
          );
        }
      }
    },
    deleteHistoryItem(index) {
      this.imageHistory.splice(index, 1);
      localStorage.setItem(
        "nano-banana-history",
        JSON.stringify(this.imageHistory)
      );
      this.showToast("已删除");
    },
    clearHistory() {
      ElMessageBox.confirm("确定要清空所有历史记录吗？", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(() => {
          this.imageHistory = [];
          localStorage.removeItem("nano-banana-history");
          this.showToast("历史记录已清空");
        })
        .catch(() => {});
    },
    viewHistoryImage(item) {
      this.previewImage = item.image;
    },
    showToast(message) {
      ElMessage({
        message,
        duration: 2000,
      });
    },
    downloadImage() {
      if (!this.generatedImage) return;

      const link = document.createElement("a");
      link.href = this.generatedImage;
      link.download = `nano-banana-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      this.showToast("图片下载中...");
    },
  },
};
</script>
