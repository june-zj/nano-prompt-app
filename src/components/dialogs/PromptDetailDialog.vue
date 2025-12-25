<template>
  <BaseModal
    :model-value="modelValue"
    @update:modelValue="$emit('update:modelValue', $event)"
    :title="prompt?.title || ''"
    width="800px"
    @close="$emit('close')"
  >
    <el-image
      :src="prompt?.image"
      :alt="prompt?.title"
      fit="contain"
      style="
        width: 100%;
        height: 360px;
        background: #f8f8f8;
        border-radius: 12px;
      "
    />

    <div style="margin-top: 16px">
      <div class="prompt-label">提示词</div>
      <el-input
        :model-value="prompt?.prompt || ''"
        type="textarea"
        :autosize="{ minRows: 4, maxRows: 12 }"
        readonly
      />
    </div>

    <template #footer>
      <el-button @click="$emit('copy')">复制提示词</el-button>
      <el-button type="primary" @click="$emit('start-generation')"
        >做同款</el-button
      >
    </template>
  </BaseModal>
</template>

<script setup>
import BaseModal from "../BaseModal.vue";

defineOptions({ name: "PromptDetailDialog" });

defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  prompt: {
    type: Object,
    default: null,
  },
});

defineEmits(["update:modelValue", "close", "copy", "start-generation"]);
</script>
