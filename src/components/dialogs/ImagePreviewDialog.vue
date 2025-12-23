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

<script>
import BaseModal from "../BaseModal.vue";

export default {
  name: "ImagePreviewDialog",
  components: {
    BaseModal,
  },
  props: {
    modelValue: {
      type: Boolean,
      default: false,
    },
    image: {
      type: String,
      default: "",
    },
  },
  emits: ["update:modelValue"],
};
</script>
