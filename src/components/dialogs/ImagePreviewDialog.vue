<template>
  <el-dialog
    :model-value="modelValue"
    @update:modelValue="$emit('update:modelValue', $event)"
    title="图片预览"
    class="preview-modal"
    append-to-body
  >
    <el-image :src="image" alt="预览图片" fit="contain" class="preview-image" />
  </el-dialog>
</template>

<script setup>
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

<style scoped>
.preview-image {
  text-align: center;
}

.preview-image :deep(.el-image__inner) {
  max-height: 600px;
}
</style>
