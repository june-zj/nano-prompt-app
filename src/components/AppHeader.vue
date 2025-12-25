<template>
  <!-- Header -->
  <header class="header">
    <div class="container header-content">
      <div class="logo">Nano <span>Banana</span> Pro</div>

      <div class="search-wrapper">
        <el-input
          :model-value="searchQuery"
          placeholder="搜索提示词、作者..."
          clearable
          @update:modelValue="$emit('update:searchQuery', $event)"
        >
          <template #prefix>🔍</template>
        </el-input>
      </div>

      <div class="header-actions">
        <el-space>
          <el-button v-if="showHistory" @click="$emit('open-history')">
            <span class="hide-mobile">历史记录</span>
          </el-button>
          <el-button
            type="primary"
            :plain="hasApiKey"
            @click="$emit('open-api-key')"
          >
            <span class="hide-mobile">{{
              hasApiKey ? "API Key 已设置" : "设置 API Key"
            }}</span>
          </el-button>
        </el-space>
      </div>
    </div>
  </header>
</template>

<script setup>
defineOptions({ name: "AppHeader" });

defineProps({
  searchQuery: {
    type: String,
    default: "",
  },
  hasApiKey: {
    type: Boolean,
    default: false,
  },
  showHistory: {
    type: Boolean,
    default: false,
  },
});

defineEmits(["update:searchQuery", "open-history", "open-api-key"]);
</script>
