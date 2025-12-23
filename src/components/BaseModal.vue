<template>
  <el-dialog
    :model-value="modelValue"
    @update:modelValue="$emit('update:modelValue', $event)"
    @closed="$emit('close')"
    :title="title"
    :width="width"
    :close-on-click-modal="closeOnOverlay"
    :append-to-body="appendToBody"
    :class="modalClass"
  >
    <template v-if="$slots.header" #header>
      <slot name="header" />
    </template>

    <slot />

    <template v-if="$slots.footer" #footer>
      <slot name="footer" />
    </template>
  </el-dialog>
</template>

<script>
export default {
  name: "BaseModal",
  props: {
    modelValue: {
      type: Boolean,
      default: false,
    },
    title: {
      type: String,
      default: "",
    },
    width: {
      type: [String, Number],
      default: "800px",
    },
    modalClass: {
      type: [String, Array, Object],
      default: "",
    },
    closeOnOverlay: {
      type: Boolean,
      default: true,
    },
    appendToBody: {
      type: Boolean,
      default: true,
    },
  },
  emits: ["update:modelValue", "close"],
};
</script>
