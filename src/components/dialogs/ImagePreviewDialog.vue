<template>
  <BaseModal
    :model-value="modelValue"
    @update:modelValue="$emit('update:modelValue', $event)"
    title="图片预览"
    width="90vw"
    modal-class="preview-modal"
  >
    <el-image
      :src="image"
      alt="预览图片"
      fit="contain"
      style="width: 100%; max-height: 80vh"
    />
  </BaseModal>
</template>

<script setup>
import BaseModal from "../BaseModal.vue";

defineOptions({ name: "ImagePreviewDialog" });

defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  image: {
    type: String,
    default: "",
  },
});

defineEmits(["update:modelValue"]);
</script>
